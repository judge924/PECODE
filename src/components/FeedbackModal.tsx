import React, { useState } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestApiUrl: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, suggestApiUrl }) => {
    const [target, setTarget] = useState('');
    const [content, setContent] = useState('');
    const [contact, setContact] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target.trim() || !content.trim()) {
            alert('대상(의원명 또는 정당)과 수정 요청 내용을 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(suggestApiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'feedback',
                    target: target.trim(),
                    content: content.trim(),
                    contact: contact.trim()
                })
            });
            const json = await res.json();
            if (json.success) {
                setSubmitSuccess(true);
                setTimeout(() => {
                    setSubmitSuccess(false);
                    setTarget('');
                    setContent('');
                    setContact('');
                    onClose();
                }, 1800);
            } else {
                alert('전송 실패: ' + json.error);
            }
        } catch (err: any) {
            alert('통신 오류: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans text-neutral-900 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-neutral-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 transition"
                >
                    ✕
                </button>

                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">✍️</span>
                    <h3 className="text-base font-bold text-neutral-900">데이터 오류 수정 제안</h3>
                </div>
                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                    잘못된 정보(당적, 선거구, 오타 등)를 알려주시면 신속히 수정하겠습니다.
                </p>

                {submitSuccess ? (
                    <div className="py-8 text-center">
                        <div className="text-3xl mb-2">🎉</div>
                        <div className="text-sm font-bold text-neutral-900">소중한 제보가 접수되었습니다!</div>
                        <div className="text-xs text-neutral-500 mt-1">더 정확한 정치 데이터를 위해 검토하겠습니다.</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                대상의원 또는 정당 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="예: 박지원 의원, 국민의힘"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black transition"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                수정 요청 내용 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={3}
                                placeholder="예: 박지원 의원의 14대는 목포가 아니라 전국구입니다."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black transition resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                제보자 닉네임 또는 연락처 (선택)
                            </label>
                            <input
                                type="text"
                                placeholder="이메일 또는 닉네임 (선택사항)"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-2 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg transition disabled:bg-neutral-400 cursor-pointer shadow-sm"
                        >
                            {isSubmitting ? '전송 중...' : '수정 의견 보내기'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};