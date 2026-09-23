import { YOUTUBE_CHANNELS } from '../src/data/youtubeChannels';

export default async function handler(req: any, res: any) {
    // ⭐️ Vercel 전 세계 엣지 서버 캐시: 60초간 응답을 보관해 0.01초 만에 즉시 반환
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    const apiKey = process.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY || '';

    try {
        // 1. 83개 전체 채널의 /live URL을 초고속 병렬 스캔
        const scanPromises = YOUTUBE_CHANNELS.map(async (ch) => {
            try {
                const cleanBase = ch.url.split('?')[0].replace(/\/live\/?$/, '').replace(/\/$/, '');
                const liveUrl = cleanBase + '/live';

                const response = await fetch(liveUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    },
                    redirect: 'follow',
                });
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

        // 2. 유튜브 공식 API로 시청자 수와 제목 일괄 조회 (50개 단위 청크)
        if (videoIds.length > 0 && apiKey) {
            for (let i = 0; i < videoIds.length; i += 50) {
                const chunk = videoIds.slice(i, i + 50);
                try {
                    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,snippet&id=${chunk.join(',')}&key=${apiKey}`;
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
                } catch (err) {
                    console.warn('YouTube API 조회 실패:', err);
                }
            }
        }

        // 3. 진영 분류 및 0명(대기방/예약방송) 원천 제외
        const leftMap: Record<string, any> = {};
        const rightMap: Record<string, any> = {};

        for (const d of detected) {
            const details = detailsMap[d.videoId] || { viewers: 0, title: '' };
            // 실제로 1명 이상 시청 중인 생방송만 수록
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