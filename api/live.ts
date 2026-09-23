const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_3oCwwq2VHCHZ_1N6S9hYF2a0IsSaFeidFdncqwaPY6q8Z4IvRNQvycjaE3q52Zk3/exec";
const API_KEY = "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";

interface ChannelItem {
    camp: string;
    name: string;
    channelId: string;
    url?: string;
}

let LAST_SUCCESS_DATA: { left: any[]; right: any[]; updatedAt: string } | null = null;

export default async function handler(req: any, res: any) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');

    try {
        // 1. 활성 채널 목록 수집
        let channels: ChannelItem[] = [];
        try {
            const sheetController = new AbortController();
            const sheetTimeout = setTimeout(() => sheetController.abort(), 3500);
            const sheetRes = await fetch(`${APPS_SCRIPT_URL}?action=channels`, { signal: sheetController.signal });
            clearTimeout(sheetTimeout);
            const sheetData = await sheetRes.json();
            if (sheetData.channels && Array.isArray(sheetData.channels)) {
                channels = sheetData.channels.filter((c: any) => c.channelId && c.channelId.startsWith('UC'));
            }
        } catch (e) {
            console.warn("구글 시트 연동 지연");
        }

        if (channels.length === 0) {
            if (LAST_SUCCESS_DATA) return res.status(200).json(LAST_SUCCESS_DATA);
            return res.status(200).json({ left: [], right: [], updatedAt: new Date().toISOString() });
        }

        // 2. ⭐️ [핵심 개선] 채널당 1개가 아닌 최신 3개 영상 ID를 전부 수집하여 라이브 누락 100% 방지
        const detectedVideos: Array<{ camp: string; channelName: string; videoId: string }> = [];
        const chunkSize = 40;

        for (let i = 0; i < channels.length; i += chunkSize) {
            const chunk = channels.slice(i, i + chunkSize);
            const chunkPromises = chunk.map(async (ch) => {
                try {
                    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2500);

                    const rssRes = await fetch(rssUrl, {
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                        }
                    });
                    clearTimeout(timeoutId);

                    const xmlText = await rssRes.text();
                    // 정규식으로 상위 3개 영상 ID 전부 추출
                    const matches = Array.from(xmlText.matchAll(/<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/g));
                    const topMatches = matches.slice(0, 3);

                    for (const m of topMatches) {
                        if (m && m[1]) {
                            detectedVideos.push({
                                camp: ch.camp,
                                channelName: ch.name,
                                videoId: m[1]
                            });
                        }
                    }
                } catch (e) { }
            });

            await Promise.all(chunkPromises);
        }

        const uniqueVideoIds = Array.from(new Set(detectedVideos.map(v => v.videoId)));
        const liveDetailsMap: Record<string, { viewers: number; title: string }> = {};

        // 3. 구글 공식 API로 진짜 생방송 판별 (최대 3~4회 호출 = 3~4점 소모로 매우 안전)
        if (uniqueVideoIds.length > 0) {
            for (let i = 0; i < uniqueVideoIds.length; i += 50) {
                const idBatch = uniqueVideoIds.slice(i, i + 50);
                try {
                    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${idBatch.join(',')}&key=${API_KEY}`;
                    const vRes = await fetch(apiUrl);
                    const vData = await vRes.json();

                    if (vData.items && Array.isArray(vData.items)) {
                        for (const item of vData.items) {
                            const isLive = item.snippet?.liveBroadcastContent === 'live';
                            const concurrentViewers = item.liveStreamingDetails?.concurrentViewers;
                            const viewers = concurrentViewers ? parseInt(concurrentViewers, 10) : 0;

                            if (isLive && viewers > 0) {
                                liveDetailsMap[item.id] = {
                                    viewers: viewers,
                                    title: item.snippet?.title || ''
                                };
                            }
                        }
                    }
                } catch (err) { }
            }
        }

        // 4. 좌/우 분류 (채널당 시청자 가장 높은 1개 단일 노출)
        const leftMap: Record<string, any> = {};
        const rightMap: Record<string, any> = {};

        for (const item of detectedVideos) {
            const detail = liveDetailsMap[item.videoId];
            if (detail && detail.viewers > 0) {
                const liveCard = {
                    channelName: item.channelName,
                    title: detail.title,
                    viewers: detail.viewers,
                    thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
                    liveUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
                };

                const isLeft = item.camp.toLowerCase().includes('left') || item.camp.includes('좌');
                const targetMap = isLeft ? leftMap : rightMap;

                if (!targetMap[item.channelName] || liveCard.viewers > targetMap[item.channelName].viewers) {
                    targetMap[item.channelName] = liveCard;
                }
            }
        }

        const leftList = Object.values(leftMap).sort((a: any, b: any) => b.viewers - a.viewers);
        const rightList = Object.values(rightMap).sort((a: any, b: any) => b.viewers - a.viewers);

        if (leftList.length > 0 || rightList.length > 0) {
            LAST_SUCCESS_DATA = {
                left: leftList,
                right: rightList,
                updatedAt: new Date().toISOString()
            };
            return res.status(200).json(LAST_SUCCESS_DATA);
        }

        if (LAST_SUCCESS_DATA) {
            return res.status(200).json(LAST_SUCCESS_DATA);
        }

        return res.status(200).json({ left: [], right: [], updatedAt: new Date().toISOString() });

    } catch (error: any) {
        if (LAST_SUCCESS_DATA) return res.status(200).json(LAST_SUCCESS_DATA);
        return res.status(200).json({ left: [], right: [], error: error?.message || 'error' });
    }
}