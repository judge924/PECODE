// 🛑 안전 스위치: 구글 API 호출 전면 중단 (포인트 소모 0)
export default async function handler(req: any, res: any) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    return res.status(200).json({
        left: [],
        right: [],
        status: "PAUSED_FOR_ARCHITECTURE_SETUP",
        updatedAt: new Date().toISOString()
    });
}