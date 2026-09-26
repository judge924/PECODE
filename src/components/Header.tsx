import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentRegion: string;
  onRegionChange: (region: string) => void;
  viewMode?: 'chart' | 'list';
  onViewModeChange?: (mode: 'chart' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdminClick?: () => void;
  onFeedbackClick?: () => void;
}

// -------------------------------------------------------------
// [대한민국 국기법 공식 표준] 정방향 100% 순수 SVG 태극기
// -------------------------------------------------------------
const Taegeukgi: React.FC<{ className?: string }> = ({ className = 'w-10 h-6.5' }) => (
  <svg
    viewBox="-72 -48 144 96"
    className={`${className} select-none shrink-0 block`}
  >
    <rect x="-72" y="-48" width="144" height="96" fill="#ffffff" rx="2" />
    <g stroke="#000000" strokeWidth="4">
      <path
        transform="rotate(33.69006752598)"
        d="M-50-12v24m6 0v-24m6 0v24m76 0V1m0-2v-11m6 0v11m0 2v11m6 0V1m0-2v-11"
      />
      <path
        transform="rotate(-33.69006752598)"
        d="M-50-12v24m6 0V1m0-2v-11m6 0v24m76 0V1m0-2v-11m6 0v24m6 0V1m0-2v-11"
      />
    </g>
    <g transform="rotate(33.69006752598)">
      <path fill="#cd2e3a" d="M12 0a18 18 0 11-36 0 24 24 0 1148 0" />
      <path fill="#0047a0" d="M0 0a12 12 0 1124 0 24 24 0 11-48 0 12 12 0 1024 0" />
    </g>
  </svg>
);

// -------------------------------------------------------------
// 헌법기관 6대 수장 데이터 및 헌법 전문
// -------------------------------------------------------------
interface HeadOrgan {
  id: string;
  branch: string;
  title: string;        // 직책 (볼드 블랙)
  name: string;         // 인물명 (일반 굵기 블랙)
  image: string;        // 인물 사진 경로
  chapterTitle: string; // 헌법 장 명칭
  articles: { num: string; text: string }[];
}

