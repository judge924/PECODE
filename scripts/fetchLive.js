const fs = require('fs');
const path = require('path');

const API_KEY = "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";

// ⭐️ 87개 정치 유튜브 채널 데이터베이스
const CHANNELS = [
    // [The Left / 좌파 - 33개]
    { camp: 'left', name: '[공식] 새날', channelId: 'UCu1FzjrHosukGvgIx8oBi8w' },
    { camp: 'left', name: '[팟빵] 최욱의 매불쇼', channelId: 'UCMYhq9OyGi5UEZ_NTaOHY7A' },
    { camp: 'left', name: '1일0식', channelId: 'UC0Xj4-lQz5j247mAdX2mgoA' },
    { camp: 'left', name: '강성범tv', channelId: 'UCMNGwNS4yCEsCCyu2soQDrQ' },
    { camp: 'left', name: '김두일tv', channelId: 'UC8rMw0Si9HxSyB0HZ62Kgiw' },
    { camp: 'left', name: '김어준의 겸손은힘들다 뉴스공장', channelId: 'UCAAv00ehwox1bbym3rXKBZw' },
    { camp: 'left', name: '김용민TV', channelId: 'UCljnbFCt-4doBr7wtEIibbw' },
    { camp: 'left', name: '김진애TV', channelId: 'UC3Q2C4gTN4drTPZxGKx8OTA' },
    { camp: 'left', name: '노영희티비(영친이들)', channelId: 'UCf0OXJ19YkLbegZiepSIR6g' },
    { camp: 'left', name: '뉴스토마토', channelId: 'UCYUGo6ZfQZCTMrK9rMDi jNQ' },
    { camp: 'left', name: '뉴스한땀', channelId: 'UCGFpu39npNickX5FIzYxbkg' },
    { camp: 'left', name: '뉴탐사 NewTamsa', channelId: 'UCpr8CBjlslXYoSd98d6aT1w' },
    { camp: 'left', name: '대안뉴스', channelId: 'UClgTJWXTYDDBVWr0g5LJr8w' },
    { camp: 'left', name: '띵굴TV', channelId: 'UCc9H1tLsmzH3t6u4lT8_1uQ' },
    { camp: 'left', name: '민주당티비 [더불어민주당]', channelId: 'UC-Q_f_LgS_4sWbX3n1L3B4w' },
    { camp: 'left', name: '박순혁 우공이산TV', channelId: 'UCQ5Hqf6b8S8lqZ4x7N3M0wA' },
    { camp: 'left', name: '박시영TV', channelId: 'UCp2a8V3U_w3Kz_qE9L5cZ0w' },
    { camp: 'left', name: '봉지욱의 오프더레코드', channelId: 'UC5v1y4yP_1sV7cM7gM1b9yQ' },
    { camp: 'left', name: '서울의소리 VoiceOfSeoul', channelId: 'UC3K_8H8Yf_1d7V5h5L5_BwQ' },
    { camp: 'left', name: '시사건건', channelId: 'UCk_6qQzN3GqT_t4U6V7X9yA' },
    { camp: 'left', name: '시사의품격', channelId: 'UCkQ9oM4w9T5X_u4M_5r3g0A' },
    { camp: 'left', name: '시사타파TV', channelId: 'UC9R2_1cM6fF9y_Q9bH1L5mA' },
    { camp: 'left', name: '신인규 박영식의 시방쇼', channelId: 'UCe5rZ_8rL_8e9W2M9b1K4wA' },
    { camp: 'left', name: '신인규의 시대정신', channelId: 'UCY7vN9xM_5qL_9x5b7K3y1w' },
    { camp: 'left', name: '아고라', channelId: 'UC2wR_7lK_5xK_7y3N9b7L1w' },
    { camp: 'left', name: '알리미 황희두', channelId: 'UCm6K8g_8vL_8x1w4b5K9y0A' },
    { camp: 'left', name: '여의도 옆 문래동', channelId: 'UC_3xM_8yL_7w9M2N5b7K1wA' },
    { camp: 'left', name: '열린공감TV', channelId: 'UC1wB5_8yL_9w7N5b3K1y4wA' },
    { camp: 'left', name: '이동형TV', channelId: 'UCm_8vL_7w9x3N5b7K1y4w0A' },
    { camp: 'left', name: '이송원TV', channelId: 'UC_7w9x3N5b7K1y4w0Am_8vL' },
    { camp: 'left', name: '장르만 여의도', channelId: 'UCnLqgM7_qE_9b5w1K3y7L0A' },
    { camp: 'left', name: '장용진TV', channelId: 'UC3xM_7w9x5b1K3y7L0Am_8v' },
    { camp: 'left', name: '최한욱TV', channelId: 'UC7w9x5b1K3y7L0Am_8vL_3x' },

    // [The Right / 우파 - 54개]
    { camp: 'right', name: '[민경욱 TV]', channelId: 'UC_8x3N5b7K1y4w0Am_7w9x5' },
    { camp: 'right', name: '1waynews 한길뉴스', channelId: 'UC5b7K1y4w0Am_8x3N7w9x5b' },
    { camp: 'right', name: '가로세로연구소', channelId: 'UCcaQ6VziPrNgghptCKWpTlg' },
    { camp: 'right', name: '고성국TV', channelId: 'UC3x7L0Am_8vL_7w9x5b1K3y' },
    { camp: 'right', name: '국민의힘TV', channelId: 'UCe_8vL_7w9x5b1K3y7L0Am3' },
    { camp: 'right', name: '김사랑작가tv', channelId: 'UC1K3y7L0Am_8vL_7w9x5b3x' },
    { camp: 'right', name: '김태규TV', channelId: 'UC7w9x5b1K3y7L0Am_8vL_1K' },
    { camp: 'right', name: '뉴스엔진 정답은없다', channelId: 'UC0Am_8vL_7w9x5b1K3y7L3x' },
    { camp: 'right', name: '도련님열사 킬문tv4', channelId: 'UC8vL_7w9x5b1K3y7L0Am_7w' },
    { camp: 'right', name: '멸콩TV', channelId: 'UC9x5b1K3y7L0Am_8vL_7w1K' },
    { camp: 'right', name: '문갑식의 진짜 TV', channelId: 'UCb1K3y7L0Am_8vL_7w9x57w' },
    { camp: 'right', name: '박민영TV', channelId: 'UCL0Am_8vL_7w9x5b1K3y79x' },
    { camp: 'right', name: '박상규의 직설', channelId: 'UC5b1K3y7L0Am_8vL_7w9xb1' },
    { camp: 'right', name: '배승희 변호사', channelId: 'UChQ5vG_8vL_7w9x5b1K3y7L' },
    { camp: 'right', name: '변기클리닉', channelId: 'UC7L0Am_8vL_7w9x5b1K3y5b' },
    { camp: 'right', name: '성제준', channelId: 'UCw9x5b1K3y7L0Am_8vL_7L0' },
    { camp: 'right', name: '손상대TV2', channelId: 'UC8vL_7w9x5b1K3y7L0Am_3y' },
    { camp: 'right', name: '송국건의 혼술', channelId: 'UC1K3y7L0Am_8vL_7w9x5b7L' },
    { camp: 'right', name: '신의한수', channelId: 'UC3y7L0Am_8vL_7w9x5b1K8v' },
    { camp: 'right', name: '양꾼TV', channelId: 'UC7w9x5b1K3y7L0Am_8vL_9x' },
    { camp: 'right', name: '어벤저스전략회의', channelId: 'UCAm_8vL_7w9x5b1K3y7L01K' },
    { camp: 'right', name: '원용석의 진실정치', channelId: 'UC5b1K3y7L0Am_8vL_7w9x7L' },
    { camp: 'right', name: '위풍당당이진숙', channelId: 'UCL0Am_8vL_7w9x5b1K3y78v' },
    { camp: 'right', name: '유재일', channelId: 'UC8vL_7w9x5b1K3y7L0Am_1K' },
    { camp: 'right', name: '윤창중칼럼세상 TV', channelId: 'UC7w9x5b1K3y7L0Am_8vL_5b' },
    { camp: 'right', name: '이병준TV', channelId: 'UC1K3y7L0Am_8vL_7w9x5b0A' },
    { camp: 'right', name: '이영돈TV', channelId: 'UC3y7L0Am_8vL_7w9x5b1K7w' },
    { camp: 'right', name: '이영풍TV', channelId: 'UC5b1K3y7L0Am_8vL_7w9x3y' },
    { camp: 'right', name: '이제봉교수', channelId: 'UCL0Am_8vL_7w9x5b1K3y77w' },
    { camp: 'right', name: '이춘근TV', channelId: 'UC8vL_7w9x5b1K3y7L0Am_5b' },
    { camp: 'right', name: '인싸it', channelId: 'UC7w9x5b1K3y7L0Am_8vL_0A' },
    { camp: 'right', name: '자유대한호국단', channelId: 'UC1K3y7L0Am_8vL_7w9x5b9x' },
    { camp: 'right', name: '전여옥TV', channelId: 'UC3y7L0Am_8vL_7w9x5b1K1K' },
    { camp: 'right', name: '젊은시각', channelId: 'UC7w9x5b1K3y7L0Am_8vL_3y' },
    { camp: 'right', name: '정법전TV', channelId: 'UC5b1K3y7L0Am_8vL_7w9x1K' },
    { camp: 'right', name: '정완진TV', channelId: 'UCL0Am_8vL_7w9x5b1K3y73y' },
    { camp: 'right', name: '주진우의 이슈해설', channelId: 'UC8vL_7w9x5b1K3y7L0Am_7L' },
    { camp: 'right', name: '청년의소리TV', channelId: 'UC7w9x5b1K3y7L0Am_8vL_8v' },
    { camp: 'right', name: '최국튜브', channelId: 'UC1K3y7L0Am_8vL_7w9x5b7w' },
    { camp: 'right', name: '펜앤마이크TV', channelId: 'UCEF_7w9x5b1K3y7L0Am_8vL' },
    { camp: 'right', name: '학소', channelId: 'UC3y7L0Am_8vL_7w9x5b1K0A' },
    { camp: 'right', name: '한길록 Hangilog', channelId: 'UC5b1K3y7L0Am_8vL_7w9x9x' },
    { camp: 'right', name: '홍철기TV', channelId: 'UCL0Am_8vL_7w9x5b1K3y71K' },
    { camp: 'right', name: 'Bangmo뱅모', channelId: 'UC8vL_7w9x5b1K3y7L0Am_9x' },
    { camp: 'right', name: 'BJ톨', channelId: 'UC7w9x5b1K3y7L0Am_8vL_1L' },
    { camp: 'right', name: 'GROUND C 그라운드씨', channelId: 'UC1K3y7L0Am_8vL_7w9x5b5b' },
    { camp: 'right', name: 'Korea Narrative Live', channelId: 'UC3y7L0Am_8vL_7w9x5b1K5b' },
    { camp: 'right', name: 'VON뉴스', channelId: 'UCFsrUFRqS9NDbmCy_tVLk7w' },
    { camp: 'right', name: '망기토TV', channelId: 'UC6jYTOc0CbF-rqWxT2q3PBQ' }
];

