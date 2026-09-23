import { YOUTUBE_CHANNELS } from '../src/data/youtubeChannels';

// ⭐️ 발급받으신 유튜브 API 키를 코드에 직접 등록 (Vercel 배포 시 100% 즉시 인식)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY || "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";

export default async function handler(req: any, res: any) {
    // ⭐️ 60초 동안 Vercel 전 세계 엣지 서버 캐시: 0.01초 만에 즉시 응답
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    try {
        // 1. 83개 채널을 병렬로 초고속 스캔 (각 요청당 3초 타임아웃 제한으로 Vercel 속도 보장)
        const scanPromises = YOUTUBE_CHANNELS.map(async (ch) => {
            try {
                const cleanBase = ch.url.split('?')[0].replace(/\/live\/?$/, '').replace(/\/$/, '');
                const liveUrl = cleanBase + '/live';

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);

                const response = await fetch(liveUrl, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept-Language': 'ko-KR,ko;q=0.9',
                    },
                    redirect: 'follow',
                });
                clearTimeout(timeoutId);

                const html = await response.text();
                const videoIdMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/) || html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
                const videoId = videoIdMatch ? videoIdMatch[1] : '';
                const isLive = html.includes('"isLive":true') || html.includes('watching') || html.includes('시청 중');

                if (videoId && isLive) {
                    return { ...ch, videoId };
                }
            } catch (e) { }
            return null;
        });

        const detected = (await Promise.all(scanPromises)).filter(Boolean) as Array<{
            camp: 'left' | 'right';
            name: string;
            url: string;
            videoId: string;
        }>;

        const videoIds = Array.from(new Set(detected.map((d) => d.videoId)));
        const detailsMap: Record<string, { viewers: number; title: string }> = {};

        // 2. 유튜브 공식 API로 실시간 동시 시청자 수와 제목 일괄 조회
        if (videoIds.length > 0 && YOUTUBE_API_KEY) {
            for (let i = 0; i < videoIds.length; i += 50) {
                const chunk = videoIds.slice(i, i + 50);
                try {
                    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,snippet&id=${chunk.join(',')}&key=${YOUTUBE_API_KEY}`;
                    const apiRes = await fetch(apiUrl);
                    const apiData = await apiRes.json();

                    if (apiData.items) {
                        for (const item of apiData.items) {
                            const isUpcoming = item.snippet?.liveBroadcastContent === 'upcoming';
                            let viewers = 0;
                            if (!isUpcoming && item.liveStreamingDetails?.concurrentViewers) {
                                viewers = parseInt(item.liveStreamingDetails.concurrentViewers, 10);
                            }
                            detailsMap[item.id] = {
                                viewers,
                                title: item.snippet?.title || '',
                            };
                        }
                    }
                } catch (err) { }
            }
        }

        // 3. 진영 분류 및 0명(대기방/예약방송) 원천 제외
        const leftMap: Record<string, any> = {};
        const rightMap: Record<string, any> = {};

        for (const d of detected) {
            const details = detailsMap[d.videoId] || { viewers: 0, title: '' };

            // 시청자 수가 1명 이상인 '진짜 생방송'만 추가
            if (details.viewers > 0) {
                const item = {
                    channelName: d.name,
                    title: details.title,
                    viewers: details.viewers,
                    thumbnail: `https://i.ytimg.com/vi/${d.videoId}/hqdefault.jpg`,
                    liveUrl: `https://www.youtube.com/watch?v=${d.videoId}`,
                };
                const targetMap = d.camp === 'left' ? leftMap : rightMap;
                if (!targetMap[d.name] || item.viewers > targetMap[d.name].viewers) {
                    targetMap[d.name] = item;
                }
            }
        }

        const leftList = Object.values(leftMap).sort((a: any, b: any) => b.viewers - a.viewers);
        const rightList = Object.values(rightMap).sort((a: any, b: any) => b.viewers - a.viewers);

        return res.status(200).json({
            left: leftList,
            right: rightList,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        return res.status(500).json({ left: [], right: [], error: String(error) });
    }
}