import React, { useEffect, useRef, useState } from 'react';

type Phase = 'intro' | 'settled';
const KEY = 'a1-space-chick-seen';

function getInitialPhase(): Phase {
  if (typeof window === 'undefined') return 'settled';
  try {
    if (sessionStorage.getItem(KEY)) return 'settled';
    sessionStorage.setItem(KEY, 'yes');
  } catch {}
  return 'intro';
}

const styles = `
.space-chick{position:fixed;z-index:70;pointer-events:none;font-family:inherit}
.space-chick--intro,.space-chick--waiting{inset:0}
.space-chick--waiting .space-chick__actor{opacity:0}
.space-chick__actor{position:absolute;left:calc(50% - 80px);top:calc(50% - 93px);width:160px;height:186px;transform-origin:top left;filter:drop-shadow(0 8px 14px rgba(130,12,49,.28));will-change:transform,opacity}
.space-chick--intro .space-chick__actor{animation:chick-mission 5.55s cubic-bezier(.22,.72,.25,1) both}
@keyframes chick-mission{
0%{opacity:0;transform:translateY(-130vh) rotate(-12deg) scale(.86)}
8%{opacity:1}
17%,29%{transform:translateY(0) rotate(0) scale(1)}
36%{transform:translateY(-9px) rotate(5deg) scale(1.04)}
43%,59%{transform:translateY(0) rotate(0) scale(1)}
67%{transform:translate(-7vw,-5vh) rotate(-5deg) scale(.96)}
76%{transform:translate(-17vw,-13vh) rotate(-8deg) scale(.82)}
86%{transform:translate(-32vw,-27vh) rotate(-5deg) scale(.62)}
100%{opacity:1;transform:translate(calc(-50vw + 88px),calc(-50vh + 168px)) scale(.42)}
}
.space-chick__stars{position:absolute;inset:-18px;color:#f5c75e;pointer-events:none}
.space-chick__star{position:absolute;animation:chick-twinkle 1.1s ease-in-out infinite alternate;text-shadow:0 0 9px rgba(245,199,94,.9)}
.space-chick__star:nth-child(1){left:4px;top:48px;font-size:17px}
.space-chick__star:nth-child(2){right:8px;top:22px;font-size:13px;animation-delay:.25s}
.space-chick__star:nth-child(3){right:0;bottom:42px;font-size:18px;animation-delay:.5s}
@keyframes chick-twinkle{to{opacity:.4;transform:scale(.75) rotate(18deg)}}
.space-chick__rocket{position:absolute;left:67px;bottom:-3px;width:27px;height:48px;border:2px solid #c5c7cc;border-radius:50% 50% 35% 35%;background:linear-gradient(90deg,#5c1029,#a51c49 55%,#450d20);opacity:0;transform:translateY(8px) scale(.7);animation:chick-rocket 1s ease-in-out 3.05s forwards;box-shadow:0 0 12px rgba(245,166,35,.25)}
.space-chick__rocket:before,.space-chick__rocket:after{content:'';position:absolute;bottom:-9px;width:8px;height:16px;background:#9b1b42;border:1px solid #e3b75b}
.space-chick__rocket:before{left:-6px;transform:skewY(-25deg)}
.space-chick__rocket:after{right:-6px;transform:skewY(25deg)}
.space-chick__flame{position:absolute;left:8px;bottom:-28px;width:9px;height:23px;border-radius:50%;background:linear-gradient(#fff3a6,#ff9b24 52%,transparent);animation:chick-flame .13s ease-in-out infinite alternate}
@keyframes chick-rocket{65%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:1;transform:rotate(3deg)}}
@keyframes chick-flame{to{transform:scaleY(1.2)}}
.space-chick__smoke{position:absolute;left:76px;bottom:-34px;width:9px;height:9px;border-radius:50%;background:#ddd;opacity:0;animation:chick-smoke 1.1s ease-out 3.7s infinite}
@keyframes chick-smoke{30%{opacity:.6}100%{opacity:0;transform:translate(-15px,20px) scale(2)}}
.space-chick--settled{left:9px;top:calc(env(safe-area-inset-top,0px) + 74px);width:68px;height:82px}
.space-chick--settled .space-chick__actor{left:0;top:0;width:68px;height:79px;animation:chick-breathe 3.8s ease-in-out infinite;will-change:transform}
@keyframes chick-breathe{50%{transform:translateY(-2px) scale(1.015)}}
.space-chick__button{position:relative;display:block;width:68px;height:82px;padding:0;border:0;background:transparent;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent}
.space-chick__button:focus-visible{outline:2px solid #e3b75b;outline-offset:3px;border-radius:20px}
.space-chick__button--cheer .space-chick__actor{animation:chick-cheer .42s ease-in-out 2}
@keyframes chick-cheer{35%{transform:translateY(-5px) rotate(-5deg) scale(1.06)}70%{transform:translateY(0) rotate(4deg) scale(.98)}}
.space-chick__bubble{position:absolute;left:-2px;bottom:calc(100% + 2px);padding:7px 10px;border:1px solid rgba(227,183,91,.72);border-radius:12px 12px 12px 3px;background:rgba(17,10,13,.96);color:#f7d57e;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 5px 18px rgba(0,0,0,.3),0 0 14px rgba(227,183,91,.15);animation:chick-bubble .18s ease-out both}
@keyframes chick-bubble{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.space-chick__skip{position:fixed;z-index:71;left:50%;top:calc(50% + 112px);transform:translateX(-50%);pointer-events:auto;padding:7px 12px;border:1px solid rgba(227,183,91,.65);border-radius:999px;background:rgba(13,10,12,.86);color:#f5d37d;font-size:12px;font-weight:700;backdrop-filter:blur(8px);cursor:pointer}
.space-chick__skip:hover{background:rgba(107,10,37,.94)}
@media(prefers-reduced-motion:reduce){.space-chick--intro .space-chick__actor{animation-duration:.01ms}.space-chick__star,.space-chick__flame,.space-chick__smoke{animation-duration:.01ms}.space-chick--settled .space-chick__actor{animation:none}}
`;

