import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐️ 환경 변수 (GitHub Secrets 및 환경 호환)
const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_3oCwwq2VHCHZ_1N6S9hYF2a0IsSaFeidFdncqwaPY6q8Z4IvRNQvycjaE3q52Zk3/exec";

// ⭐️ Supabase 영구 데이터센터 인프라 연결 설정
const SUPABASE_URL = process.env.SUPABASE_URL || "https://abzpnwujausyyxxwyscb.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

// Supabase 스마트 고도화 누적 (Upsert) 엔진
async function syncToSupabase(detailsMap) {
    const videoEntries = Object.entries(detailsMap);
    if (!SUPABASE_URL || !SUPABASE_KEY || videoEntries.length === 0) {
        console.log("ℹ️ [Supabase] 동기화할 활성 방송이 없거나 KEY 설정이 없어 건너뜁니다.");
        return;
    }

    console.log(`\n🏛️ [Supabase 데이터센터] ${videoEntries.length}개 실시간 방송 인텔리전스 누적 동기화 시작...`);

    for (const [videoId, detail] of videoEntries) {
        try {
            // 1. 기존 누적 데이터 확인 (최고 시청자 갱신 + 평균 계산용 누적합/카운트 추적)
            const checkUrl = `${SUPABASE_URL}/rest/v1/youtube_live_history?video_id=eq.${videoId}&select=peak_viewers,total_viewers_sum,check_count,started_at`;
            const checkRes = await fetch(checkUrl, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            let peakViewers = detail.viewers;
            let totalViewersSum = detail.viewers;
            let checkCount = 1;
            let startedAt = detail.publishedAt || new Date().toISOString();

            if (checkRes.ok) {
                const existing = await checkRes.json();
                if (existing && existing.length > 0) {
                    const row = existing[0];
                    peakViewers = Math.max(row.peak_viewers || 0, detail.viewers);
                    totalViewersSum = (Number(row.total_viewers_sum) || 0) + detail.viewers;
                    checkCount = (Number(row.check_count) || 0) + 1;
                    if (row.started_at) {
                        startedAt = row.started_at;
                    }
                }
            }

            // 방송 진행 시간(분 단위) 자동 계산
            const startTimeMs = new Date(startedAt).getTime();
            const nowTimeMs = Date.now();
            const durationMinutes = Math.max(0, Math.round((nowTimeMs - startTimeMs) / (1000 * 60)));

            // 2. 단일 레코드 스마트 Upsert (5대 독점 지표 포함)
            const upsertUrl = `${SUPABASE_URL}/rest/v1/youtube_live_history?on_conflict=video_id`;
            const payload = {
                video_id: videoId,
                channel_name: detail.channelName,
                camp: detail.camp || 'unknown',
                title: detail.title,
                peak_viewers: peakViewers,
                current_viewers: detail.viewers,
                total_viewers_sum: totalViewersSum,
                check_count: checkCount,
                duration_minutes: durationMinutes,
                like_count: detail.likeCount || 0,
                tags: detail.tags || [],
                thumbnail_url: detail.thumbnailUrl || '',
                started_at: startedAt,
                last_updated_at: new Date().toISOString(),
                is_live: true
            };

            const upsertRes = await fetch(upsertUrl, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(payload)
            });

            if (!upsertRes.ok) {
                const errText = await upsertRes.text();
                console.error(`❌ [Supabase 에러 - ${detail.channelName}]:`, errText);
            }
        } catch (err) {
            console.error(`⚠️ [Supabase 통신 예외 - ${videoId}]:`, err.message);
        }
    }

    console.log(`✅ [Supabase 데이터센터] 인텔리전스 빅데이터 동기화 완료!`);
}