const CONSTITUTION_HEADS: HeadOrgan[] = [
  // 1. 대통령 (행정부/국가원수)
  {
    id: 'president',
    branch: '행정부',
    title: '대통령',
    name: '이재명',
    image: '/images/heads/president.png',
    chapterTitle: '대한민국 헌법 제4장 정부 (제1절 대통령)',
    articles: [
      { num: '제66조', text: '① 대통령은 국가의 원수이며, 외국에 대하여 국가를 대표한다.\n② 대통령은 국가의 독립·영토의 보전·국가의 계속성과 헌법을 수호할 책무를 진다.\n③ 대통령은 조국의 평화적 통일을 위한 성실한 의무를 진다.\n④ 행정권은 대통령을 수반으로 하는 정부에 속한다.' },
      { num: '제67조', text: '① 대통령은 국민의 보통·평등·직접·비밀선거에 의하여 선출한다.\n② 제1항의 선거에 있어서 최고득표자가 2인 이상인 때에는 국회의 재적의원 과반수가 출석한 공개회의에서 다수표를 얻은 자를 당선자로 한다.' },
      { num: '제68조', text: '① 대통령의 임기가 만료되는 때에는 임기만료 70일 내지 40일전에 후임자를 선거한다.\n② 대통령이 궐위된 때 또는 대통령 당선자가 사망하거나 판결 기타의 사유로 그 자격을 상실한 때에는 60일 이내에 후임자를 선거한다.' },
      { num: '제69조', text: '대통령은 취임에 즈음하여 다음의 선서를 한다.\n"나는 헌법을 준수하고 국가를 보위하며 조국의 평화적 통일과 국민의 자유와 복리의 증진 및 민족문화의 창달에 노력하여 대통령으로서의 직책을 성실히 수행할 것을 국민 앞에 엄숙히 선서합니다."' },
      { num: '제70조', text: '대통령의 임기는 5년으로 하며, 중임할 수 없다.' },
      { num: '제71조', text: '대통령이 궐위되거나 사고로 인하여 직무를 수행할 수 없을 때에는 국무총리, 법률이 정한 국무위원의 순위로 그 권한을 대행한다.' },
      { num: '제72조', text: '대통령은 필요하다고 인정할 때에는 외교·국방·통일 기타 국가안위에 관한 중요정책을 국민투표에 붙일 수 있다.' },
      { num: '제73조', text: '대통령은 조약을 체결·비준하고, 외교사절을 신임·접수 또는 파견하며, 선전포고와 강화를 한다.' },
      { num: '제74조', text: '① 대통령은 헌법과 법률이 정하는 바에 의하여 국군을 통수한다.' }
    ]
  },
  // 2. 국회의장 (입법부)
  {
    id: 'assembly',
    branch: '입법부',
    title: '국회의장',
    name: '조정식',
    image: '/images/heads/assembly.png',
    chapterTitle: '대한민국 헌법 제3장 국회',
    articles: [
      { num: '제40조', text: '입법권은 국회에 속한다.' },
      { num: '제41조', text: '① 국회는 국민의 보통·평등·직접·비밀선거에 의하여 선출된 국회의원으로 구성한다.\n② 국회의원의 수는 법률로 정하되, 200인 이상으로 한다.\n③ 국회의원의 선거구와 비례대표제 기타 선거에 관한 사항은 법률로 정한다.' },
      { num: '제42조', text: '국회의원의 임기는 4년으로 한다.' },
      { num: '제43조', text: '국회의원은 법률이 정하는 직을 겸할 수 없다.' },
      { num: '제44조', text: '① 국회의원은 현행범인인 경우를 제외하고는 회기중 국회의 동의없이 체포 또는 구금되지 아니한다.\n② 국회의원이 회기전에 체포 또는 구금된 때에는 현행범인이 아닌 한 국회의 요구가 있으면 회기중 석방된다.' },
      { num: '제45조', text: '국회의원은 국회에서 직무상 행한 발언과 표결에 관하여 국회외에서 책임을 지지 아니한다.' },
      { num: '제46조', text: '① 국회의원은 청렴의 의무가 있다.\n② 국회의원은 국가이익을 우선하여 양심에 따라 직무를 행한다.\n③ 국회의원은 그 지위를 남용하여 국가·공공단체 또는 기업체와의 계약이나 그 처분에 의하여 재산상의 권리·이익 또는 직위를 취득하거나 타인을 위하여 그 취득을 알선할 수 없다.' },
      { num: '제47조', text: '① 국회의 정기회는 법률이 정하는 바에 의하여 매년 1회 집회되며, 국회의 임시회는 대통령 또는 국회재적의원 4분의 1 이상의 요구에 의하여 집회된다.\n② 정기회의 회기는 100일을, 임시회의 회기는 30일을 초과할 수 없다.' },
      { num: '제48조', text: '국회는 의장 1인과 부의장 2인을 선출한다.' },
      { num: '제49조', text: '국회는 헌법 또는 법률에 특별한 규정이 없는 한 재적의원 과반수의 출석과 출석의원 과반수의 찬성으로 의결한다. 가부동수인 때에는 부결된 것으로 본다.' },
      { num: '제50조', text: '① 국회의 회의는 공개한다. 다만, 출석의원 과반수의 찬성이 있거나 의장이 국가의 안전보장을 위하여 필요하다고 인정할 때에는 공개하지 아니할 수 있다.' }
    ]
  },
  // 3. 대법원장 (사법부)
  {
    id: 'court',
    branch: '사법부',
    title: '대법원장',
    name: '조희대',
    image: '/images/heads/court.png',
    chapterTitle: '대한민국 헌법 제5장 법원',
    articles: [
      { num: '제101조', text: '① 사법권은 법관으로 구성된 법원에 속한다.\n② 법원은 최고법원인 대법원과 각급법원으로 조직된다.\n③ 법관의 자격은 법률로 정한다.' },
      { num: '제102조', text: '① 대법원에 부를 둘 수 있다.\n② 대법원에 대법관을 둔다. 다만, 법률이 정하는 바에 의하여 대법관이 아닌 법관을 둘 수 있다.\n③ 대법원과 각급법원의 조직은 법률로 정한다.' },
      { num: '제103조', text: '법관은 헌법과 법률에 의하여 그 양심에 따라 독립하여 심판한다.' },
      { num: '제104조', text: '① 대법원장은 국회의 동의를 얻어 대통령이 임명한다.\n② 대법관은 대법원장의 제청으로 국회의 동의를 얻어 대통령이 임명한다.\n③ 대법원장과 대법관이 아닌 법관은 대법관회의의 동의를 얻어 대법원장이 임명한다.' },
      { num: '제105조', text: '① 대법원장의 임기는 6년으로 하며, 중임할 수 없다.\n② 대법관의 임기는 6년으로 하며, 법률이 정하는 바에 의하여 연임할 수 있다.\n③ 대법원장과 대법관이 아닌 법관의 임기는 10년으로 하며, 법률이 정하는 바에 의하여 연임할 수 있다.\n④ 법관의 정년은 법률로 정한다.' },
      { num: '제106조', text: '① 법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.' }
    ]
  },
  // 4. 헌재소장
  {
    id: 'const_court',
    branch: '헌법재판소',
    title: '헌재소장',
    name: '김상환',
    image: '/images/heads/const_court.png',
    chapterTitle: '대한민국 헌법 제6장 헌법재판소',
    articles: [
      { num: '제111조', text: '① 헌법재판소는 다음 사항을 관장한다.\n  1. 법원의 제청에 의한 법률의 위헌여부 심판\n  2. 탄핵의 심판\n  3. 정당의 해산 심판\n  4. 국가기관 상호간, 국가기관과 지방자치단체간 및 지방자치단체 상호간의 권한쟁의에 관한 심판\n  5. 법률이 정하는 헌법소원에 관한 심판\n② 헌법재판소는 재판관 9인의 재판관으로 구성하며, 재판관은 대통령이 임명한다.\n③ 제2항의 재판관중 3인은 국회에서 선출하는 자를, 3인은 대법원장이 지명하는 자를 임명한다.\n④ 헌법재판소의 장은 국회의 동의를 얻어 재판관중에서 대통령이 임명한다.' },
      { num: '제112조', text: '① 헌법재판소 재판관의 임기는 6년으로 하며, 법률이 정하는 바에 의하여 연임할 수 있다.\n② 헌법재판소 재판관은 정당에 가입하거나 정치에 관여할 수 없다.\n③ 헌법재판소 재판관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니한다.' },
      { num: '제113조', text: '① 헌법재판소에서 법률의 위헌결정, 탄핵의 결정, 정당해산의 결정 또는 헌법소원에 관한 인용결정을 할 때에는 재판관 6인 이상의 찬성이 있어야 한다.\n② 헌법재판소는 법률에 저촉되지 아니하는 범위안에서 심판에 관한 절차, 내부규율과 사무처리에 관한 규칙을 제정할 수 있다.' }
    ]
  },
  // 5. 국무총리
  {
    id: 'prime_minister',
    branch: '행정부 (국무총리)',
    title: '국무총리',
    name: '한덕수',
    image: '/images/heads/prime_minister.png',
    chapterTitle: '대한민국 헌법 제4장 정부 (제2절 행정부 제1관 국무총리)',
    articles: [
      { num: '제86조', text: '① 국무총리는 국회의 동의를 얻어 대통령이 임명한다.\n② 국무총리는 대통령을 보좌하며, 행정에 관하여 대통령의 명을 받아 행정각부를 통할한다.\n③ 군인은 현역을 면한 후가 아니면 국무총리로 임명될 수 없다.' },
      { num: '제87조', text: '① 국무위원은 국무총리의 제청으로 대통령이 임명한다.\n② 국무위원은 국정에 관하여 대통령을 보좌하며, 국무회의의 구성원으로서 국정을 심의한다.\n③ 국무총리는 국무위원의 해임을 대통령에게 건의할 수 있다.\n④ 군인은 현역을 면한 후가 아니면 국무위원으로 임명될 수 없다.' }
    ]
  },
  // 6. 중앙선관위원장
  {
    id: 'nec',
    branch: '중앙선거관리위원회',
    title: '선관위원장(대행)',
    name: '위철환',
    image: '/images/heads/nec.png',
    chapterTitle: '대한민국 헌법 제7장 선거관리',
    articles: [
      { num: '제114조', text: '① 선거와 국민투표의 공정한 관리 및 정당에 관한 사무를 처리하기 위하여 선거관리위원회를 둔다.\n② 중앙선거관리위원회는 대통령이 임명하는 3인, 국회에서 선출하는 3인과 대법원장이 지명하는 3인의 위원으로 구성한다. 위원장은 위원중에서 호선한다.\n③ 위원의 임기는 6년으로 한다.\n④ 위원은 정당에 가입하거나 정치에 관여할 수 없다.\n⑤ 위원은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니한다.\n⑥ 중앙선거관리위원회는 법령의 범위안에서 선거관리·국민투표관리 또는 정당사무에 관한 규칙을 제정할 수 있으며, 법률에 저촉되지 아니하는 범위안에서 내부규율에 관한 규칙을 제정할 수 있다.' },
      { num: '제115조', text: '① 각급 선거관리위원회는 선거인명부의 작성등 선거사무와 국민투표사무에 관하여 관계 행정기관에 필요한 지시를 할 수 있다.\n② 제1항의 지시를 받은 당해 행정기관은 이에 응하여야 한다.' },
      { num: '제116조', text: '① 선거운동은 각급 선거관리위원회의 관리하에 법률이 정하는 범위안에서 하되, 균등한 기회가 보장되어야 한다.\n② 선거에 관한 경비는 법률이 정하는 경우를 제외하고는 정당 또는 후보자에게 부담시킬 수 없다.' }
    ]
  }
];

