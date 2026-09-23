// ⭐️ 83개 좌/우 정치 유튜브 채널 정식 주소 데이터베이스 (단독 실행)
const CHANNELS_DATABASE = [
    // [The Left / 좌파 - 31개]
    { camp: 'left', name: '[공식] 새날', url: 'https://www.youtube.com/@saenal' },
    { camp: 'left', name: '[팟빵] 최욱의 매불쇼', url: 'https://www.youtube.com/@maebulshow' },
    { camp: 'left', name: '1일0식', url: 'https://www.youtube.com/@zerosik82' },
    { camp: 'left', name: '강성범tv', url: 'https://www.youtube.com/@kangsungbumtv' },
    { camp: 'left', name: '김두일tv', url: 'https://www.youtube.com/@tv70' },
    { camp: 'left', name: '김어준의 겸손은힘들다 뉴스공장', url: 'https://www.youtube.com/@gyeomsonisnothing' },
    { camp: 'left', name: '김용민TV', url: 'https://www.youtube.com/@kimyongmintv' },
    { camp: 'left', name: '김진애TV', url: 'https://www.youtube.com/@tv-jkspacetime' },
    { camp: 'left', name: '노영희티비(영친이들)', url: 'https://www.youtube.com/@youngheefriends' },
    { camp: 'left', name: '뉴스토마토', url: 'https://www.youtube.com/@newstomatotv' },
    { camp: 'left', name: '뉴스한땀', url: 'https://www.youtube.com/@by_yoonk' },
    { camp: 'left', name: '뉴탐사 NewTamsa', url: 'https://www.youtube.com/@newtamsa' },
    { camp: 'left', name: '대안뉴스', url: 'https://www.youtube.com/@daeannews' },
    { camp: 'left', name: '띵굴TV', url: 'https://www.youtube.com/@mediagom' },
    { camp: 'left', name: '민주당티비 [더불어민주당]', url: 'https://www.youtube.com/@minjoodang_tv' },
    { camp: 'left', name: '박순혁 우공이산TV', url: 'https://www.youtube.com/@woogong2san' },
    { camp: 'left', name: '박시영TV', url: 'https://www.youtube.com/@parksiyoungtv' },
    { camp: 'left', name: '봉지욱의 오프더레코드', url: 'https://www.youtube.com/@봉지욱기자' },
    { camp: 'left', name: '서울의소리 VoiceOfSeoul', url: 'https://www.youtube.com/@서울의소리VoiceOfSeoul' },
    { camp: 'left', name: '시사건건', url: 'https://www.youtube.com/@sisagungun' },
    { camp: 'left', name: '시사의품격', url: 'https://www.youtube.com/@sisapumgyuk' },
    { camp: 'left', name: '시사타파TV', url: 'https://www.youtube.com/@sisatapa_tv' },
    { camp: 'left', name: '신인규 박영식의 시방쇼', url: 'https://www.youtube.com/@sibangshow' },
    { camp: 'left', name: '신인규의 시대정신', url: 'https://www.youtube.com/@shininkyu' },
    { camp: 'left', name: '아고라', url: 'https://www.youtube.com/@agorapb' },
    { camp: 'left', name: '알리미 황희두', url: 'https://www.youtube.com/@heenimhwang' },
    { camp: 'left', name: '여의도 옆 문래동', url: 'https://www.youtube.com/@mullaedong' },
    { camp: 'left', name: '열린공감TV', url: 'https://www.youtube.com/@openmindtv11' },
    { camp: 'left', name: '이동형TV', url: 'https://www.youtube.com/@dhleetv' },
    { camp: 'left', name: '이송원TV', url: 'https://www.youtube.com/@tv-og5md' },
    { camp: 'left', name: '장르만 여의도', url: 'https://www.youtube.com/@jtbcshow' },
    { camp: 'left', name: '장용진TV', url: 'https://www.youtube.com/@iskracoree' },
    { camp: 'left', name: '저널리스트', url: 'https://www.youtube.com/@k-journalist' },
    { camp: 'left', name: '최강욱TV', url: 'https://www.youtube.com/@choikangwook' },
    { camp: 'left', name: '최한욱TV', url: 'https://www.youtube.com/@tv-yc8no' },
    { camp: 'left', name: '헬마라이브', url: 'https://www.youtube.com/@hellma' },

    // [The Right / 우파 - 52개]
    { camp: 'right', name: '[민경욱 TV]', url: 'https://www.youtube.com/@mrminkyungwook' },
    { camp: 'right', name: '1waynews 한길뉴스', url: 'https://www.youtube.com/@1waynews-jhg' },
    { camp: 'right', name: '가로세로연구소', url: 'https://www.youtube.com/@hoverlab2018' },
    { camp: 'right', name: '고성국TV', url: 'https://www.youtube.com/@고성국TV' },
    { camp: 'right', name: '국민의힘TV', url: 'https://www.youtube.com/@peoplepowerparty_official' },
    { camp: 'right', name: '김사랑작가tv', url: 'https://www.youtube.com/@sarang777' },
    { camp: 'right', name: '김태규TV', url: 'https://www.youtube.com/@tv-jkspacetime' },
    { camp: 'right', name: '뉴스엔진 정답은없다', url: 'https://www.youtube.com/@news_engine' },
    { camp: 'right', name: '도련님열사 킬문tv4', url: 'https://www.youtube.com/@killmoontv4' },
    { camp: 'right', name: '멸콩TV', url: 'https://www.youtube.com/@myeolkongtv' },
    { camp: 'right', name: '문갑식의 진짜 TV', url: 'https://www.youtube.com/@tv6435' },
    { camp: 'right', name: '박민영TV', url: 'https://www.youtube.com/@minyoungpark' },
    { camp: 'right', name: '박상규의 직설', url: 'https://www.youtube.com/@directtalk_sk' },
    { camp: 'right', name: '배승희 변호사', url: 'https://www.youtube.com/@tatabuta' },
    { camp: 'right', name: '변기클리닉', url: 'https://www.youtube.com/@byunhejae' },
    { camp: 'right', name: '성제준', url: 'https://www.youtube.com/@jaejunsung' },
    { camp: 'right', name: '손상대TV2', url: 'https://www.youtube.com/@ssdtv2' },
    { camp: 'right', name: '송국건의 혼술', url: 'https://www.youtube.com/@songkookkun' },
    { camp: 'right', name: '신의한수', url: 'https://www.youtube.com/@tubeshin' },
    { camp: 'right', name: '양꾼TV', url: 'https://www.youtube.com/@yangkkun' },
    { camp: 'right', name: '어벤저스전략회의', url: 'https://www.youtube.com/@어벤저스전략회의' },
    { camp: 'right', name: '원용석의 진실정치', url: 'https://www.youtube.com/@truthpolitics' },
    { camp: 'right', name: '위풍당당이진숙', url: 'https://www.youtube.com/@leejinsook' },
    { camp: 'right', name: '유재일', url: 'https://www.youtube.com/@yooonlyone' },
    { camp: 'right', name: '윤창중칼럼세상 TV', url: 'https://www.youtube.com/@tv-vc2kz' },
    { camp: 'right', name: '이병준TV', url: 'https://www.youtube.com/@byungjuntv' },
    { camp: 'right', name: '이영돈TV', url: 'https://www.youtube.com/@leeyoungdonpd' },
    { camp: 'right', name: '이영풍TV', url: 'https://www.youtube.com/@poong_tv' },
    { camp: 'right', name: '이제봉교수', url: 'https://www.youtube.com/@jebonglee' },
    { camp: 'right', name: '이춘근TV', url: 'https://www.youtube.com/@tv-yg8lb' },
    { camp: 'right', name: '인싸it', url: 'https://www.youtube.com/@inssait' },
    { camp: 'right', name: '자유대한호국단', url: 'https://www.youtube.com/@jayuhoguk' },
    { camp: 'right', name: '전여옥TV', url: 'https://www.youtube.com/@yuok419' },
    { camp: 'right', name: '젊은시각', url: 'https://www.youtube.com/@redoutt' },
    { camp: 'right', name: '정법전TV', url: 'https://www.youtube.com/@chung-bubjeon' },
    { camp: 'right', name: '정완진TV', url: 'https://www.youtube.com/@wjtv' },
    { camp: 'right', name: '주진우의 이슈해설', url: 'https://www.youtube.com/@joojjinwoo' },
    { camp: 'right', name: '청년의소리TV', url: 'https://www.youtube.com/@youthvoice' },
    { camp: 'right', name: '최국튜브', url: 'https://www.youtube.com/@user-choijune511' },
    { camp: 'right', name: '펜앤마이크TV', url: 'https://www.youtube.com/@penn1tv' },
    { camp: 'right', name: '학소', url: 'https://www.youtube.com/@hakso' },
    { camp: 'right', name: '한길록 Hangilog', url: 'https://www.youtube.com/@hangilog' },
    { camp: 'right', name: '홍철기TV', url: 'https://www.youtube.com/@hongtv' },
    { camp: 'right', name: 'Bangmo뱅모', url: 'https://www.youtube.com/@bangmo7' },
    { camp: 'right', name: 'BJ톨', url: 'https://www.youtube.com/@bjtol' },
    { camp: 'right', name: 'GROUND C 그라운드씨', url: 'https://www.youtube.com/@groundc' },
    { camp: 'right', name: 'Korea Narrative Live', url: 'https://www.youtube.com/@koreanarrative' }
];

