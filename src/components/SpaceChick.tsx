import React, { useEffect, useRef, useState } from 'react';

type Phase = 'intro' | 'settled';
const INTRO_KEY = 'a1-space-chick-intro-v2';
const INTRO_MS = 9500;

function getInitialPhase(): Phase {
  if (typeof window === 'undefined') return 'settled';
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'settled';
    if (sessionStorage.getItem(INTRO_KEY)) return 'settled';
    sessionStorage.setItem(INTRO_KEY, 'yes');
  } catch {}
  return 'intro';
}

const styles = [
  '.space-chick{position:fixed;z-index:70;pointer-events:none;font-family:inherit}',
  '.space-chick--intro,.space-chick--waiting{inset:0}',
  '.space-chick--waiting .space-chick__chick,.space-chick--waiting .space-chick__rocket,.space-chick--waiting .space-chick__ladder{opacity:0}',
  '.space-chick__chick{position:absolute;left:50%;top:50%;width:156px;height:190px;transform-origin:center;filter:drop-shadow(0 8px 13px rgba(94,8,35,.27));will-change:transform,opacity}',
  '.space-chick--intro .space-chick__chick{animation:chick-story 9.5s cubic-bezier(.22,.72,.25,1) both}',
  '@keyframes chick-story{0%{opacity:0;transform:translate(-50%,-50%) translateY(-125vh) rotate(-16deg) scale(.82)}6%{opacity:1}12%{transform:translate(-50%,-50%) translateY(5px) scale(1.08,.91)}16%{transform:translate(-50%,-50%) translateY(-12px) scale(.96,1.06)}20%,28%{transform:translate(-50%,-50%) translateY(0) scale(1)}34%{transform:translate(-50%,-50%) translateY(-9px) rotate(-5deg) scale(1.05)}39%,43%{transform:translate(-50%,-50%) translateY(0) rotate(4deg)}47%{transform:translate(-50%,-50%) translate(-115vw,10px) rotate(-10deg) scale(.88)}51%{opacity:0}56%{opacity:1;transform:translate(-50%,-50%) translate(-42px,5px) rotate(0) scale(.9)}61%{transform:translate(-50%,-50%) translate(-5px,-4px) rotate(0) scale(1)}66%{transform:translate(-50%,-50%) translate(-8px,-28px) rotate(-5deg)}71%{transform:translate(-50%,-50%) translate(0,-54px) rotate(2deg)}76%{opacity:1;transform:translate(-50%,-50%) translate(17px,-62px) rotate(7deg) scale(.88)}80%{opacity:0;transform:translate(-50%,-50%) translate(28px,-57px) scale(.72)}100%{opacity:0;transform:translate(-50%,-50%) scale(.6)}}',
  '.space-chick__chick-svg{width:100%;height:100%;overflow:visible}',
  '.space-chick__tuft{transform-box:fill-box;transform-origin:bottom center;animation:tuft-sway 1.4s ease-in-out infinite alternate}',
  '@keyframes tuft-sway{to{transform:rotate(9deg)}}',
  '.space-chick__wing{transform-box:fill-box;transform-origin:top center}',
  '.space-chick--intro .space-chick__wing--left{animation:wing-balance 1.2s ease-in-out 1.2s 2}',
  '.space-chick--intro .space-chick__wing--right{animation:wing-like 9.5s ease-in-out both}',
  '@keyframes wing-balance{0%,100%{transform:rotate(0)}35%{transform:rotate(-32deg)}65%{transform:rotate(24deg)}}',
  '@keyframes wing-like{0%,30%,100%{transform:rotate(0)}34%{transform:rotate(-22deg)}37%{transform:rotate(-55deg)}42%{transform:rotate(-18deg)}57%{transform:rotate(-10deg)}62%{transform:rotate(-35deg)}66%,70%{transform:rotate(-54deg)}74%{transform:rotate(-12deg)}}',
  '.space-chick__thumb{opacity:0;transform-box:fill-box;transform-origin:center}',
  '.space-chick--intro .space-chick__thumb{animation:thumb-mission 9.5s ease-in-out both}',
  '@keyframes thumb-mission{0%,30%,47%,62%,75%,100%{opacity:0}34%,43%,66%,71%{opacity:1;transform:translateY(-3px) rotate(-12deg) scale(1.12)}}',
  '.space-chick__eye-lid{opacity:0;transform-box:fill-box;transform-origin:center}',
  '.space-chick--intro .space-chick__eye-lid--right{animation:eye-wink 9.5s ease-in-out both}',
  '@keyframes eye-wink{0%,20%,29%,100%{opacity:0;transform:scaleY(0)}23%,27%{opacity:1;transform:scaleY(1)}}',
  '.space-chick__button-core{transform-box:fill-box;transform-origin:center}',
  '.space-chick--intro .space-chick__button-core{animation:button-flash 9.5s ease-in-out both}',
  '@keyframes button-flash{0%,27%,100%{filter:drop-shadow(0 0 2px #e8b74e)}32%,38%{filter:drop-shadow(0 0 11px #ffe07a)}40%{filter:drop-shadow(0 0 3px #e8b74e)}70%,74%{filter:drop-shadow(0 0 12px #ffe07a)}}',
  '.space-chick__rocket{position:absolute;left:calc(50% - 37px);top:calc(50% - 64px);width:74px;height:128px;opacity:0;transform-origin:center;filter:drop-shadow(0 8px 10px rgba(40,20,25,.25));will-change:transform,opacity}',
  '.space-chick--intro .space-chick__rocket{animation:rocket-story 9.5s ease-in-out both}',
  '@keyframes rocket-story{0%,24%{opacity:0;transform:translateY(-125vh) rotate(-18deg) scale(.7)}28%{opacity:1;transform:translateY(9px) rotate(5deg) scale(1.04)}32%,72%{opacity:1;transform:translateY(0) rotate(0) scale(1)}75%{transform:translateY(-3px) rotate(-2deg) scale(1.04)}78%{transform:translateY(0) rotate(2deg) scale(1)}82%{opacity:1;transform:translate(12vw,-12vh) rotate(175deg) scale(.92)}87%{transform:translate(-5vw,-22vh) rotate(360deg) scale(.78)}93%{transform:translate(calc(-28vw + 12px),calc(-35vh + 22px)) rotate(530deg) scale(.62)}100%{opacity:1;transform:translate(calc(-50vw + 44px),calc(-50vh + 145px)) rotate(720deg) scale(.43)}}',
  '.space-chick__rocket-art{width:100%;height:100%;overflow:visible}',
  '.space-chick__flame{opacity:0;transform-box:fill-box;transform-origin:top center}',
  '.space-chick--intro .space-chick__flame{animation:rocket-flame 9.5s ease-in-out both}',
  '@keyframes rocket-flame{0%,72%{opacity:0;transform:scaleY(.3)}75%,80%{opacity:1;transform:scaleY(1.3)}82%{opacity:1;transform:scaleY(1)}100%{opacity:0;transform:scaleY(.2)}}',
  '.space-chick__rocket-window-face{opacity:0}',
  '.space-chick--intro .space-chick__rocket-window-face{animation:window-face 9.5s linear both}',
  '@keyframes window-face{0%,75%{opacity:0}78%,100%{opacity:1}}',
  '.space-chick__smoke{position:absolute;left:calc(50% + 20px);top:calc(50% + 20px);width:44px;height:44px;opacity:0;border-radius:50%;background:radial-gradient(circle,#fff 0 12%,#d5d8dc 14% 30%,transparent 70%);filter:blur(1px);will-change:transform,opacity}',
  '.space-chick--intro .space-chick__smoke{animation:smoke-puff 9.5s ease-out both}',
  '@keyframes smoke-puff{0%,26%{opacity:0;transform:scale(.2)}30%{opacity:.85;transform:scale(1.2)}38%{opacity:0;transform:translate(-28px,12px) scale(2.5)}74%{opacity:0}80%{opacity:.7;transform:scale(.5)}100%{opacity:0;transform:translate(-40px,40px) scale(2)}}',
  '.space-chick__ladder{position:absolute;left:calc(50% + 5px);top:calc(50% + 15px);width:52px;height:94px;opacity:0;transform-origin:bottom center;will-change:transform,opacity}',
  '.space-chick--intro .space-chick__ladder{animation:ladder-story 9.5s ease-in-out both}',
  '@keyframes ladder-story{0%,49%{opacity:0;transform:translate(-120vw,8px) rotate(-10deg)}54%{opacity:1;transform:translate(-52px,7px) rotate(-6deg)}59%{transform:translate(0,0) rotate(8deg)}62%,73%{opacity:1;transform:translate(0,0) rotate(11deg)}77%,100%{opacity:0;transform:translate(15px,-60px) rotate(20deg)}}',
  '.space-chick__countdown{position:absolute;left:50%;top:calc(50% - 150px);color:#f8d879;font-weight:900;font-size:26px;text-shadow:0 0 12px #d98931;opacity:0}',
  '.space-chick--intro .space-chick__countdown{animation:countdown 9.5s steps(1,end) both}',
  '@keyframes countdown{0%,73%{opacity:0}74%,75%{opacity:1}76%,77%{opacity:0}78%,79%{opacity:1}80%,81%{opacity:0}82%,83%{opacity:1}84%,100%{opacity:0}}',
  '.space-chick__sparkles{position:absolute;inset:-22px;color:#f5cf66;pointer-events:none}',
  '.space-chick__sparkle{position:absolute;animation:twinkle 1s ease-in-out infinite alternate;text-shadow:0 0 10px rgba(245,199,94,.8)}',
  '.space-chick__sparkle:nth-child(1){left:3px;top:42px;font-size:20px}.space-chick__sparkle:nth-child(2){right:7px;top:27px;font-size:14px;animation-delay:.3s}.space-chick__sparkle:nth-child(3){right:0;bottom:34px;font-size:18px;animation-delay:.6s}',
  '@keyframes twinkle{to{opacity:.35;transform:scale(.75) rotate(22deg)}}',
  '.space-chick__skip{position:fixed;z-index:72;left:50%;top:calc(50% + 145px);transform:translateX(-50%);pointer-events:auto;padding:7px 12px;border:1px solid rgba(227,183,91,.72);border-radius:999px;background:rgba(13,10,12,.88);color:#f5d37d;font-size:12px;font-weight:700;backdrop-filter:blur(8px);cursor:pointer}',
  '.space-chick__skip:hover{background:rgba(107,10,37,.96)}',
  '.space-chick--settled{left:10px;top:calc(env(safe-area-inset-top,0px) + 78px);width:70px;height:82px}',
  '.space-chick__button{position:relative;display:block;width:70px;height:82px;padding:0;border:0;background:transparent;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent}',
  '.space-chick__button:focus-visible{outline:2px solid #e3b75b;outline-offset:3px;border-radius:22px}',
  '.space-chick--settled .space-chick__chick{position:absolute;inset:0;width:70px;height:82px;filter:drop-shadow(0 3px 5px rgba(94,8,35,.2))}',
  '.space-chick--settled .space-chick__chick-svg{animation:soft-breathe 3.8s ease-in-out infinite}',
  '@keyframes soft-breathe{50%{transform:translateY(-1px) scale(1.015)}}',
  '.space-chick__button:hover .space-chick__head{transform-box:fill-box;transform-origin:center;transform:rotate(4deg)}',
  '.space-chick__pupils{transform:translate(var(--look-x,0px),var(--look-y,0px))}',
  '.space-chick__eye-lid--settled{opacity:0;transform-box:fill-box;transform-origin:center;animation:settled-blink 4.2s ease-in-out infinite}',
  '@keyframes settled-blink{0%,91%,96%,100%{opacity:0;transform:scaleY(0)}93%,94%{opacity:1;transform:scaleY(1)}}',
  '.space-chick--cheer .space-chick__chick-svg{animation:cheer-bounce .42s ease-in-out 2}',
  '.space-chick--cheer .space-chick__wing--right{animation:cheer-wing .42s ease-in-out 2}',
  '.space-chick--cheer .space-chick__button-core{filter:drop-shadow(0 0 12px #ffe07a)}',
  '@keyframes cheer-bounce{35%{transform:translateY(-4px) rotate(-4deg) scale(1.06)}70%{transform:translateY(0) rotate(3deg) scale(.98)}}',
  '@keyframes cheer-wing{50%{transform:rotate(-48deg)}}',
  '.space-chick--cheer .space-chick__thumb{opacity:1;animation:thumb-pop .48s ease-out both}',
  '@keyframes thumb-pop{50%{transform:translateY(-3px) rotate(-12deg) scale(1.14)}}',
  '.space-chick--cheer .space-chick__eye-lid--right{animation:cheer-wink .42s ease-in-out both}',
  '@keyframes cheer-wink{0%,100%{opacity:0;transform:scaleY(0)}25%,75%{opacity:1;transform:scaleY(1)}}',
  '.space-chick__bubble{position:absolute;left:-1px;bottom:calc(100% + 2px);padding:7px 10px;border:1px solid rgba(227,183,91,.75);border-radius:12px 12px 12px 3px;background:rgba(17,10,13,.96);color:#f7d57e;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 5px 18px rgba(0,0,0,.3),0 0 14px rgba(227,183,91,.15);animation:bubble-in .18s ease-out both}',
  '@keyframes bubble-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}',
  '@media(prefers-reduced-motion:reduce){.space-chick__sparkle,.space-chick__tuft,.space-chick__eye-lid--settled,.space-chick__chick-svg{animation:none!important}.space-chick--intro .space-chick__chick,.space-chick--intro .space-chick__rocket,.space-chick--intro .space-chick__ladder{animation:none!important;opacity:0!important}.space-chick__skip{display:none}}'
].join('\n');