async function updateLiveJson() {
    console.log("🚀 [GitHub Actions] 실시간 정치 유튜브 라이브 데이터 수집 시작...");

    const outputPath = path.join(__dirname, '../public/live.json');

    // 1. 구글 시트에서 활성 채널 명단 가져오기
    console.log("📋 구글 시트에서 활성 채널 명단 가져오는 중...");
    let channels = [];
    try {
        const sheetRes = await fetch(`${APPS_SCRIPT_URL}?action=channels`);
        const sheetData = await sheetRes.json();
        if (sheetData.channels && Array.isArray(sheetData.channels)) {
            channels = sheetData.channels
                .map(c => ({
                    ...c,
                    channelId: (c.channelId || '').trim()
                }))
                .filter(c => c.channelId && c.channelId.startsWith('UC'));
        }
    } catch (err) {
        console.error("구글 시트 연동 실패:", err);
    }

    if (channels.length === 0) {
        console.warn("⚠️ 활성 채널 명단을 불러오지 못했습니다. 작업을 중단합니다.");
        return;
    }

    console.log(`✅ 등록된 총 ${channels.length}개 정식 채널 [라이브 탭(/streams)] 전수 스캔 시작!`);

    // ⭐️ 90개 정식 채널 ID 사전 구축
    const channelMapById = new Map();
    channels.forEach(ch => channelMapById.set(ch.channelId, ch));

    // 2. [전략 C] 라이브 전용 탭(/streams) 직행 + 라이브 뱃지 암호 핀포인트 수집
    const detectedVideos = [];
    const CHUNK_SIZE = 10;

    for (let i = 0; i < channels.length; i += CHUNK_SIZE) {
        const chunk = channels.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (ch) => {
            try {
                const streamsUrl = `https://www.youtube.com/channel/${ch.channelId}/streams`;
                const res = await fetch(streamsUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
                    },
                    redirect: 'follow'
                });

                if (res.ok) {
                    const html = await res.text();

                    // A. 빨간 라이브 뱃지 암호 영상 핀포인트 추출
                    const badgeMatches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"[^}]+"style":"BADGE_STYLE_TYPE_LIVE_NOW"/g);
                    for (const m of badgeMatches) {
                        detectedVideos.push({ videoId: m[1] });
                    }

                    // B. 라이브 전용 썸네일 암호 핀포인트 추출
                    const liveThumbMatches = html.matchAll(/\/vi\/([a-zA-Z0-9_-]{11})\/hqdefault_live\.jpg/g);
                    for (const m of liveThumbMatches) {
                        detectedVideos.push({ videoId: m[1] });
                    }

                    // C. 라이브 탭 최상단 최신 영상 후보 수집
                    const streamMatches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
                    let count = 0;
                    for (const m of streamMatches) {
                        if (count >= 2) break;
                        detectedVideos.push({ videoId: m[1] });
                        count++;
                    }
                }
            } catch (err) { }
        }));

        await new Promise(r => setTimeout(r, 100));
    }

    const uniqueIds = Array.from(new Set(detectedVideos.map(v => v.videoId)));
    console.log(`📡 감지된 라이브 후보 영상: ${uniqueIds.length}개`);

    // 3. 구글 공식 API 검문 (statistics 및 tags 무상 수확 추가)
    const detailsMap = {};
    if (uniqueIds.length > 0) {
        for (let i = 0; i < uniqueIds.length; i += 50) {
            const batch = uniqueIds.slice(i, i + 50);
            try {
                const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${batch.join(',')}&key=${API_KEY}`);
                const data = await apiRes.json();

                if (data.error) {
                    console.error("🚨 구글 API 오류:", data.error.message);
                } else if (data.items) {
                    for (const item of data.items) {
                        const isLive = item.snippet?.liveBroadcastContent === 'live';
                        const videoOwnerChannelId = item.snippet?.channelId;
                        const viewers = item.liveStreamingDetails?.concurrentViewers
                            ? parseInt(item.liveStreamingDetails.concurrentViewers, 10)
                            : 0;

                        if (isLive && viewers > 0 && channelMapById.has(videoOwnerChannelId)) {
                            const registeredChannel = channelMapById.get(videoOwnerChannelId);
                            const likeCount = item.statistics?.likeCount ? parseInt(item.statistics.likeCount, 10) : 0;
                            const tags = item.snippet?.tags || [];

                            const thumbnails = item.snippet?.thumbnails || {};
                            const bestThumb = (thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium)?.url
                                || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;

                            console.log(`   🔴 [생방송 확정] ${item.snippet?.title} (${registeredChannel.name}) - 시청자: ${viewers.toLocaleString()}명 / 좋아요: ${likeCount.toLocaleString()}개`);

                            detailsMap[item.id] = {
                                channelName: registeredChannel.name,
                                camp: registeredChannel.camp,
                                viewers,
                                title: item.snippet?.title || '',
                                publishedAt: item.liveStreamingDetails?.actualStartTime || item.snippet?.publishedAt,
                                likeCount,
                                tags,
                                thumbnailUrl: bestThumb
                            };
                        }
                    }
                }
            } catch (e) {
                console.error("API 조회 실패:", e);
            }
        }
    }

    // 4. 좌/우 분류 및 시청자 순 랭킹 정렬
    const leftMap = {};
    const rightMap = {};

    for (const [videoId, detail] of Object.entries(detailsMap)) {
        const card = {
            channelName: detail.channelName,
            title: detail.title,
            viewers: detail.viewers,
            thumbnail: detail.thumbnailUrl,
            liveUrl: `https://www.youtube.com/watch?v=${videoId}`
        };

        const isLeft = detail.camp && (detail.camp.toLowerCase().includes('left') || detail.camp.includes('좌'));
        const targetMap = isLeft ? leftMap : rightMap;

        if (!targetMap[detail.channelName] || card.viewers > targetMap[detail.channelName].viewers) {
            targetMap[detail.channelName] = card;
        }
    }

    const leftList = Object.values(leftMap).sort((a, b) => b.viewers - a.viewers);
    const rightList = Object.values(rightMap).sort((a, b) => b.viewers - a.viewers);

    // 5. 프론트엔드용 JSON 저장
    const finalResult = {
        left: leftList,
        right: rightList,
        updatedAt: new Date().toISOString()
    };

    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(finalResult, null, 2), 'utf8');
    console.log(`\n🎉 [프론트엔드] live.json 저장 완료! (좌파: ${leftList.length}개, 우파: ${rightList.length}개)`);

    // 6. Supabase 영구 인텔리전스 빅데이터 금고 누적
    await syncToSupabase(detailsMap);
}

updateLiveJson();