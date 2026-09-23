// ⭐️ 구글 시트 웹앱 주소 (활성 채널 목록 실시간 조회용)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_3oCwwq2VHCHZ_1N6S9hYF2a0IsSaFeidFdncqwaPY6q8Z4IvRNQvycjaE3q52Zk3/exec";
const API_KEY = "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";

interface ChannelItem {
    camp: string;
    name: string;
    channelId: string;
    url?: string;
}

export default async function handler(req: any, res: any) {
    // ⭐️ 1분 실시간 캐시: 방문자는 0.05초 만에 즉시 보고, 60초마다 백그라운드 최신 갱신
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');

    try {
        // 1. 구글 시트에서 [활성 채널] 명단 가져오기
        let channels: ChannelItem[] = [];
        try {
            const sheetRes = await fetch(`${APPS_SCRIPT_URL}?action=channels`);
            const sheetData = await sheetRes.json();
            if (sheetData.channels && Array.isArray(sheetData.channels)) {
                channels = sheetData.channels.filter((c: any) => c.channelId && c.channelId.startsWith('UC'));
            }
        } catch (e) {
            console.error("구글 시트 연동 에러:", e);
        }

        if (channels.length === 0) {
            return res.status(200).json({ left: [], right: [], updatedAt: new Date().toISOString() });
        }

        // 2. [1단계: 비용 0점] 각 채널의 유튜브 공식 무료 RSS 피드에서 최신 영상 ID 수집
        // 유튜브 방화벽 차단을 완벽 방지하기 위해 20개씩 묶어서(Chunk) 부드럽게 병렬 처리
        const detectedVideos: Array<{ camp: string; channelName: string; videoId: string }> = [];
        const chunkSize = 20;

        for (let i = 0; i < channels.length; i += chunkSize) {
            const chunk = channels.slice(i, i + chunkSize);
            const chunkPromises = chunk.map(async (ch) => {
                try {
                    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3500);

                    const rssRes = await fetch(rssUrl, {
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                        }
                    });
                    clearTimeout(timeoutId);

                    const xmlText = await rssRes.text();
                    // 최신 영상 ID 추출 (<yt:videoId>XXXX</yt:videoId>)
                    const match = xmlText.match(/<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/);
                    if (match && match[1]) {
                        return {
                            camp: ch.camp,
                            channelName: ch.name,
                            videoId: match[1]
                        };
                    }
                } catch (e) { }
                return null;
            });

            const results = await Promise.all(chunkPromises);
            for (const r of results) {
                if (r) detectedVideos.push(r);
            }
        }

        const uniqueVideoIds = Array.from(new Set(detectedVideos.map(v => v.videoId)));

        // 3. [2단계: 비용 단 2점] 구글 공식 videos API로 50개씩 묶어서 '진짜 생방송'과 시청자 수 조회
        // ⭐️ 0명짜리 예약 대기방(upcoming) 및 지난 녹화영상(none) 100% 자동 필터링
        const liveDetailsMap: Record<string, { viewers: number; title: string }> = {};

        if (uniqueVideoIds.length > 0) {
            for (let i = 0; i < uniqueVideoIds.length; i += 50) {
                const idBatch = uniqueVideoIds.slice(i, i + 50);
                try {
                    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${idBatch.join(',')}&key=${API_KEY}`;
                    const vRes = await fetch(apiUrl);
                    const vData = await vRes.json();

                    if (vData.items && Array.isArray(vData.items)) {
                        for (const item of vData.items) {
                            // ⭐️ 핵심: 현재 실시간 방송(live) 중이며, 시청자가 1명 이상인 경우만 합격!
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
                } catch (err) {
                    console.error("유튜브 API 영상 조회 오류:", err);
                }
            }
        }

        // 4. 좌/우 진영 분류 및 채널당 1개 단일 노출 (시청자 최고치)
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

        // 시청자 수 기준 내림차순 정렬 (1위가 맨 위)
        const leftList = Object.values(leftMap).sort((a: any, b: any) => b.viewers - a.viewers);
        const rightList = Object.values(rightMap).sort((a: any, b: any) => b.viewers - a.viewers);

        return res.status(200).json({
            left: leftList,
            right: rightList,
            updatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        return res.status(200).json({
            left: [],
            right: [],
            error: error?.message || 'error'
        });
    }
}