function ChickArt({ mini = false }: { mini?: boolean }) {
  if (mini) {
    return <g className="space-chick__rocket-window-face">
      <circle cx="38" cy="64" r="15" fill="#f2c34d" stroke="#a46714" strokeWidth="2" />
      <path d="M29 54q-2-8 5-7 4-8 8-2 7-4 8 4 7 2 2 8" fill="#eab436" />
      <ellipse cx="33" cy="63" rx="2" ry="3" fill="#241b19" /><ellipse cx="43" cy="63" rx="2" ry="3" fill="#241b19" />
      <path d="M35 69l4-4 4 4q-4 5-8 0Z" fill="#ed8126" />
    </g>;
  }

  return <>
    <div className="space-chick__sparkles" aria-hidden="true"><span className="space-chick__sparkle">✦</span><span className="space-chick__sparkle">✧</span><span className="space-chick__sparkle">✦</span></div>
    <svg className="space-chick__chick-svg" viewBox="0 0 180 210" role="img" aria-label="الكتكوت الفضائي">
      <defs>
        <linearGradient id="sc-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff2aa" /><stop offset=".55" stopColor="#f4c548" /><stop offset="1" stopColor="#df9c24" /></linearGradient>
        <linearGradient id="sc-feather" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ffe98c" /><stop offset="1" stopColor="#e7a52d" /></linearGradient>
        <linearGradient id="sc-suit" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#8d1739" /><stop offset="1" stopColor="#280d17" /></linearGradient>
        <linearGradient id="sc-glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".56" /><stop offset=".5" stopColor="#bce5f7" stopOpacity=".12" /><stop offset="1" stopColor="#83b2c8" stopOpacity=".29" /></linearGradient>
        <filter id="sc-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <g className="space-chick__legs" fill="#ed8427" stroke="#bd5b19" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M66 169v14l-8 8q-2 5 4 6h22q5-3 1-7l-6-7v-14M111 169v14l-8 8q-2 5 4 6h22q5-3 1-7l-6-7v-14" />
        <path d="M60 195h7m5 0h7m28 0h7m5 0h7" fill="none" />
      </g>
      <path d="M53 120q-16 0-20 16l-7 18q-2 9 8 12l15 2 16-31M127 120q16 0 20 16l7 18q2 9-8 12l-15 2-16-31" fill="url(#sc-suit)" stroke="#c9cbd0" strokeWidth="4" strokeLinejoin="round" />
      <g className="space-chick__wing space-chick__wing--left">
        <path d="M49 124q-17 2-22 17l-7 15q-2 8 6 11l14 3 17-29Z" fill="url(#sc-feather)" stroke="#cb8e25" strokeWidth="2" />
        <path d="M29 149l-8 11 13-2m4-13-8 14 15-3" fill="#f3bb42" stroke="#da9630" strokeWidth="2" strokeLinejoin="round" />
      </g>
      <g className="space-chick__wing space-chick__wing--right">
        <path d="M131 124q17 2 22 17l7 15q2 8-6 11l-14 3-17-29Z" fill="url(#sc-feather)" stroke="#cb8e25" strokeWidth="2" />
        <path d="M151 149l8 11-13-2m-4-13 8 14-15-3" fill="#f3bb42" stroke="#da9630" strokeWidth="2" strokeLinejoin="round" />
        <text className="space-chick__thumb" x="160" y="137" fontSize="17">👍</text>
      </g>
      <path d="M53 119q5-12 19-14h36q14 2 19 14l8 44q1 10-10 11H55q-11-1-10-11Z" fill="url(#sc-suit)" stroke="#d8d9dd" strokeWidth="4" />
      <path d="M64 110q26 13 52 0l-4 13q-22 11-44 0Z" fill="#f2eee6" stroke="#afb2b8" strokeWidth="2" />
      <g className="space-chick__button-core">
        <rect x="73" y="127" width="34" height="31" rx="10" fill="#17181d" stroke="#e3b75b" strokeWidth="2.5" />
        <circle cx="90" cy="142" r="12" fill="#6b0a25" stroke="#f6d46f" strokeWidth="2" filter="url(#sc-glow)" />
        <text x="90" y="147" textAnchor="middle" fontSize="14" fontFamily="system-ui,sans-serif">👍</text>
      </g>
      <g className="space-chick__head">
        <g className="space-chick__tuft">
          <path d="M68 48q-11-19 4-24 6-18 19-7 15-14 20 5 16-1 10 23l-10 9-36-1Z" fill="#f1be3d" stroke="#ca8e1d" strokeWidth="3" strokeLinejoin="round" />
          <path d="M87 28q-7-14 3-20 9 7 6 19m9 1q4-13 12-13 3 10-6 19" fill="#ffe887" stroke="#d79a28" strokeWidth="2" />
        </g>
        <g fill="url(#sc-feather)" stroke="#cc9227" strokeWidth="1.6">
          <ellipse cx="57" cy="82" rx="11" ry="15" transform="rotate(-32 57 82)" /><ellipse cx="64" cy="93" rx="10" ry="12" transform="rotate(-20 64 93)" />
          <ellipse cx="123" cy="82" rx="11" ry="15" transform="rotate(32 123 82)" /><ellipse cx="116" cy="93" rx="10" ry="12" transform="rotate(20 116 93)" />
          <ellipse cx="76" cy="103" rx="10" ry="12" transform="rotate(-18 76 103)" /><ellipse cx="90" cy="106" rx="10" ry="12" /><ellipse cx="104" cy="103" rx="10" ry="12" transform="rotate(18 104 103)" />
        </g>
        <ellipse cx="90" cy="72" rx="39" ry="39" fill="url(#sc-gold)" stroke="#c98c1f" strokeWidth="3" />
        <g className="space-chick__pupils">
          <ellipse cx="77" cy="70" rx="8" ry="11" fill="#241b19" /><ellipse cx="103" cy="70" rx="8" ry="11" fill="#241b19" />
          <circle cx="79" cy="66" r="3" fill="#fff" /><circle cx="105" cy="66" r="3" fill="#fff" /><circle cx="74" cy="73" r="1.5" fill="#fff" /><circle cx="100" cy="73" r="1.5" fill="#fff" />
        </g>
        <g className="space-chick__eye-lid space-chick__eye-lid--right"><path d="M94 70q9-10 18 0v5q-9 6-18 0Z" fill="#dca22c" stroke="#875719" strokeWidth="2" /></g>
        <g className="space-chick__eye-lid--settled"><path d="M68 70q9-10 18 0v5q-9 6-18 0Z" fill="#dca22c" /><path d="M94 70q9-10 18 0v5q-9 6-18 0Z" fill="#dca22c" /></g>
        <path d="M83 85q7 8 14 0l-7-7Z" fill="#f28a2c" stroke="#c76c1a" strokeWidth="2" strokeLinejoin="round" />
        <path d="M78 92q12 8 24 0" fill="none" stroke="#8b4e18" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="68" cy="84" rx="6" ry="3" fill="#ec8c78" opacity=".72" /><ellipse cx="112" cy="84" rx="6" ry="3" fill="#ec8c78" opacity=".72" />
      </g>
      <circle cx="90" cy="72" r="49" fill="url(#sc-glass)" stroke="#d9e4eb" strokeWidth="4" />
      <path d="M56 44q13-21 37-22M126 91q-8 17-23 22" fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="4" strokeLinecap="round" />
      <path d="M51 108q39 23 78 0" fill="none" stroke="#c5d1da" strokeWidth="4" />
    </svg>
  </>;
}

