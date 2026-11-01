import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Flame,
  CheckCircle2,
  ChevronUp
} from 'lucide-react';
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  MenuItem,
  CartItem,
  RESTAURANT_INFO
} from './data/menuData';
import { TopHeader } from './components/TopHeader';
import { CategoryRibbons } from './components/CategoryRibbons';
import { MenuItemCard } from './components/MenuItemCard';
import { ProductBottomSheet } from './components/ProductBottomSheet';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import type { SuccessOrderData } from './components/OrderSuccessModal';
import { RestaurantFooter } from './components/RestaurantFooter';
import { LuxuryBackground } from './components/LuxuryBackground';
import { Reveal } from './components/Reveal';
import { SpaceChick } from './components/SpaceChick';
import { db, doc, onSnapshot } from './lib/firebase';
import { flyToCart, initRipple, vibrate } from './lib/interactions';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>('crispy-meals');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [deliveryFee, setDeliveryFee] = useState<number>(RESTAURANT_INFO.defaultDeliveryFee);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Success modal state
  const [successOrderData, setSuccessOrderData] = useState<SuccessOrderData | null>(null);

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('a1_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('a1_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Click ripples on every `.btn-ripple` button
  useEffect(() => initRipple(), []);

  // Clear any pending toast timer on unmount
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Sync delivery fee from Firestore settings
  useEffect(() => {
    try {
      const settingsRef = doc(db, 'settings', 'restaurant');
      const unsubscribe = onSnapshot(
        settingsRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (typeof data.deliveryFee === 'number') {
              setDeliveryFee(data.deliveryFee);
            }
          }
        },
        (error) => {
          // keep the default fee instead of throwing an unhandled listener error
          console.warn('Could not read restaurant settings:', error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not subscribe to settings:', err);
    }
  }, []);

  // Track scroll for active category, progress line & back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Gold progress line at the very top of the page
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }

      // Check which section is in view
      const scrollPos = window.scrollY + 120;
      for (const cat of MENU_CATEGORIES) {
        const el = document.getElementById(`section-${cat.id}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Add to cart handler (sourceRect = where the little chicken leg flies from)
  const handleAddToCart = (newItem: CartItem, sourceRect?: DOMRect) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.cartItemId === newItem.cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        const current = updated[existingIdx];
        const newQty = current.quantity + newItem.quantity;
        updated[existingIdx] = {
          ...current,
          quantity: newQty,
          totalPrice: current.unitPrice * newQty
        };
        return updated;
      }
      return [...prev, newItem];
    });

    flyToCart(sourceRect ?? null);
    vibrate();
    showToast(`تمت إضافة "${newItem.name}" إلى السلة 🍗`);
  };

  // Quick Add for single-price items
  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    if (item.options && item.options.length > 0) {
      setSelectedItemForModal(item);
      setIsBottomSheetOpen(true);
      return;
    }

    if (!item.price) return;

    const cartItemId = `${item.id}_base`;
    const newCartItem: CartItem = {
      cartItemId,
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      unitPrice: item.price,
      quantity: 1,
      totalPrice: item.price
    };

    handleAddToCart(newCartItem, (e.currentTarget as HTMLElement).getBoundingClientRect());
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove single item from cart
  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Filter items by search query
  const filteredItemsByCategory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result: Record<string, MenuItem[]> = {};

    MENU_CATEGORIES.forEach((cat) => {
      const itemsInCat = MENU_ITEMS.filter((item) => {
        if (item.category !== cat.id) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.badges?.some((b) => b.toLowerCase().includes(q))
        );
      });
      result[cat.id] = itemsInCat;
    });

    return result;
  }, [searchQuery]);

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const target = document.getElementById(`section-${catId}`);
    if (target) {
      const topOffset = 110;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - topOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      <SpaceChick />
      {/* Dark luxury backdrop: obsidian + burgundy/gold glows + embers */}
      <LuxuryBackground imageUrl={RESTAURANT_INFO.heroBgUrl} />

      {/* Gold scroll-progress line */}
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />

      {/* Top Header */}
      <TopHeader
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Category Sticky Ribbons Bar */}
      <CategoryRibbons
        activeCategory={activeCategory}
        onSelectCategory={scrollToCategory}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Hero Mini Banner & Search Bar */}
        <Reveal>
          <div className="luxe-panel rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9B1B42]/20 border border-[#E3B75B]/40 text-[#F7E2A6] text-xs font-semibold mb-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>الخلطة السرية الأصلية</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  منيو <span className="gold-text">A1 Best Fried Chicken</span> 🍗
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  أجمد كريسبي وفرايد تشيكن في مصر، اطلب وجبتك واستلمها مقرمشة وساخنة عبر واتساب!
                </p>
              </div>

              {/* Quick Search Input */}
              <div className="w-full sm:w-72 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن وجبة، ساندوتش، صوص..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-black/50 border border-[#E3B75B]/20 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#E3B75B]/70 focus:shadow-[0_0_0_3px_rgba(227,183,91,0.12)] transition-all"
                />
                <Search className="w-4 h-4 text-amber-400/80 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Menu Categories & Items List */}
        <div className="space-y-12">
          {MENU_CATEGORIES.map((cat) => {
            const items = filteredItemsByCategory[cat.id] || [];
            if (items.length === 0 && searchQuery) return null;

            return (
              <section key={cat.id} id={`section-${cat.id}`} className="scroll-mt-28">
                {/* Category Ribbon Header */}
                <Reveal>
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2.5 ribbon-banner px-5 py-2 rounded-xl text-white">
                      <span className="text-xl">{cat.icon}</span>
                      <h2 className="text-base sm:text-lg font-black tracking-wide">
                        {cat.title}
                      </h2>
                    </div>
                    <p className="text-xs text-stone-400 mt-2 mr-1">
                      {cat.subtitle}
                    </p>
                  </div>
                </Reveal>

                {/* Items Grid */}
                {items.length === 0 ? (
                  <div className="p-8 text-center bg-black/40 rounded-2xl border border-stone-800 text-stone-500 text-xs">
                    لا توجد نتائج بحث في هذا القسم
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, idx) => (
                      <Reveal key={item.id} delay={(idx % 3) * 70} className="h-full">
                        <MenuItemCard
                          item={item}
                          onOpenDetails={(it) => {
                            setSelectedItemForModal(it);
                            setIsBottomSheetOpen(true);
                          }}
                          onQuickAdd={handleQuickAdd}
                        />
                      </Reveal>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar for Quick Mobile Access */}
      {totalCartCount > 0 && !isCartOpen && (
        <aside
          aria-label="سلة الطلبات العائمة"
          className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-slideUp"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-burgundy btn-ripple w-full py-3.5 px-5 rounded-2xl text-white flex items-center justify-between active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div
                key={totalCartCount}
                className="animate-badgePop w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-mono font-bold text-sm"
              >
                {totalCartCount}
              </div>
              <span className="text-sm font-bold">عرض سلة الطلبات</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-300 font-extrabold text-base">
                {totalCartPrice} ج
              </span>
              <span className="text-xs bg-black/40 px-2 py-1 rounded-lg">إتمام الطلب 🛵</span>
            </div>
          </button>
        </aside>
      )}

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 left-4 z-30 p-2.5 rounded-full bg-black/70 border border-[#E3B75B]/30 text-amber-300 hover:text-white hover:border-[#E3B75B]/70 shadow-lg active:scale-95 transition-all backdrop-blur"
          title="للأعلى"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          key={toastMessage}
          className="fixed top-20 left-1/2 z-50 px-4 py-2.5 rounded-xl btn-burgundy text-white text-xs font-bold flex items-center gap-2 animate-popIn"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Product Customization Bottom Sheet */}
      <ProductBottomSheet
        item={selectedItemForModal}
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setSelectedItemForModal(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        deliveryFee={deliveryFee}
        onOrderSuccess={(orderData) => {
          setSuccessOrderData(orderData);
        }}
      />

      {/* Order Success Confirmation Modal */}
      <OrderSuccessModal
        orderData={successOrderData}
        onClose={() => setSuccessOrderData(null)}
      />

      {/* Footer */}
      <RestaurantFooter />
    </div>
  );
}