export const Header: React.FC<HeaderProps> = ({
  currentRegion,
  onRegionChange,
  searchQuery,
  onSearchChange,
  onAdminClick,
  onFeedbackClick,
}) => {
  const [activeHead, setActiveHead] = useState<HeadOrgan | null>(null);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md select-none">
      <div className="w-full px-4 sm:px-6 lg:px-10 relative">
        <div className="flex items-center justify-between h-[88px] gap-4">

          {/* ⭐️ 1. [왼쪽 영역] 태극기 + 피코드 + 제22대 국회 + [⭐️ 6대 수장 갤러리 바로 연결!] */}
          <div className="flex items-center gap-3.5 shrink-0 z-10">
            {/* 로고 & 태극기 */}
            <div className="flex items-center gap-3">
              <Taegeukgi className="w-[45px] h-[30px] sm:w-[50px] sm:h-[33px] rounded-[2px]" />

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-neutral-950 leading-none">
                    피코드
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-neutral-100 text-neutral-700 border border-neutral-200 px-1.5 py-0.5 rounded font-bold leading-none">
                    KOREA
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 font-medium mt-1 leading-none hidden sm:block">
                  복잡한 정치를 한눈에
                </div>
              </div>
            </div>

            <div className="h-4 w-[1px] bg-neutral-200 hidden sm:block" />

            {/* 국회 선택창 */}
            <div className="relative flex items-center">
              <select
                value={currentRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="appearance-none h-9 text-xs font-bold bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-lg pl-3 pr-8 text-neutral-900 cursor-pointer focus:outline-none transition-colors"
              >
                <option value="대한민국 국회">제22대 국회</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>

            {/* ⭐️ [국회 버튼 바로 옆 세로선] */}
            <div className="h-6 w-[1px] bg-neutral-200 hidden xl:block ml-1 mr-1" />

            {/* ⭐️ [국회 버튼 우측에 도열하는 대한민국 6대 수장 라인업] */}
            <div className="hidden xl:flex items-center gap-3">
              {CONSTITUTION_HEADS.map((organ) => {
                const isHovered = activeHead?.id === organ.id;

                return (
                  <div
                    key={organ.id}
                    className="relative group cursor-pointer flex flex-col items-center"
                    onMouseEnter={() => setActiveHead(organ)}
                    onMouseLeave={() => setActiveHead(null)}
                  >
                    {/* [1단: 6명 모두 동일한 크기(42px x 42px)의 깔끔한 원형 아바타] */}
                    <div className="w-[42px] h-[42px] overflow-hidden bg-white shadow-xs rounded-full transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-md">
                      <img
                        src={organ.image}
                        alt={organ.name}
                        loading="eager"
                        style={{
                          imageRendering: '-webkit-optimize-contrast',
                          transform: 'translateZ(0)',
                          backfaceVisibility: 'hidden',
                        }}
                        className="w-full h-full object-cover object-top filter contrast-[1.03]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* [2단: 직책 (볼드 블랙, 1줄 단정)] */}
                    <div className="mt-1 text-center">
                      <span className="text-[8.5px] font-bold text-black tracking-tight leading-none block whitespace-nowrap">
                        {organ.title}
                      </span>
                    </div>

                    {/* [3단: 이름 (일반 굵기 블랙, 직책 바로 밑 1px 밀착!)] */}
                    <div className="mt-1 text-center">
                      <span className="text-[9.5px] font-normal text-black tracking-tight leading-none block whitespace-nowrap">
                        {organ.name}
                      </span>
                    </div>

                    {/* 📜 [4단: 모던 블랙&화이트 헌법 전문 팝업 - 스크롤 없이 전체 노출] */}
                    {isHovered && (
                      <div
                        className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[430px] max-w-[90vw] bg-white border-2 border-neutral-900 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] p-5 z-50 animate-fade-in pointer-events-auto text-neutral-900 font-sans"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="bg-neutral-950 text-white text-[9.5px] font-bold font-mono px-2 py-0.5 rounded">
                              헌법 전문
                            </span>
                            <div>
                              <div className="text-[13px] font-black text-neutral-950 tracking-tight">
                                {organ.chapterTitle}
                              </div>
                              <div className="text-[10px] text-neutral-500 font-medium">
                                {organ.branch} · {organ.title} {organ.name}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3.5 text-[11px] leading-relaxed text-neutral-800">
                          {organ.articles.map((art) => (
                            <div key={art.num} className="space-y-0.5">
                              <span className="font-bold text-neutral-950 mr-2 font-mono text-[11px] inline-block">
                                {art.num}
                              </span>
                              <span className="whitespace-pre-line text-neutral-700 font-normal">
                                {art.text}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[9.5px] text-neutral-400 font-mono">
                          <span>대한민국 헌법 (제9차 개정헌법)</span>
                          <span className="font-bold text-neutral-900">PECODE CONSTITUTION ARCHIVE</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. 오른쪽: 검색창 + [오류 제보 버튼] + [관리자 버튼] */}
          <div className="ml-auto flex items-center gap-2 z-10">
            <div className="w-56 lg:w-72 relative hidden md:flex items-center">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="의원 이름, 정당, 지역구 또는 상임위..."
                className="w-full h-9 text-xs bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-black rounded-lg pl-9 pr-12 text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 bg-white pointer-events-none">
                검색
              </span>
            </div>

            {onFeedbackClick && (
              <button
                onClick={onFeedbackClick}
                className="h-9 px-3 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                title="데이터 오류 수정 의견 보내기"
              >
                <span className="text-xs">✍️</span>
                <span>오류 제보</span>
              </button>
            )}

            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="h-9 px-3 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                title="PECODE 채널 관리자 모드"
              >
                <span className="text-xs">🛡️</span>
                <span>관리자</span>
              </button>
            )}
          </div>

        </div>

        {/* 모바일 검색창 */}
        <div className="pb-3 md:hidden">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="의원 이름, 정당, 지역구 검색..."
              className="w-full h-9 text-xs bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-4 text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;