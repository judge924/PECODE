import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐️ 깃허브 금고(Secrets) 또는 내 컴퓨터 .env에서 키를 안전하게 꺼내옵니다.
const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_3oCwwq2VHCHZ_1N6S9hYF2a0IsSaFeidFdncqwaPY6q8Z4IvRNQvycjaE3q52Zk3/exec";

async function updateLiveJson() {
    console.log("🚀 [GitHub Actions] 실시간 정치 유튜브 라이브 데이터 수집 시작...");

    const outputPath = path.join(__dirname, '../public/live.json');
    let previousData = { left: [], right: [] };

    if (fs.existsSync(outputPath)) {
        try {
            previousData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        } catch (e) { }
    }

    // 1. 사장님이 구글 시트에 직접 채워두신 '진짜 활성 채널 85개' 가져오기
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
        console.warn("⚠️ 활성 채널 명단을 불러오지 못했습니다. 기존 데이터를 유지합니다.");
        return;
    }

    console.log(`✅ 등록된 총 ${channels.length}개 정식 채널 스캔 시작!`);

    // 2. 85개 채널 다중 감지 (RSS 최신 6개 검색 + 실시간 라이브 엔드포인트 지원)
    const detectedVideos = [];
    const fetchPromises = channels.map(async (ch) => {
        try {
            // A. RSS 피드에서 최신 6개 영상 넉넉하게 수집 (쇼츠나 새 영상에 밀림 방지)
            const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const xml = await res.text();
            const regex = /<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/g;
            let match;
            let count = 0;
            while ((match = regex.exec(xml)) !== null && count < 6) {
                detectedVideos.push({
                    camp: ch.camp,
                    channelName: ch.name,
                    videoId: match[1]
                });
                count++;
            }

            // B. 유튜브 공식 라이브 직행 주소에서 즉시 영상 ID 추출
            const livePageRes = await fetch(`https://www.youtube.com/channel/${ch.channelId}/live`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                redirect: 'follow'
            });
            const liveHtml = await livePageRes.text();
            const canonicalMatch = liveHtml.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})">/);
            if (canonicalMatch && canonicalMatch[1]) {
                detectedVideos.push({
                    camp: ch.camp,
                    channelName: ch.name,
                    videoId: canonicalMatch[1]
                });
            }
        } catch (err) { }
    });

    await Promise.all(fetchPromises);
    const uniqueIds = Array.from(new Set(detectedVideos.map(v => v.videoId)));
    console.log(`📡 감지된 총 후보 영상: ${uniqueIds.length}개`);

    // 3. 구글 공식 API로 생방송 여부 및 시청자 수 조회
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

    // 4. 좌/우 분류 및 랭킹 정렬
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

    // ⭐️ [절대 방어] 만약 이번 스캔이 0개라면 기존 파일 보존
    if (leftList.length === 0 && rightList.length === 0 && (previousData.left?.length > 0 || previousData.right?.length > 0)) {
        console.warn("⚠️ 감지된 생방송이 0개여서 기존 데이터를 100% 보존합니다.");
        return;
    }

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
    console.log(`\n🎉 [최종 성공] live.json 저장 완료! (좌파: ${leftList.length}개, 우파: ${rightList.length}개)`);
}

updateLiveJson();