function ChickArt() {
  return (
    <>
      <div className="space-chick__stars" aria-hidden="true"><span className="space-chick__star">✦</span><span className="space-chick__star">✧</span><span className="space-chick__star">✦</span></div>
      <div className="space-chick__rocket" aria-hidden="true"><span className="space-chick__flame" /></div>
      <span className="space-chick__smoke" aria-hidden="true" />
      <svg viewBox="0 0 180 210" width="100%" height="100%" role="img" aria-label="كتكوت فضائي لطيف">
        <defs>
          <linearGradient id="chick-suit" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#a51c49" /><stop offset="1" stopColor="#3c0b1c" /></linearGradient>
          <linearGradient id="chick-glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#f2fbff" stopOpacity=".55" /><stop offset=".5" stopColor="#b8d7e8" stopOpacity=".12" /><stop offset="1" stopColor="#7da6ba" stopOpacity=".3" /></linearGradient>
          <linearGradient id="chick-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff1a8" /><stop offset="1" stopColor="#e3a936" /></linearGradient>
          <filter id="chick-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M68 166v16l-7 8q-2 5 4 6h22q5-3 1-8l-5-7v-15M111 166v16l-7 8q-2 5 4 6h22q5-3 1-8l-5-7v-15" fill="#34353b" stroke="#d4d5d8" strokeWidth="3" strokeLinejoin="round" />
        <path d="M50 119q-15 3-18 17l-5 14q-1 8 7 10l12 2 14-27M130 119q15 3 18 17l5 14q1 8-7 10l-12 2-14-27" fill="url(#chick-suit)" stroke="#d8d9dd" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="34" cy="157" r="8" fill="url(#chick-gold)" stroke="#e3b75b" strokeWidth="2" /><circle cx="146" cy="157" r="8" fill="url(#chick-gold)" stroke="#e3b75b" strokeWidth="2" />
        <path d="M58 108q-8 7-9 22l-3 35q1 9 10 10h68q9-1 10-10l-3-35q-1-15-9-22-12-9-32-9t-32 9Z" fill="url(#chick-suit)" stroke="#d7d8dc" strokeWidth="4" />
        <path d="M68 111q22 11 44 0l-4 13q-18 10-36 0Z" fill="#e8e9eb" stroke="#aeb1b6" strokeWidth="2" />
        <rect x="75" y="127" width="30" height="28" rx="9" fill="#17181c" stroke="#e3b75b" strokeWidth="2.5" /><circle cx="90" cy="141" r="11" fill="#6b0a25" stroke="#f6d46f" strokeWidth="2" filter="url(#chick-glow)" /><text x="90" y="146" textAnchor="middle" fontSize="14" fontFamily="system-ui,sans-serif">👍</text>
        <path d="M67 43q-5-16 8-15 5-16 16-7 11-9 16 7 13-1 8 15" fill="#f0b936" stroke="#cb8e1b" strokeWidth="3" />
        <ellipse cx="90" cy="72" rx="39" ry="38" fill="url(#chick-gold)" stroke="#cb8e1b" strokeWidth="3" /><ellipse cx="77" cy="70" rx="7" ry="10" fill="#251b1b" /><ellipse cx="103" cy="70" rx="7" ry="10" fill="#251b1b" /><circle cx="79" cy="67" r="2.3" fill="#fff" /><circle cx="105" cy="67" r="2.3" fill="#fff" />
        <path d="M83 84q7 7 14 0l-7-7Z" fill="#f28d2d" stroke="#c96a17" strokeWidth="2" strokeLinejoin="round" /><ellipse cx="69" cy="82" rx="6" ry="3" fill="#ec8c78" opacity=".7" /><ellipse cx="111" cy="82" rx="6" ry="3" fill="#ec8c78" opacity=".7" />
        <circle cx="90" cy="69" r="49" fill="url(#chick-glass)" stroke="#d9e4eb" strokeWidth="4" /><path d="M58 43q13-20 34-20M122 93q-8 13-21 18" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="4" strokeLinecap="round" /><path d="M52 107q38 22 76 0" fill="none" stroke="#c5d1da" strokeWidth="4" />
      </svg>
    </>
  );
}

export const SpaceChick: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const [started, setStarted] = useState(false);
  const [cheering, setCheering] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (phase !== 'intro') return;
    const start = window.setTimeout(() => setStarted(true), 1000);
    const finish = window.setTimeout(() => setPhase('settled'), 6550);
    return () => { window.clearTimeout(start); window.clearTimeout(finish); };
  }, [phase]);

  const cheer = () => {
    setCheering(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCheering(false), 1500);
  };

  const character = <div className="space-chick__actor" aria-hidden="true"><ChickArt /></div>;

  return (
    <>
      <style>{styles}</style>
      <div className={'space-chick space-chick--' + phase + (phase === 'intro' && !started ? ' space-chick--waiting' : '')}>
        {phase === 'settled' ? (
          <button type="button" className={'space-chick__button' + (cheering ? ' space-chick__button--cheer' : '')} aria-label="الكتكوت الفضائي، اطلب دلوقتي" onPointerEnter={cheer} onClick={cheer}>
            {character}{cheering && <span className="space-chick__bubble">اطلب دلوقتي 🍗</span>}
          </button>
        ) : (
          <>
            {character}
            {started && <button type="button" className="space-chick__skip" onClick={() => setPhase('settled')}>تخطي</button>}
          </>
        )}
      </div>
    </>
  );
};