function RocketArt() {
  return <svg className="space-chick__rocket-art" viewBox="0 0 76 132" aria-hidden="true">
    <defs><linearGradient id="sc-rocket" x1="0" x2="1"><stop offset="0" stopColor="#34353b" /><stop offset=".48" stopColor="#9b1942" /><stop offset="1" stopColor="#420d21" /></linearGradient><linearGradient id="sc-fire" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff7aa" /><stop offset=".45" stopColor="#ff9d2e" /><stop offset="1" stopColor="#e54618" stopOpacity="0" /></linearGradient></defs>
    <path d="M38 5C21 17 15 38 16 70h44C61 38 55 17 38 5Z" fill="url(#sc-rocket)" stroke="#d8d9dd" strokeWidth="3" />
    <path d="M23 51q-12 8-15 26l15-6m30-20q12 8 15 26l-15-6" fill="#6b0a25" stroke="#d8d9dd" strokeWidth="2.5" />
    <circle cx="38" cy="63" r="16" fill="#14171c" stroke="#e7bd5d" strokeWidth="3" /><circle cx="38" cy="63" r="11" fill="#a9dff0" fillOpacity=".65" stroke="#fff" strokeOpacity=".8" />
    <g className="space-chick__rocket-window-face"><circle cx="38" cy="64" r="10" fill="#f2c34d" /><circle cx="34" cy="62" r="1.5" fill="#211" /><circle cx="42" cy="62" r="1.5" fill="#211" /><path d="M35 67l3-3 3 3q-3 3-6 0" fill="#ed8126" /></g>
    <path d="M22 83h32l7 25H15Z" fill="#34353b" stroke="#d8d9dd" strokeWidth="3" />
    <rect x="27" y="86" width="22" height="11" rx="5" fill="#17181d" stroke="#e3b75b" strokeWidth="2" /><text x="38" y="94" textAnchor="middle" fontSize="8">👍</text>
    <path d="M25 106h26l-3 13H28Z" fill="#6b0a25" stroke="#d8d9dd" strokeWidth="2" />
    <path className="space-chick__flame" d="M29 115q9 22 18 0l-4 16h-10Z" fill="url(#sc-fire)" />
  </svg>;
}

