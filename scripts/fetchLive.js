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

    console.log(`✅ 등록된 총 ${channels.length}개 정식 채널 /live 직행 검사 시작!`);

    // ⭐️ 90개 정식 채널 ID 사전 구축 (남의 추천 영상 100% 걸러내기용 신분증 리스트)
    const channelMapById = new Map();
    channels.forEach(ch => channelMapById.set(ch.channelId, ch));

    // 2. 10개씩 조를 나누어 라이브 직행문 검사 (단일 방송 + YTN 다중 방송 동시 포착)
    const detectedVideos = [];
    const CHUNK_SIZE = 10;

    for (let i = 0; i < channels.length; i += CHUNK_SIZE) {
        const chunk = channels.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (ch) => {
            try {
                const liveUrl = `https://www.youtube.com/channel/${ch.channelId}/live`;
                const res = await fetch(liveUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
                    },
                    redirect: 'follow'
                });

                if (res.ok) {
                    // A. 단일 라이브 리다이렉트 URL에서 추출
                    if (res.url && res.url.includes('watch?v=')) {
                        const urlObj = new URL(res.url);
                        const v = urlObj.searchParams.get('v');
                        if (v) detectedVideos.push({ videoId: v });
                    }

                    // B. YTN 등 다중 동시 라이브 방송 및 본문 영상 ID 추출 (최대 3개)
                    const html = await res.text();
                    const liveMatches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
                    let count = 0;
                    for (const match of liveMatches) {
                        if (count >= 3) break;
                        detectedVideos.push({ videoId: match[1] });
                        count++;
                    }
                }
            } catch (err) { }
        }));

        await new Promise(r => setTimeout(r, 100));
    }

    const uniqueIds = Array.from(new Set(detectedVideos.map(v => v.videoId)));
    console.log(`📡 감지된 라이브 후보 영상: ${uniqueIds.length}개`);

    // 3. 구글 공식 API 검문 (⭐️ 90개 명단과 진짜 주인이 일치하는지 엄격 대조!)
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
                        const videoOwnerChannelId = item.snippet?.channelId; // 영상의 진짜 소유자 ID
                        const viewers = item.liveStreamingDetails?.concurrentViewers
                            ? parseInt(item.liveStreamingDetails.concurrentViewers, 10)
                            : 0;

                        // ⭐️ 핵심 방어선: 진짜 지금 생방송 중이면서, 우리 구글 시트 등록 채널일 때만 최종 합격!
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