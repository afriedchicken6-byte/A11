import React, { useRef, useEffect } from 'react';
import { MENU_CATEGORIES } from '../data/menuData';

interface CategoryRibbonsProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryRibbons: React.FC<CategoryRibbonsProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll active button into view within category nav bar
  useEffect(() => {
    if (!containerRef.current) return;
    const activeButton = containerRef.current.querySelector<HTMLButtonElement>(`[data-cat-id="${activeCategory}"]`);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-[57px] z-20 w-full bg-[#050506]/80 backdrop-blur-xl border-b border-[#E3B75B]/10 py-2.5 shadow-sm">
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {MENU_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`btn-ripple shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 ${
                isActive
                  ? 'btn-burgundy text-white scale-105'
                  : 'bg-white/[0.03] text-stone-300 hover:text-white hover:bg-white/[0.07] border border-[#E3B75B]/15 hover:border-[#E3B75B]/40'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
