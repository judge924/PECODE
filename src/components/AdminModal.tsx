import React, { useState, useEffect } from 'react';

interface Suggestion {
    rowId: number;
    date: string;
    camp: string;
    channelName: string;
    channelUrl: string;
    status: string;
}

interface ActiveChannel {
    camp: string;
    name: string;
    channelId: string;
    url: string;
}

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_3oCwwq2VHCHZ_1N6S9hYF2a0IsSaFeidFdncqwaPY6q8Z4IvRNQvycjaE3q52Zk3/exec";

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [currentTab, setCurrentTab] = useState<'suggestions' | 'active'>('suggestions');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [activeChannels, setActiveChannels] = useState<ActiveChannel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 직접 등록 폼
    const [newCamp, setNewCamp] = useState<'left' | 'right'>('left');
    const [newName, setNewName] = useState('');
    const [newChannelId, setNewChannelId] = useState(''); // ⭐️ 고유 채널 ID 상태 추가
    const [newUrl, setNewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && isLoggedIn) {
            fetchData();
        }
    }, [isOpen, isLoggedIn, currentTab]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'pcd1234##') {
            setIsLoggedIn(true);
            setLoginError('');
            fetchData();
        } else {
            setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (currentTab === 'suggestions') {
                const res = await fetch(`${APPS_SCRIPT_URL}?action=suggestions`);
                const json = await res.json();
                if (json.suggestions) setSuggestions(json.suggestions);
            } else {
                const res = await fetch(`${APPS_SCRIPT_URL}?action=channels`);
                const json = await res.json();
                if (json.channels) setActiveChannels(json.channels);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (sug: Suggestion) => {
        if (!confirm(`'${sug.channelName}' 채널을 정식 활성 목록에 추가하시겠습니까?`)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'approve',
                    rowId: sug.rowId,
                    camp: sug.camp.toLowerCase().includes('우') || sug.camp.toLowerCase() === 'right' ? 'right' : 'left',
                    channelName: sug.channelName,
                    channelUrl: sug.channelUrl
                })
            });
            const json = await res.json();
            if (json.success) {
                alert('성공적으로 승인 및 등록되었습니다.');
                fetchData();
            } else {
                alert('승인 실패: ' + json.error);
            }
        } catch (err: any) {
            alert('통신 오류: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddDirect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newChannelId.trim()) {
            alert('채널명과 고유 채널 ID(UC...)를 모두 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'add',
                    camp: newCamp,
                    channelName: newName.trim(),
                    channelId: newChannelId.trim(), // ⭐️ 관리자가 적은 고유 ID 전송
                    channelUrl: newUrl.trim()
                })
            });
            const json = await res.json();
            if (json.success) {
                alert('채널이 성공적으로 등록되었습니다.');
                setNewName('');
                setNewChannelId('');
                setNewUrl('');
                fetchData();
            } else {
                alert('추가 실패: ' + json.error);
            }
        } catch (err: any) {
            alert('통신 오류: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteChannel = async (channelName: string) => {
        if (!confirm(`'${channelName}' 채널을 정말로 삭제하시겠습니까?`)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete',
                    channelName: channelName
                })
            });
            const json = await res.json();
            if (json.success) {
                alert('채널이 삭제되었습니다.');
                fetchData();
            }
        } catch (err: any) {
            alert('통신 오류: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans text-neutral-900">
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                {/* 상단 미니멀 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#fbfbfb]">
                    <div className="flex items-center gap-2.5">
                        <span className="text-base">🛡️</span>
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-neutral-900">PECODE 관리자 시스템</h2>
                            <p className="text-[11px] text-neutral-400">유튜브 라이브 데이터베이스 및 건의 관리</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLoggedIn && (
                            <button
                                onClick={handleLogout}
                                className="text-[11px] font-medium px-2.5 py-1 rounded-md text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors"
                            >
                                로그아웃
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors text-sm leading-none"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 바디 영역 */}
                {!isLoggedIn ? (
                    // 🔐 The Org 스타일 미니멀 로그인 창
                    <div className="p-8 max-w-sm mx-auto w-full flex flex-col justify-center my-auto">
                        <div className="text-center mb-6">
                            <div className="inline-flex p-3 rounded-full bg-neutral-100 text-neutral-800 mb-3 text-lg">
                                🔒
                            </div>
                            <h3 className="text-base font-bold text-neutral-900">관리자 인증</h3>
                            <p className="text-xs text-neutral-500 mt-1">접근 권한이 있는 관리자 계정으로 로그인해 주세요.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">아이디</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">비밀번호</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                                    required
                                />
                            </div>

                            {loginError && (
                                <p className="text-[11px] text-red-500 font-medium">{loginError}</p>
                            )}

                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-black text-white font-semibold text-xs transition-colors shadow-sm mt-2"
                            >
                                관리자 로그인
                            </button>
                        </form>
                    </div>
                ) : (
                    // 📊 The Org 스타일 관리자 대시보드
                    <div className="flex flex-col flex-1 overflow-hidden">
                        {/* 미니멀 탭 네비게이션 */}
                        <div className="flex items-center justify-between px-6 border-b border-neutral-200 bg-white">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setCurrentTab('suggestions')}
                                    className={`py-3 text-xs font-bold border-b-2 transition-colors ${currentTab === 'suggestions'
                                        ? 'border-neutral-900 text-neutral-900'
                                        : 'border-transparent text-neutral-400 hover:text-neutral-700'
                                        }`}
                                >
                                    📢 방문자 채널 건의함
                                </button>
                                <button
                                    onClick={() => setCurrentTab('active')}
                                    className={`py-3 text-xs font-bold border-b-2 transition-colors ${currentTab === 'active'
                                        ? 'border-neutral-900 text-neutral-900'
                                        : 'border-transparent text-neutral-400 hover:text-neutral-700'
                                        }`}
                                >
                                    ⚡ 활성 채널 목록 ({activeChannels.length})
                                </button>
                            </div>

                            <button
                                onClick={fetchData}
                                disabled={isLoading}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                {isLoading ? '새로고침 중...' : '🔄 새로고침'}
                            </button>
                        </div>

                        {/* 탭 본문 내용 */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                            {currentTab === 'suggestions' ? (
                                // 1) 건의함 탭
                                <div>
                                    <div className="text-[11px] text-neutral-500 mb-3">
                                        방문자들이 건의한 채널입니다. [승인 및 추가]를 누르면 즉시 활성 채널로 등록됩니다.
                                    </div>

                                    {isLoading ? (
                                        <div className="text-center py-12 text-xs text-neutral-400">데이터를 불러오는 중입니다...</div>
                                    ) : suggestions.length === 0 ? (
                                        <div className="text-center py-12 text-xs text-neutral-400">접수된 건의 내역이 없습니다.</div>
                                    ) : (
                                        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                            <table className="w-full text-left text-xs text-neutral-700">
                                                <thead className="bg-neutral-50 font-bold text-[11px] text-neutral-500 border-b border-neutral-200">
                                                    <tr>
                                                        <th className="p-3">신청일시</th>
                                                        <th className="p-3">성향</th>
                                                        <th className="p-3">채널명</th>
                                                        <th className="p-3">채널 주소</th>
                                                        <th className="p-3">상태</th>
                                                        <th className="p-3 text-right">작업</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100 text-[11px]">
                                                    {suggestions.map((sug, idx) => (
                                                        <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                                                            <td className="p-3 text-neutral-400 font-mono text-[10px]">{sug.date}</td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sug.camp.includes('좌') || sug.camp === 'left'
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                                                    }`}>
                                                                    {sug.camp}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 font-semibold text-neutral-900">{sug.channelName}</td>
                                                            <td className="p-3">
                                                                <a
                                                                    href={sug.channelUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-neutral-500 hover:text-neutral-900 hover:underline truncate block max-w-[200px]"
                                                                >
                                                                    {sug.channelUrl}
                                                                </a>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${sug.status === '승인완료'
                                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                                    : 'bg-neutral-100 text-neutral-600'
                                                                    }`}>
                                                                    {sug.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                {sug.status !== '승인완료' && (
                                                                    <button
                                                                        onClick={() => handleApprove(sug)}
                                                                        disabled={isSubmitting}
                                                                        className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded-md text-[10px] font-bold transition-colors disabled:opacity-50"
                                                                    >
                                                                        승인 및 추가
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // 2) 활성 채널 탭
                                <div className="space-y-5">
                                    {/* 새 채널 직접 등록 폼 (5칸 분리 정렬) */}
                                    <form onSubmit={handleAddDirect} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
                                        <h4 className="text-xs font-bold text-neutral-900 mb-3">➕ 새 정치 유튜브 채널 직접 등록</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                                            <div>
                                                <select
                                                    value={newCamp}
                                                    onChange={(e: any) => setNewCamp(e.target.value)}
                                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 focus:outline-none focus:border-neutral-900"
                                                >
                                                    <option value="left">좌파</option>
                                                    <option value="right">우파</option>
                                                </select>
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    placeholder="채널명"
                                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newChannelId}
                                                    onChange={(e) => setNewChannelId(e.target.value)}
                                                    placeholder="고유 채널 ID (UC...)"
                                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 font-mono text-[11px]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newUrl}
                                                    onChange={(e) => setNewUrl(e.target.value)}
                                                    placeholder="채널 주소 (선택)"
                                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                                                />
                                            </div>
                                            <div>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full py-2 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {isSubmitting ? '등록 중...' : '즉시 추가'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    {/* 활성 목록 표 */}
                                    {isLoading ? (
                                        <div className="text-center py-12 text-xs text-neutral-400">데이터를 불러오는 중입니다...</div>
                                    ) : (
                                        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                            <table className="w-full text-left text-xs text-neutral-700">
                                                <thead className="bg-neutral-50 font-bold text-[11px] text-neutral-500 border-b border-neutral-200">
                                                    <tr>
                                                        <th className="p-3">성향</th>
                                                        <th className="p-3">채널명</th>
                                                        <th className="p-3">고유 채널 ID (UC...)</th>
                                                        <th className="p-3">채널 주소</th>
                                                        <th className="p-3 text-right">관리</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100 text-[11px]">
                                                    {activeChannels.map((ch, idx) => (
                                                        <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                                                            <td className="p-3">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ch.camp === 'left'
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                                                    }`}>
                                                                    {ch.camp === 'left' ? 'The Left' : 'The Right'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 font-semibold text-neutral-900">{ch.name}</td>
                                                            <td className="p-3 text-neutral-400 font-mono text-[10px]">{ch.channelId || '-'}</td>
                                                            <td className="p-3">
                                                                <a
                                                                    href={ch.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-neutral-500 hover:text-neutral-900 hover:underline truncate block max-w-[180px]"
                                                                >
                                                                    {ch.url}
                                                                </a>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <button
                                                                    onClick={() => handleDeleteChannel(ch.name)}
                                                                    disabled={isSubmitting}
                                                                    className="px-2 py-0.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded text-[10px] font-medium transition-colors"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};