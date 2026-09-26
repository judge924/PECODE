import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐️ 깃허브 금고(Secrets) 또는 내 컴퓨터 환경에서 키를 안전하게 꺼내옵니다.
const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_3oCwwq2VHCHZ_1N6S9hYF2a0IsSaFeidFdncqwaPY6q8Z4IvRNQvycjaE3q52Zk3/exec";

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

    // ⭐️ 90개 정식 채널 ID 사전 구축 (남의 추천 영상 100% 차단용)
    const channelMapById = new Map();
    channels.forEach(ch => channelMapById.set(ch.channelId, ch));

    // 2. [전략 C] 라이브 전용 탭(/streams) 직행 + 라이브 뱃지 암호 핀포인트 수집
    const detectedVideos = [];
    const CHUNK_SIZE = 10;

    for (let i = 0; i < channels.length; i += CHUNK_SIZE) {
        const chunk = channels.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (ch) => {
            try {
                // 오직 실시간/라이브만 모아두는 유튜브 공식 [라이브] 전용 탭 직행!
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

                    // A. 빨간 라이브 뱃지 암호 (BADGE_STYLE_TYPE_LIVE_NOW) 영상 핀포인트 추출
                    const badgeMatches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"[^}]+"style":"BADGE_STYLE_TYPE_LIVE_NOW"/g);
                    for (const m of badgeMatches) {
                        detectedVideos.push({ videoId: m[1] });
                    }

                    // B. 라이브 전용 썸네일 암호 (hqdefault_live.jpg) 핀포인트 추출
                    const liveThumbMatches = html.matchAll(/\/vi\/([a-zA-Z0-9_-]{11})\/hqdefault_live\.jpg/g);
                    for (const m of liveThumbMatches) {
                        detectedVideos.push({ videoId: m[1] });
                    }

                    // C. 라이브 탭의 최상단 최신 영상 2개 후보 수집 (방금 시작된 라이브 방어선)
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

        // 유튜브 서버를 배려하는 0.1초 매너 딜레이 (15초 쾌속 완료)
        await new Promise(r => setTimeout(r, 100));
    }

    const uniqueIds = Array.from(new Set(detectedVideos.map(v => v.videoId)));
    console.log(`📡 감지된 라이브 후보 영상: ${uniqueIds.length}개`);

    // 3. 구글 공식 API 검문 (90개 등록 채널 명단과 진짜 소유자 100% 일치 검증)
    const detailsMap = {};
    if (uniqueIds.length > 0) {
        for (let i = 0; i < uniqueIds.length; i += 50) {
            const batch = uniqueIds.slice(i, i + 50);
            try {
                const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${batch.join(',')}&key=${API_KEY}`);
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

                        // ⭐️ 핵심 방어선: 실시간 방송 중 + 등록된 90개 채널과 소유자 일치 시 최종 확정!
                        if (isLive && viewers > 0 && channelMapById.has(videoOwnerChannelId)) {
                            const registeredChannel = channelMapById.get(videoOwnerChannelId);
                            console.log(`   🔴 [생방송 확정] ${item.snippet?.title} (${registeredChannel.name}) - 시청자: ${viewers.toLocaleString()}명`);
                            detailsMap[item.id] = {
                                channelName: registeredChannel.name,
                                camp: registeredChannel.camp,
                                viewers,
                                title: item.snippet?.title || ''
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
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            liveUrl: `https://www.youtube.com/watch?v=${videoId}`
        };

        const isLeft = detail.camp.toLowerCase().includes('left') || detail.camp.includes('좌');
        const targetMap = isLeft ? leftMap : rightMap;

        // 동일 채널에서 방송이 여러 개면 시청자가 더 많은 메인 방송 1개로 자동 선정!
        if (!targetMap[detail.channelName] || card.viewers > targetMap[detail.channelName].viewers) {
            targetMap[detail.channelName] = card;
        }
    }

    const leftList = Object.values(leftMap).sort((a, b) => b.viewers - a.viewers);
    const rightList = Object.values(rightMap).sort((a, b) => b.viewers - a.viewers);

    // 5. 최신 상태와 시간을 칼같이 저장
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
    console.log(`\n🎉 [최종 성공] live.json 저장 완료! (좌파: ${leftList.length}개, 우파: ${rightList.length}개, 시간: ${finalResult.updatedAt})`);
}

updateLiveJson();