function LadderArt() {
  return <svg width="100%" height="100%" viewBox="0 0 52 94" aria-hidden="true">
    <path d="M10 4 3 91M39 4l8 91" fill="none" stroke="#b9bec4" strokeWidth="5" strokeLinecap="round" />
    <path d="M7 18h34M6 34h36M5 50h39M4 66h41M3 82h43" fill="none" stroke="#8d1739" strokeWidth="5" strokeLinecap="round" />
    <path d="M10 4 3 91M39 4l8 91" fill="none" stroke="#edf0f2" strokeOpacity=".65" strokeWidth="1.4" />
  </svg>;
}

export const SpaceChick: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const [started, setStarted] = useState(false);
  const [cheering, setCheering] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (phase !== 'intro') return;
    const start = window.setTimeout(() => setStarted(true), 1000);
    const finish = window.setTimeout(() => setPhase('settled'), 1000 + INTRO_MS);
    return () => { window.clearTimeout(start); window.clearTimeout(finish); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'settled') return;
    let timer: number | undefined;
    let active = true;
    const winkLater = () => {
      timer = window.setTimeout(() => {
        if (!active) return;
        setCheering(true);
        window.setTimeout(() => setCheering(false), 300);
        winkLater();
      }, 8000 + Math.random() * 2000);
    };
    winkLater();
    return () => { active = false; window.clearTimeout(timer); };
  }, [phase]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const settle = () => setPhase('settled');
  const cheer = () => {
    setCheering(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCheering(false), 1300);
  };
  const trackPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setLook({ x: Math.max(-1.5, Math.min(1.5, (event.clientX - bounds.left - bounds.width / 2) / 10)), y: Math.max(-1.5, Math.min(1.5, (event.clientY - bounds.top - bounds.height / 2) / 10)) });
  };
  const character = <div className="space-chick__chick" aria-hidden="true"><ChickArt /></div>;

  return <>
    <style>{styles}</style>
    {phase === 'intro' ? <div className={'space-chick space-chick--intro' + (!started ? ' space-chick--waiting' : '')} aria-hidden="true">
      {character}
      <div className="space-chick__rocket"><RocketArt /></div>
      <div className="space-chick__ladder"><LadderArt /></div>
      <span className="space-chick__smoke" />
      <span className="space-chick__countdown">3　2　1</span>
      {started && <button type="button" className="space-chick__skip" aria-label="تخطي حركة الكتكوت" onClick={settle}>تخطي</button>}
    </div> : <div className="space-chick space-chick--settled">
      <button type="button" className={'space-chick__button' + (cheering ? ' space-chick--cheer' : '')} aria-label="الكتكوت الفضائي، اطلب دلوقتي" onClick={cheer} onPointerMove={trackPointer} onPointerLeave={() => setLook({ x: 0, y: 0 })} style={{ '--look-x': look.x + 'px', '--look-y': look.y + 'px' } as React.CSSProperties}>
        {character}
        {cheering && <span className="space-chick__bubble">اطلب دلوقتي 🍗</span>}
      </button>
    </div>}
  </>;
};
