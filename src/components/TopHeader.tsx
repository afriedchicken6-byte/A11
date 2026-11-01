import React from 'react';
import { ShoppingBag, Phone, Facebook } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface TopHeaderProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onGoHome: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onGoHome
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#050506]/80 backdrop-blur-xl border-b border-[#E3B75B]/15 px-3 sm:px-6 py-2.5 transition-all shadow-[0_8px_30px_-12px_rgba(0,0,0,0.9)]">
      <div className="max-w-7xl mx-auto grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
        {/* Brand Lockup (scrolls back to the top of the menu) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-right hover:opacity-90 transition-opacity focus:outline-none group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#E3B75B]/70 bg-[#0A0A0C] p-0.5 shadow-[0_0_18px_rgba(227,183,91,0.35)] shrink-0 flex items-center justify-center group-hover:rotate-[8deg] group-hover:scale-105 transition-transform duration-300">
            <img
              src={RESTAURANT_INFO.logoUrl}
              alt="A1 Fried Chicken Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div className="flex flex-col text-right">
            <span className="font-script text-xl sm:text-2xl gold-text font-bold leading-none">
              A1 Fried Chicken
            </span>
            <span className="text-[10px] sm:text-xs text-[#E5809D] font-medium tracking-tight mt-0.5">
              Best Fried Chicken · أجمد كريسبي
            </span>
          </div>
        </button>

        {/* Facebook page centered in the header */}
        <a
          href={RESTAURANT_INFO.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="صفحتنا على فيسبوك"
          aria-label="صفحتنا على فيسبوك"
          className="justify-self-center p-2 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
        >
          <Facebook className="w-4 h-4" />
        </a>

        {/* Actions: Call & Cart */}
        <div className="justify-self-end flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Call */}
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            title="اتصال مباشر بالمطعم"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-[#E3B75B]/20 text-stone-300 hover:text-amber-400 hover:border-[#E3B75B]/50 text-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono">{RESTAURANT_INFO.phone}</span>
          </a>


          {/* Cart Button (id used by the fly-to-cart animation) */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="btn-burgundy btn-ripple relative flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white hover:brightness-125 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
              <span>السلة</span>
              {cartCount > 0 && (
                <>
                  {/* key re-plays the pop animation every time the count changes */}
                  <span
                    key={cartCount}
                    className="animate-badgePop min-w-5 h-5 px-1 bg-[#F5A623] text-black font-extrabold text-[11px] rounded-full flex items-center justify-center shadow-md"
                  >
                    {cartCount}
                  </span>
                  <span className="text-amber-300 font-mono">{cartTotal} ج</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