const API_KEY = "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";

export default async function handler(req: any, res: any) {
    // ⭐️ jamsil.uk 스타일 SWR 캐시:
    // 방문자는 0.05초 만에 즉시 직전 데이터를 보고, Vercel 서버는 60초마다 백그라운드에서 조용히 새 데이터를 갱신
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    try {
        // 1. 유효한 채널만 필터링 후 병렬 스캔 (타임아웃 4초)
        const validChannels = CHANNELS_DATABASE.filter(ch => ch.url && ch.url.includes('youtube.com/@'));

        const scanPromises = validChannels.map(async (ch) => {
            try {
                const liveUrl = ch.url.replace(/\/$/, '') + '/live';
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);

                const response = await fetch(liveUrl, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Accept-Language': 'ko-KR,ko;q=0.9',
                    },
                    redirect: 'follow',
                });
                clearTimeout(timeoutId);

                const finalUrl = response.url || '';
                const html = await response.text();

                // ⭐️ 진짜 라이브 스트리밍일 때만 나타나는 canonical watch URL 검증 (채널 홈 VOD 오판 방지)
                const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})">/);
                const urlMatch = finalUrl.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);

                const videoId = (canonicalMatch && canonicalMatch[1]) || (urlMatch && urlMatch[1]);

                // 실시간 라이브 중인지 확인 (isLiveStream 혹은 liveStreamability 키워드)
                const isRealLive = videoId && (
                    html.includes('"isLive":true') ||
                    html.includes('"isLiveStream":true') ||
                    html.includes('liveStreamabilityRenderer')
                );

                if (videoId && isRealLive) {
                    return {
                        camp: ch.camp,
                        channelName: ch.name,
                        videoId,
                    };
                }
            } catch (e) {
                // 개별 타임아웃 무시하고 계속 진행
            }
            return null;
        });

        const detected = (await Promise.all(scanPromises)).filter(Boolean) as Array<{
            camp: string;
            channelName: string;
            videoId: string;
        }>;

        const videoIds = Array.from(new Set(detected.map((d) => d.videoId)));
        const detailsMap: Record<string, { viewers: number; title: string }> = {};

        // 2. 유튜브 공식 API로 '현재 실시간 방송 중(live)'인 영상만 엄격 검증 & 시청자 수 조회
        if (videoIds.length > 0) {
            for (let i = 0; i < videoIds.length; i += 50) {
                const chunk = videoIds.slice(i, i + 50);
                try {
                    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${chunk.join(',')}&key=${API_KEY}`;
                    const apiRes = await fetch(apiUrl);
                    const apiData = await apiRes.json();

                    if (apiData.items) {
                        for (const item of apiData.items) {
                            // ⭐️ 핵심 방어: 현재 'live' 상태이며 시청자 수가 1명 이상인 생방송만 인정
                            const isCurrentlyLive = item.snippet?.liveBroadcastContent === 'live';
                            const concurrentViewers = item.liveStreamingDetails?.concurrentViewers;
                            const viewers = concurrentViewers ? parseInt(concurrentViewers, 10) : 0;

                            if (isCurrentlyLive && viewers > 0) {
                                detailsMap[item.id] = {
                                    viewers,
                                    title: item.snippet?.title || '',
                                };
                            }
                        }
                    }
                } catch (err) { }
            }
        }

        // 3. 진영별 분류 및 시청자 순 정렬 (채널당 1개만 단일 노출)
        const leftMap: Record<string, any> = {};
        const rightMap: Record<string, any> = {};

        for (const d of detected) {
            const details = detailsMap[d.videoId];
            // 유튜브 공식 API에서 실시간 라이브로 완벽 검증된 방송만 진입 허용
            if (details && details.viewers > 0) {
                const item = {
                    channelName: d.channelName,
                    title: details.title,
                    viewers: details.viewers,
                    thumbnail: `https://i.ytimg.com/vi/${d.videoId}/hqdefault.jpg`,
                    liveUrl: `https://www.youtube.com/watch?v=${d.videoId}`,
                };

                const targetMap = d.camp === 'left' ? leftMap : rightMap;
                if (!targetMap[d.channelName] || item.viewers > targetMap[d.channelName].viewers) {
                    targetMap[d.channelName] = item;
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
    } catch (error: any) {
        return res.status(200).json({ left: [], right: [], error: error?.message || 'error' });
    }
}