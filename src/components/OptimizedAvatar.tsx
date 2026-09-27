// src/components/OptimizedAvatar.tsx
import React, { useState, useEffect } from 'react';

interface OptimizedAvatarProps {
    src?: string;
    alt: string;
    targetSize?: number; // 화면 표시 크기 (기본 44px)
    className?: string;
    fallbackText?: string;
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
    src,
    alt,
    targetSize = 44,
    className = 'w-full h-full object-cover select-none',
    fallbackText,
}) => {
    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!src) {
            setHasError(true);
            return;
        }

        setHasError(false);
        let isMounted = true;
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.src = src;

        img.onload = () => {
            if (!isMounted) return;
            const renderSize = targetSize * 2; // 2x 레티나 규격 (88px)

            // ⭐️ [단계별 Mipmap 다운샘플링] 거대 원본을 국회 썸네일처럼 부드럽게 단계별 축소!
            if (img.width > renderSize || img.height > renderSize) {
                let curW = img.width;
                let curH = img.height;

                // 1단계: 절반씩 부드럽게 줄여나갈 가상 작업대
                let stepCanvas = document.createElement('canvas');
                stepCanvas.width = curW;
                stepCanvas.height = curH;
                let stepCtx = stepCanvas.getContext('2d');
                if (stepCtx) {
                    stepCtx.drawImage(img, 0, 0, curW, curH);
                }

                // 절반(50%)씩 깎아내려 픽셀 깨짐 원천 차단
                while (curW * 0.5 > renderSize && curH * 0.5 > renderSize) {
                    curW = Math.round(curW * 0.5);
                    curH = Math.round(curH * 0.5);
                    const nextCanvas = document.createElement('canvas');
                    nextCanvas.width = curW;
                    nextCanvas.height = curH;
                    const nextCtx = nextCanvas.getContext('2d');
                    if (nextCtx) {
                        nextCtx.imageSmoothingEnabled = true;
                        nextCtx.imageSmoothingQuality = 'high';
                        nextCtx.drawImage(stepCanvas, 0, 0, curW, curH);
                        stepCanvas = nextCanvas;
                    }
                }

                // 최종 단계: 목표 크기(88px)로 상단 중앙 정렬하여 완성!
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = renderSize;
                finalCanvas.height = renderSize;
                const finalCtx = finalCanvas.getContext('2d');

                if (finalCtx) {
                    finalCtx.imageSmoothingEnabled = true;
                    finalCtx.imageSmoothingQuality = 'high';

                    const scale = Math.max(renderSize / curW, renderSize / curH);
                    const w = curW * scale;
                    const h = curH * scale;
                    const x = (renderSize - w) / 2;
                    const y = 0; // 얼굴 기준 상단 정렬

                    finalCtx.drawImage(stepCanvas, x, y, w, h);
                    try {
                        const dataUrl = finalCanvas.toDataURL('image/png');
                        setCurrentSrc(dataUrl);
                    } catch (e) {
                        setCurrentSrc(src);
                    }
                }
            }
        };

        img.onerror = () => {
            if (isMounted) setCurrentSrc(src);
        };

        return () => {
            isMounted = false;
        };
    }, [src, targetSize]);

    if (hasError || !currentSrc) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 font-bold">
                {fallbackText || alt.slice(0, 1)}
            </div>
        );
    }

    return (
        <img
            src={currentSrc}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            style={{
                imageRendering: 'auto',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
            }}
            className={`${className} object-cover object-top pointer-events-none transition-opacity duration-200`}
            onError={() => setHasError(true)}
        />
    );
};