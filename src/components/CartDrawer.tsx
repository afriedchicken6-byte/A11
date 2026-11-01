import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Bike,
  Store,
  AlertCircle
} from 'lucide-react';
import { CartItem } from '../data/menuData';
import { submitOrderWithDailyCounter, buildWhatsAppMessage, getWhatsAppUrl } from '../services/orderService';
import { ChickenSendButton, SendStatus } from './ChickenSendButton';
import type { SuccessOrderData } from './OrderSuccessModal';
import { vibrate } from '../lib/interactions';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  deliveryFee: number;
  onOrderSuccess: (orderData: SuccessOrderData) => void;
}

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Accepts an Egyptian mobile number (01012345678, +201012345678, 201012345678,
 * Arabic-Indic digits, spaces/dashes) and returns it as 01XXXXXXXXX, or null.
 */
function normalizeEgyptianMobile(raw: string): string | null {
  const latin = raw
    .replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC_DIGITS.indexOf(d)))
    .replace(/[\s\-()]/g, '');
  const match = latin.match(/^(?:\+?20|0)(1[0125]\d{8})$/);
  return match ? `0${match[1]}` : null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryFee,
  onOrderSuccess
}) => {
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const currentDeliveryFee = orderType === 'delivery' ? deliveryFee : 0;
  const totalAmount = subtotal + currentDeliveryFee;

  const handleSubmitOrder = async () => {
    setValidationError(null);

    if (cartItems.length === 0) {
      setValidationError('السلة فارغة، يرجى اختيار وجباتك أولاً.');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setValidationError('يرجى كتابة اسم العميل بشكل صحيح.');
      return;
    }

    const cleanPhone = normalizeEgyptianMobile(customerPhone);
    if (!cleanPhone) {
      setValidationError('يرجى كتابة رقم موبايل مصري صحيح للتواصل (مثال: 01012345678).');
      return;
    }

    if (orderType === 'delivery' && (!deliveryAddress.trim() || deliveryAddress.trim().length < 5)) {
      setValidationError('يرجى إدخال عنوان التوصيل بالتفصيل.');
      return;
    }

    if (orderType === 'takeaway' && !pickupTime) {
      setValidationError('يرجى تحديد وقت استلام الطلب من المطعم.');
      return;
    }

    setSendStatus('loading');
    vibrate(20);

    // Open the tab right now, while we are still inside the click. Mobile
    // browsers block window.open() after an await, which used to stop WhatsApp
    // from opening. We point this tab at WhatsApp once the order is saved.
    let popup: Window | null = null;
    try {
      popup = window.open('', '_blank');
    } catch {
      popup = null;
    }

    try {
      const items = cartItems.map((ci) => ({
        name: ci.name,
        optionName: ci.selectedOptionName,
        unitPrice: ci.unitPrice,
        quantity: ci.quantity,
        totalPrice: ci.totalPrice,
        notes: ci.notes,
        includedSauces: ci.includedSauces
      }));

      // 1. Submit to atomic Firestore daily counter
      const result = await submitOrderWithDailyCounter({
        orderType,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : '',
        pickupTime: orderType === 'takeaway' ? pickupTime : '',
        landmark: orderType === 'delivery' ? landmark.trim() : '',
        orderNotes: orderNotes.trim(),
        items,
        deliveryFee: currentDeliveryFee,
        subtotal,
        totalAmount
      });

      // 2. Build structured WhatsApp message (no order number if it was not saved)
      const whatsappMessage = buildWhatsAppMessage({
        orderNumber: result.synced ? result.orderNumber : undefined,
        orderType,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : '',
        pickupTime: orderType === 'takeaway' ? pickupTime : '',
        landmark: orderType === 'delivery' ? landmark.trim() : '',
        orderNotes: orderNotes.trim(),
        items,
        deliveryFee: currentDeliveryFee,
        totalAmount
      });

      const whatsappUrl = getWhatsAppUrl(whatsappMessage);

      // 3. Open WhatsApp (in the tab opened above, or a new one as a fallback)
      if (popup && !popup.closed) {
        try {
          popup.opener = null;
        } catch {
          // ignore
        }
        popup.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, '_blank');
      }

      // 4. Let the chicken flutter away, then clear the cart and show the result
      setSendStatus('sent');
      await new Promise((resolve) => window.setTimeout(resolve, 900));

      onClearCart();
      onClose();
      setSendStatus('idle');

      onOrderSuccess({
        orderNumber: result.synced ? result.orderNumber : undefined,
        synced: result.synced,
        customerName: customerName.trim(),
        totalAmount,
        orderType,
        whatsappUrl
      });
    } catch (err) {
      console.error('Error submitting order:', err);
      if (popup && !popup.closed) popup.close();
      setSendStatus('idle');
      setValidationError('حدث خطأ أثناء تسجيل الأوردر، يرجى المحاولة مرة أخرى.');
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#E3B75B]/15 text-stone-100 placeholder:text-stone-600 text-base sm:text-sm focus:outline-none focus:border-[#E3B75B]/60 focus:shadow-[0_0_0_3px_rgba(227,183,91,0.1)] transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={sendStatus === 'idle' ? onClose : undefined} />

      {/* Cart Drawer Panel */}
      <div role="dialog" aria-modal="true" aria-labelledby="cart-dialog-title" className="relative z-10 w-full sm:max-w-lg h-[92dvh] sm:h-auto sm:max-h-[90dvh] luxe-panel rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden text-right animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3B75B]/15 bg-black/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 id="cart-dialog-title" className="text-lg font-bold text-white">سلة الطلبات</h2>
            <span className="text-xs font-mono text-stone-400">({cartItems.length} صنف)</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/50 border border-[#E3B75B]/20 text-stone-400 hover:text-white hover:border-[#E3B75B]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5 no-scrollbar">
          {/* Order Type Toggle (تيك أواي / دليفري) */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-2">
              طريقة استلام الطلب:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/50 rounded-2xl border border-[#E3B75B]/15">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`btn-ripple py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all ${
                  orderType === 'delivery'
                    ? 'btn-burgundy text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Bike className="w-4 h-4 text-amber-300" />
                <span>دليفري (توصيل)</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`btn-ripple py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all ${
                  orderType === 'takeaway'
                    ? 'btn-burgundy text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Store className="w-4 h-4 text-amber-300" />
                <span>استلام من المطعم</span>
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-stone-400 flex flex-col items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-stone-600 mb-3 stroke-1" />
              <p className="text-sm font-medium">سلتك لا تحتوي على أي أصناف بعد</p>
              <p className="text-xs text-stone-500 mt-1">تصفح المنيو واختر وجبتك المقرمشة المفضلة!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>الأصناف المختارة</span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-stone-500 hover:text-red-400 transition-colors"
                >
                  إفراغ السلة
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-black/40 border border-[#E3B75B]/12 rounded-xl p-3 flex items-start justify-between gap-3 animate-slideUp"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                      <span>{item.name}</span>
                      {item.selectedOptionName && (
                        <span className="text-[11px] text-pink-300 bg-[#6B0A25] px-1.5 py-0.5 rounded">
                          {item.selectedOptionName}
                        </span>
                      )}
                    </div>

                    {item.includedSauces && item.includedSauces.length > 0 && (
                      <div className="text-[11px] text-amber-400/90 mt-0.5">
                        الصوصات: {item.includedSauces.join(' · ')}
                      </div>
                    )}

                    {item.notes && (
                      <div className="text-[11px] text-stone-400 mt-0.5 italic">
                        ملاحظة: {item.notes}
                      </div>
                    )}

                    <div className="font-mono text-amber-400 font-extrabold text-xs mt-1.5">
                      {item.totalPrice} ج ({item.unitPrice} ج × {item.quantity})
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.cartItemId)}
                      aria-label="حذف الصنف" className="min-w-10 min-h-10 flex items-center justify-center text-stone-500 hover:text-red-400 p-2 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 bg-stone-800/80 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                        className="btn-ripple w-10 h-10 rounded bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        className="btn-ripple w-6 h-6 rounded bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Details Form */}
          {cartItems.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#E3B75B]/15">
              <h3 className="text-xs font-bold text-stone-300">بيانات العميل والتوصيل</h3>

              <div>
                <label className="block text-xs text-stone-400 mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: أحمد مصطفى"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">رقم الموبايل *</label>
                <input
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01012345678"
                  className={`${inputClass} text-right`}
                />
              </div>

              {orderType === 'delivery' ? (
                <>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">عنوان التوصيل بالتفصيل *</label>
                    <textarea
                      rows={2}
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="اسم الشارع، رقم العمارة، رقم الدور والشقة..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-400 mb-1">علامة مميزة (اختياري)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="بجوار صيدلية، أمام المسجد..."
                      className={inputClass}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs text-stone-400 mb-1">وقت الاستلام من المطعم *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الساعة ٨ مساءً أو بعد نصف ساعة"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className={inputClass}
                  />
                  <p className="text-[11px] text-stone-500 mt-1">لطلب التيك أواي: الاسم ورقم الموبايل ووقت الاستلام فقط.</p>
                </div>
              )}

              <div>
                <label className="block text-xs text-stone-400 mb-1">ملاحظات عامة للأوردر</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="أي طلب إضافي خاص بالتحضير..."
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Financial Breakdown */}
          {cartItems.length > 0 && (
            <div className="bg-black/40 p-3.5 rounded-2xl border border-[#E3B75B]/15 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-400">
                <span>المجموع الفرعي:</span>
                <span className="font-mono font-bold text-stone-200">{subtotal} ج</span>
              </div>

              {orderType === 'delivery' && (
                <div className="flex items-center justify-between text-stone-400">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono font-bold text-stone-200">{deliveryFee} ج</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#E3B75B]/15 flex items-center justify-between text-sm font-bold text-white">
                <span>الإجمالي النهائي:</span>
                <span className="font-mono gold-text text-base font-extrabold">
                  {totalAmount} جنيه
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer: the chicken is the send button */}
        {cartItems.length > 0 && (
          <div className="p-4 pt-3 border-t border-[#E3B75B]/15 bg-black/40">
            <ChickenSendButton status={sendStatus} total={totalAmount} onClick={handleSubmitOrder} />
            <p className="text-[11px] text-stone-500 text-center mt-1">
              اضغط على الدجاجة لإرسال الأوردر 🍗 — سيُحجز رقمه اليومي تلقائيًا ثم تُفتح محادثة واتساب
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
