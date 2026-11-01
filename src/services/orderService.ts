import {
  db,
  doc,
  runTransaction,
  serverTimestamp,
  collection
} from '../lib/firebase';
import { CustomerOrder, RESTAURANT_INFO } from '../data/menuData';

/**
 * Gets the current date string in Cairo time zone (Africa/Cairo) YYYY-MM-DD
 */
export function getCairoDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    // Fallback if Intl format fails: shift by +2h (Cairo standard time) and read the UTC date
    const cairoNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return cairoNow.toISOString().split('T')[0];
  }
}

type OrderItem = CustomerOrder['items'][number];

/**
 * Firestore rejects `undefined` field values, so only keep the optional
 * fields that actually have a value.
 */
function cleanItems(items: OrderItem[]): OrderItem[] {
  return items.map((it) => {
    const clean: OrderItem = {
      name: it.name,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      totalPrice: it.totalPrice
    };
    if (it.optionName) clean.optionName = it.optionName;
    if (it.notes) clean.notes = it.notes;
    if (it.includedSauces && it.includedSauces.length > 0) clean.includedSauces = it.includedSauces;
    return clean;
  });
}

export interface SubmittedOrder {
  orderId: string;
  orderNumber: number;
  dateString: string;
  /** false when the order could not be written to Firestore (network/rules problem). */
  synced: boolean;
}

/**
 * Creates an order with an atomic daily sequential order number (#1, #2, #3...)
 */
export async function submitOrderWithDailyCounter(
  orderInput: Omit<CustomerOrder, 'orderNumber' | 'dateString' | 'createdAt' | 'status'>
): Promise<SubmittedOrder> {
  const dateString = getCairoDateString();
  const counterRef = doc(db, 'daily_counters', dateString);
  const newOrderRef = doc(collection(db, 'orders'));
  const orderId = newOrderRef.id;

  try {
    const result = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      let nextNumber = 1;

      if (counterSnap.exists()) {
        const data = counterSnap.data();
        nextNumber = (Number(data.lastOrderNumber) || 0) + 1;
        transaction.update(counterRef, {
          lastOrderNumber: nextNumber,
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.set(counterRef, {
          dateString,
          lastOrderNumber: nextNumber,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      const fullOrder: CustomerOrder = {
        id: orderId,
        orderNumber: nextNumber,
        dateString,
        createdAt: serverTimestamp(),
        orderType: orderInput.orderType,
        customerName: orderInput.customerName.trim(),
        customerPhone: orderInput.customerPhone.trim(),
        deliveryAddress: orderInput.deliveryAddress?.trim() || '',
        pickupTime: orderInput.pickupTime?.trim() || '',
        landmark: orderInput.landmark?.trim() || '',
        orderNotes: orderInput.orderNotes?.trim() || '',
        items: cleanItems(orderInput.items),
        deliveryFee: orderInput.deliveryFee,
        subtotal: orderInput.subtotal,
        totalAmount: orderInput.totalAmount,
        status: 'new'
      };

      transaction.set(newOrderRef, fullOrder);

      return {
        orderId,
        orderNumber: nextNumber,
        dateString,
        synced: true
      };
    });

    return result;
  } catch (error) {
    console.error('Failed to save the order in Firestore:', error);
    // The customer can still send the order over WhatsApp, but it is NOT in the
    // system, so we say so (synced: false) instead of pretending it was saved.
    return {
      orderId: 'loc_' + Date.now(),
      orderNumber: 0,
      dateString,
      synced: false
    };
  }
}

/**
 * Builds the beautifully formatted WhatsApp message exactly matching the requested format
 */
export function buildWhatsAppMessage(order: {
  /** Omit when the order was not saved, so no fake number is sent. */
  orderNumber?: number;
  orderType: 'takeaway' | 'delivery';
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  pickupTime?: string;
  landmark?: string;
  orderNotes?: string;
  items: {
    name: string;
    optionName?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    notes?: string;
    includedSauces?: string[];
  }[];
  deliveryFee: number;
  totalAmount: number;
}): string {
  const isDelivery = order.orderType === 'delivery';
  const typeText = isDelivery ? 'دليفري 🛵' : 'تيك أواي (استلام من المطعم) 🛍️';

  const itemsList = order.items
    .map((item) => {
      const optionDetails = item.optionName ? ` (${item.optionName})` : '';
      const notes = item.notes ? ` [ملاحظات: ${item.notes}]` : '';
      const sauces = item.includedSauces?.length ? ` [الصوصات: ${item.includedSauces.join(' + ')}]` : '';
      return `${item.quantity}× ${item.name}${optionDetails} — ${item.totalPrice} ج${sauces}${notes}`;
    })
    .join('\n');

  const normalizedName = order.customerName.trim().replace(/\s+/g, ' ');
  const phoneDigits = order.customerPhone.replace(/\D/g, '');
  const normalizedPhone = phoneDigits.startsWith('20')
    ? `0${phoneDigits.slice(2)}`
    : phoneDigits;
  const isSiteDeveloper =
    normalizedName === 'مروان الهم' && normalizedPhone === '01159615794';

  let message = `🍗 *طلب جديد من A1*\n`;
  if (isSiteDeveloper) {
    message += `━━━━━━━━━━━━━━━━━━\n*👑✨ (مطور الموقع) ✨👑*\n*💛 VIP ORDER | طلب VIP مميز 💛*\n━━━━━━━━━━━━━━━━━━\n`;
  }
  if (order.orderNumber) {
    message += `رقم الأوردر: #${order.orderNumber}\n`;
  }
  message += `النوع: ${typeText}\n`;
  message += `الاسم: ${order.customerName}\n`;
  message += `الموبايل: ${order.customerPhone}\n`;

  if (isDelivery) {
    message += `العنوان: ${order.deliveryAddress || 'غير محدد'}\n`;
    if (order.landmark) {
      message += `علامة مميزة: ${order.landmark}\n`;
    }
  } else if (order.pickupTime) {
    message += `وقت الاستلام: ${order.pickupTime}\n`;
  }

  message += `----------------\n`;
  message += `${itemsList}\n`;
  message += `----------------\n`;

  if (isDelivery && order.deliveryFee > 0) {
    message += `رسوم التوصيل: ${order.deliveryFee} ج\n`;
  }
  message += `الإجمالي: ${order.totalAmount} جنيه\n`;

  if (order.orderNotes) {
    message += `ملاحظات: ${order.orderNotes}\n`;
  }

  return message;
}

/**
 * Generates the WhatsApp URL to open chat directly with the restaurant
 */
export function getWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encoded}`;
}
