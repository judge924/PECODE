import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

export interface LiveChannel {
    channelName: string;
    title?: string;
    viewers: number;
    thumbnail: string;
    liveUrl: string;
}

interface LiveSidebarProps {
    camp: 'left' | 'right';
    apiUrl?: string;
    suggestApiUrl?: string;
}

const formatViewers = (count: number) => {
    if (!count || count === 0) return '0명';
    return `${count.toLocaleString()}명`;
};

const extractVideoId = (url: string, thumb?: string): string => {
    if (url) {
        const vMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (vMatch) return vMatch[1];
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortMatch) return shortMatch[1];
    }
    if (thumb) {
        const thumbMatch = thumb.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
        if (thumbMatch) return thumbMatch[1];
    }
    return '';
};

export const LiveSidebar: React.FC<LiveSidebarProps> = ({ camp, apiUrl, suggestApiUrl }) => {
    const isLeft = camp === 'left';
    const [channels, setChannels] = useState<LiveChannel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const sidebarRef = useRef<HTMLElement | null>(null);
    const scrollableRef = useRef<HTMLDivElement | null>(null);

    // 2위 이하 호버 재생
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    // ⭐️ 1위 영상 일시정지 아이콘 완벽 방어 타이머
    const [isVideoReady, setIsVideoReady] = useState(false);

    // 건의하기 팝업 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suggestName, setSuggestName] = useState('');
    const [suggestCamp, setSuggestCamp] = useState(isLeft ? '좌파' : '우파');
    const [suggestUrl, setSuggestUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        if (!apiUrl || apiUrl.includes("당신의_배포")) {
            setLoading(false);
            return;
        }

        const fetchLive = async () => {
            try {
                const res = await fetch(apiUrl);
                const data = await res.json();
                const list: LiveChannel[] = isLeft ? data.left : data.right;

                // ⭐️ [화면 보호] 새 데이터가 정상적으로 1개 이상 있을 때만 화면을 갱신하고,
                // 만약 일시적인 랙으로 0개가 오면 기존에 잘 나오던 목록을 지우지 않고 유지!
                if (list && list.length > 0) {
                    setChannels(list);
                }
            } catch (err) {
                console.warn("라이브 데이터 갱신 중:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLive();
        const timer = setInterval(fetchLive, 30000);
        return () => clearInterval(timer);
    }, [apiUrl, isLeft]);

    // ⭐️ [스크롤 제어] 1위 고정 및 스크롤 전파 방지
    const handleWheel = useCallback((e: WheelEvent) => {
        const scrollEl = scrollableRef.current;
        if (!scrollEl) {
            e.preventDefault();
            return;
        }

        const isScrollable = scrollEl.scrollHeight > scrollEl.clientHeight;
        if (!isScrollable) {
            e.preventDefault();
            return;
        }

        const isAtTop = scrollEl.scrollTop <= 0 && e.deltaY < 0;
        const isAtBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1 && e.deltaY > 0;

        if (isAtTop || isAtBottom) {
            e.preventDefault();
        } else if (!scrollEl.contains(e.target as Node)) {
            scrollEl.scrollTop += e.deltaY;
            e.preventDefault();
        }
    }, []);

    const setSidebarRef = useCallback((node: HTMLElement | null) => {
        if (sidebarRef.current) {
            sidebarRef.current.removeEventListener('wheel', handleWheel);
        }
        if (node) {
            node.addEventListener('wheel', handleWheel, { passive: false });
        }
        sidebarRef.current = node;
    }, [handleWheel]);

    const uniqueChannels = useMemo(() => {
        const channelMap = new Map<string, LiveChannel>();
        const liveNowChannels = channels.filter((c) => c.viewers > 0);

        for (const item of liveNowChannels) {
            const existing = channelMap.get(item.channelName);
            if (!existing || item.viewers > existing.viewers) {
                channelMap.set(item.channelName, item);
            }
        }
        return Array.from(channelMap.values()).sort((a, b) => b.viewers - a.viewers);
    }, [channels]);

    const firstChannel = uniqueChannels[0];
    const restChannels = uniqueChannels.slice(1);
    const firstVideoId = firstChannel ? extractVideoId(firstChannel.liveUrl, firstChannel.thumbnail) : '';

    // ⭐️ [핵심] 1위 영상 ID가 "실제로 도착한 시점"부터 5초간 썸네일 가림막 완벽 유지
    useEffect(() => {
        if (firstVideoId) {
            setIsVideoReady(false);
            const timer = setTimeout(() => {
                setIsVideoReady(true);
            }, 5000); // 5초 동안 일시정지 아이콘과 버퍼링을 썸네일 뒤에서 완전히 통과시킴
            return () => clearTimeout(timer);
        }
    }, [firstVideoId]);

    const handleSuggestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!suggestName.trim() || !suggestUrl.trim()) {
            alert('채널명과 채널 주소를 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const targetUrl = suggestApiUrl || apiUrl;
            if (targetUrl) {
                await fetch(targetUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        channelName: suggestName.trim(),
                        camp: suggestCamp,
                        channelUrl: suggestUrl.trim()
                    })
                });
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                setIsModalOpen(false);
                setSubmitSuccess(false);
                setSuggestName('');
                setSuggestUrl('');
            }, 1800);
        } catch (err) {
            alert('건의 전송에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const badgeColor = isLeft ? 'bg-[#004ea2] text-white' : 'bg-[#e61e2b] text-white';

    return (
        <>
            <aside
                ref={setSidebarRef}
                className={`hidden 2xl:flex flex-col w-[195px] fixed top-[125px] ${isLeft ? 'left-4' : 'right-4'
                    } max-h-[calc(100vh-140px)] z-20 pointer-events-auto select-none`}
            >
                {/* 1. 상단 헤더 영역 */}
                <div className="shrink-0 flex flex-col gap-1.5 pb-2 border-b border-neutral-200/70 bg-[#fcfcfc]">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-200/50">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            {isLeft ? 'The Left' : 'The Right'}
                        </span>
                        <button
                            onClick={() => {
                                setSuggestCamp(isLeft ? '좌파' : '우파');
                                setIsModalOpen(true);
                            }}
                            className="text-[10px] text-neutral-400 hover:text-neutral-900 flex items-center gap-0.5 font-normal transition cursor-pointer hover:underline"
                        >
                            <span>+ 채널 건의</span>
                        </button>
                    </div>

                    {/* ⭐️ [첫 1초 로딩 중 화면] 세련된 미니 스피너 및 안내 메시지 */}
                    {loading && (
                        <div className="py-6 flex flex-col items-center justify-center gap-2 text-neutral-400">
                            <div className="w-4 h-4 border-2 border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
                            <span className="text-[10px] font-medium tracking-tight">실시간 라이브 집계 중...</span>
                        </div>
                    )}

                    {/* 로딩 완료 후 방송이 0개일 때 */}
                    {!loading && uniqueChannels.length === 0 && (
                        <div className="py-6 text-center text-[10px] text-neutral-400 font-normal leading-relaxed">
                            현재 진행 중인<br />생방송이 없습니다.
                        </div>
                    )}

                    {/* ⭐️ 대망의 1위 고정 채널 카드 */}
                    {!loading && firstChannel && (
                        <a
                            href={firstChannel.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col gap-1 transition-transform duration-150 hover:-translate-y-0.5 mt-0.5"
                        >
                            <div className="flex items-center justify-between gap-1 text-[11px]">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                        className={`w-3.5 h-3.5 flex items-center justify-center rounded text-[9px] font-black shrink-0 ${badgeColor}`}
                                    >
                                        1
                                    </span>
                                    <span className="font-normal text-neutral-800 truncate group-hover:text-black">
                                        {firstChannel.channelName}
                                    </span>
                                </div>
                                <span className="font-normal text-neutral-900 shrink-0 tabular-nums text-[10px]">
                                    {formatViewers(firstChannel.viewers)}
                                </span>
                            </div>

                            {firstChannel.title && (
                                <div className="text-[10px] text-neutral-500 font-normal truncate group-hover:text-neutral-700 leading-tight">
                                    {firstChannel.title}
                                </div>
                            )}

                            {/* 1위 영상 화면: 썸네일이 5초간 완벽히 가려주어 일시정지 아이콘 노출 0% */}
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-sm border border-neutral-200/60 mt-0.5">
                                {firstVideoId && (
                                    <iframe
                                        src={`https://www.youtube-nocookie.com/embed/${firstVideoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`}
                                        title={firstChannel.channelName}
                                        className="w-full h-full object-cover pointer-events-none scale-105"
                                        allow="autoplay; encrypted-media"
                                    />
                                )}

                                {/* 가림막 썸네일 (5초 뒤 스르륵 투명화) */}
                                {firstChannel.thumbnail && (
                                    <img
                                        src={firstChannel.thumbnail}
                                        alt={firstChannel.channelName}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${isVideoReady ? 'opacity-0' : 'opacity-100'
                                            }`}
                                        referrerPolicy="no-referrer"
                                    />
                                )}

                                <span className="absolute bottom-1 right-1 bg-red-600 text-[8px] font-black text-white px-1 py-0.5 rounded leading-none pointer-events-none z-10">
                                    LIVE
                                </span>
                            </div>
                        </a>
                    )}
                </div>

                {/* 2. 하단 독립 스크롤 영역 (2위부터) */}
                {!loading && restChannels.length > 0 && (
                    <div
                        ref={scrollableRef}
                        className="flex-1 overflow-y-auto overscroll-y-contain scrollbar-none pt-2.5 flex flex-col gap-3"
                    >
                        {restChannels.map((channel, idx) => {
                            const videoId = extractVideoId(channel.liveUrl, channel.thumbnail);
                            const isHovered = hoveredIdx === idx;

                            return (
                                <a
                                    key={idx}
                                    href={channel.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onMouseEnter={() => setHoveredIdx(idx)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                    className="group flex flex-col gap-1 transition-transform duration-150 hover:-translate-y-0.5"
                                >
                                    <div className="flex items-center justify-between gap-1 text-[11px]">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="w-3.5 h-3.5 flex items-center justify-center rounded text-[9px] font-black shrink-0 bg-neutral-200 text-neutral-600">
                                                {idx + 2}
                                            </span>
                                            <span className="font-normal text-neutral-800 truncate group-hover:text-black">
                                                {channel.channelName}
                                            </span>
                                        </div>
                                        <span className="font-normal text-neutral-900 shrink-0 tabular-nums text-[10px]">
                                            {formatViewers(channel.viewers)}
                                        </span>
                                    </div>

                                    {channel.title && (
                                        <div className="text-[10px] text-neutral-500 font-normal truncate group-hover:text-neutral-700 leading-tight">
                                            {channel.title}
                                        </div>
                                    )}

                                    {/* 2위 이하 호버 재생 */}
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-sm border border-neutral-200/60 mt-0.5">
                                        {isHovered && videoId ? (
                                            <iframe
                                                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`}
                                                title={channel.channelName}
                                                className="w-full h-full object-cover pointer-events-none scale-105 animate-fade-in"
                                                allow="autoplay; encrypted-media"
                                            />
                                        ) : channel.thumbnail ? (
                                            <img
                                                src={channel.thumbnail}
                                                alt={channel.channelName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-400">
                                                LIVE
                                            </div>
                                        )}
                                        <span className="absolute bottom-1 right-1 bg-red-600 text-[8px] font-black text-white px-1 py-0.5 rounded leading-none pointer-events-none">
                                            LIVE
                                        </span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
            </aside>

            {/* 유튜브 채널 건의 팝업 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-neutral-200 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 transition"
                        >
                            ✕
                        </button>

                        <h3 className="text-base font-bold text-neutral-900 mb-1">
                            유튜브 채널 건의하기
                        </h3>
                        <p className="text-xs text-neutral-500 mb-4">
                            추천하고 싶으신 정치 유튜브 채널을 알려주세요!<br />
                            관리자 검토 후 라이브 목록에 반영됩니다.
                        </p>

                        {submitSuccess ? (
                            <div className="py-8 text-center">
                                <div className="text-3xl mb-2">🎉</div>
                                <div className="text-sm font-bold text-neutral-900">건의가 접수되었습니다!</div>
                                <div className="text-xs text-neutral-500 mt-1">소중한 의견 감사드립니다.</div>
                            </div>
                        ) : (
                            <form onSubmit={handleSuggestSubmit} className="flex flex-col gap-3.5">
                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                        채널명 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="예: 김어준의 겸손은힘들다, 배승희 변호사"
                                        value={suggestName}
                                        onChange={(e) => setSuggestName(e.target.value)}
                                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                        정치 성향 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <label className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg border text-xs cursor-pointer font-medium transition ${suggestCamp === '좌파'
                                            ? 'border-[#004ea2] bg-blue-50/50 text-[#004ea2]'
                                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="camp"
                                                value="좌파"
                                                checked={suggestCamp === '좌파'}
                                                onChange={(e) => setSuggestCamp(e.target.value)}
                                                className="sr-only"
                                            />
                                            좌파
                                        </label>

                                        <label className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg border text-xs cursor-pointer font-medium transition ${suggestCamp === '우파'
                                            ? 'border-[#e61e2b] bg-red-50/50 text-[#e61e2b]'
                                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="camp"
                                                value="우파"
                                                checked={suggestCamp === '우파'}
                                                onChange={(e) => setSuggestCamp(e.target.value)}
                                                className="sr-only"
                                            />
                                            우파
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                        유튜브 채널 주소 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="예: https://www.youtube.com/@채널명"
                                        value={suggestUrl}
                                        onChange={(e) => setSuggestUrl(e.target.value)}
                                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black transition"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-2 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg transition disabled:bg-neutral-400"
                                >
                                    {isSubmitting ? '전송 중...' : '건의하기'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};