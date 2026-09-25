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
            channels = sheetData.channels.filter(c => c.channelId && c.channelId.startsWith('UC'));
        }
    } catch (err) {
        console.error("구글 시트 연동 실패:", err);
    }

    if (channels.length === 0) {
        console.warn("⚠️ 활성 채널 명단을 불러오지 못했습니다. 작업을 중단합니다.");
        return;
    }

    console.log(`✅ 등록된 총 ${channels.length}개 정식 채널 스캔 시작!`);

    // 2. 10개씩 조를 나누어 유튜브 차단(429) 없이 안전하게 전수 조사
    const detectedVideos = [];
    const CHUNK_SIZE = 10;

    for (let i = 0; i < channels.length; i += CHUNK_SIZE) {
        const chunk = channels.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (ch) => {
            try {
                // A. RSS 피드에서 최신 5개 영상 수집
                const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                if (res.ok) {
                    const xml = await res.text();
                    const regex = /<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/g;
                    let match;
                    let count = 0;
                    while ((match = regex.exec(xml)) !== null && count < 5) {
                        detectedVideos.push({
                            camp: ch.camp,
                            channelName: ch.name,
                            videoId: match[1]
                        });
                        count++;
                    }
                } else {
                    console.log(`❌ [차단/실패] ${ch.name} -> HTTP 응답코드: ${res.status}`);
                }
            } catch (err) {
                console.log(`⚠️ [네트워크 에러] ${ch.name}:`, err.message);
            }

            // B. 유튜브 공식 라이브 직행문(/live)에서 즉시 영상 ID 추출
            const livePageRes = await fetch(`https://www.youtube.com/channel/${ch.channelId}/live`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                redirect: 'follow'
            });
            if (livePageRes.ok) {
                const liveHtml = await livePageRes.text();
                const canonicalMatch = liveHtml.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})">/);
                if (canonicalMatch && canonicalMatch[1]) {
                    detectedVideos.push({
                        camp: ch.camp,
                        channelName: ch.name,
                        videoId: canonicalMatch[1]
                    });
                }
            }
        } catch (err) { }
    }));

    // 유튜브 서버를 배려하는 0.15초 매너 딜레이 (차단 방지 핵심)
    await new Promise(r => setTimeout(r, 150));
}

const uniqueIds = Array.from(new Set(detectedVideos.map(v => v.videoId)));
console.log(`📡 감지된 총 후보 영상: ${uniqueIds.length}개`);

// 3. 구글 공식 API로 생방송 여부 및 시청자 수 조회 (50개씩 묶음 검문)
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
                    const viewers = item.liveStreamingDetails?.concurrentViewers
                        ? parseInt(item.liveStreamingDetails.concurrentViewers, 10)
                        : 0;

                    if (isLive && viewers > 0) {
                        console.log(`   🔴 [생방송 감지] ${item.snippet?.title} (${item.snippet?.channelTitle}) - 시청자: ${viewers.toLocaleString()}명`);
                        detailsMap[item.id] = {
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

for (const item of detectedVideos) {
    const detail = detailsMap[item.videoId];
    if (detail && detail.viewers > 0) {
        const card = {
            channelName: item.channelName,
            title: detail.title,
            viewers: detail.viewers,
            thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            liveUrl: `https://www.youtube.com/watch?v=${item.videoId}`
        };

        const isLeft = item.camp.toLowerCase().includes('left') || item.camp.includes('좌');
        const targetMap = isLeft ? leftMap : rightMap;

        if (!targetMap[item.channelName] || card.viewers > targetMap[item.channelName].viewers) {
            targetMap[item.channelName] = card;
        }
    }
}

const leftList = Object.values(leftMap).sort((a, b) => b.viewers - a.viewers);
const rightList = Object.values(rightMap).sort((a, b) => b.viewers - a.viewers);

// 5. ⭐️ 0개이든 몇 개이든 최신 상태와 시간을 칼같이 저장 (시간 멈춤 족쇄 완전 해제!)
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