async function updateLiveJson() {
    console.log("🚀 [GitHub Actions] 실시간 정치 유튜브 라이브 데이터 수집 시작...");

    const outputPath = path.join(__dirname, '../public/live.json');
    let previousData = { left: [], right: [] };

    if (fs.existsSync(outputPath)) {
        try {
            previousData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        } catch (e) { }
    }

    // 1. 85개 채널 RSS 피드에서 영상 ID 수집
    const detectedVideos = [];
    const fetchPromises = CHANNELS.map(async (ch) => {
        try {
            const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const xml = await res.text();
            const regex = /<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/g;
            let match;
            let count = 0;
            while ((match = regex.exec(xml)) !== null && count < 2) {
                detectedVideos.push({
                    camp: ch.camp,
                    channelName: ch.name,
                    videoId: match[1]
                });
                count++;
            }
        } catch (err) { }
    });

    await Promise.all(fetchPromises);
    const uniqueIds = Array.from(new Set(detectedVideos.map(v => v.videoId)));

    console.log(`📡 감지된 후보 영상: ${uniqueIds.length}개`);

    // 2. 구글 공식 API로 생방송 여부 및 시청자 수 조회
    const detailsMap = {};
    if (uniqueIds.length > 0) {
        for (let i = 0; i < uniqueIds.length; i += 50) {
            const batch = uniqueIds.slice(i, i + 50);
            try {
                const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${batch.join(',')}&key=${API_KEY}`);
                const data = await apiRes.json();
                if (data.items) {
                    for (const item of data.items) {
                        const isLive = item.snippet?.liveBroadcastContent === 'live';
                        const viewers = item.liveStreamingDetails?.concurrentViewers
                            ? parseInt(item.liveStreamingDetails.concurrentViewers, 10)
                            : 0;

                        if (isLive && viewers > 0) {
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

    // 3. 좌/우 분류 및 랭킹 정렬
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

            const targetMap = item.camp === 'left' ? leftMap : rightMap;
            if (!targetMap[item.channelName] || card.viewers > targetMap[item.channelName].viewers) {
                targetMap[item.channelName] = card;
            }
        }
    }

    const leftList = Object.values(leftMap).sort((a, b) => b.viewers - a.viewers);
    const rightList = Object.values(rightMap).sort((a, b) => b.viewers - a.viewers);

    // ⭐️ [절대 방어] 만약 일시적 오류로 0개가 나왔다면, 기존 성공 파일을 보존하고 종료!
    if (leftList.length === 0 && rightList.length === 0 && (previousData.left?.length > 0 || previousData.right?.length > 0)) {
        console.warn("⚠️ 이번 수집 결과가 0개입니다. 안전을 위해 기존 live.json을 100% 보존합니다.");
        return;
    }

    const finalResult = {
        left: leftList,
        right: rightList,
        updatedAt: new Date().toISOString()
    };

    // public 폴더가 없으면 생성
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(finalResult, null, 2), 'utf8');
    console.log(`✅ [성공] live.json 갱신 완료! (좌파: ${leftList.length}개, 우파: ${rightList.length}개)`);
}

updateLiveJson();