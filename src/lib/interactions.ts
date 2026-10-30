/**
 * Small DOM helpers that add the "interactive" feel to the menu:
 * click ripples, an item that flies into the cart, haptic feedback.
 * Everything here is a no-op when the user prefers reduced motion.
 */

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Short vibration on phones that support it. */
export function vibrate(ms = 14): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // ignore
  }
}

/** Plays the little "bump" on the header cart button. */
export function bumpCart(): void {
  const target = document.getElementById('header-cart-btn');
  if (!target) return;
  target.classList.remove('cart-bump');
  // force reflow so the animation can restart
  void target.offsetWidth;
  target.classList.add('cart-bump');
}

/** Launches an emoji from `from` to the cart button in the header. */
export function flyToCart(from: DOMRect | null, emoji = '🍗'): void {
  const target = document.getElementById('header-cart-btn');
  if (!target || !from || prefersReducedMotion() || typeof target.animate !== 'function') {
    bumpCart();
    return;
  }

  const t = target.getBoundingClientRect();
  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;
  const dx = t.left + t.width / 2 - startX;
  const dy = t.top + t.height / 2 - startY;

  const el = document.createElement('div');
  el.className = 'fly-item';
  el.textContent = emoji;
  el.style.left = `${startX}px`;
  el.style.top = `${startY}px`;
  document.body.appendChild(el);

  const anim = el.animate(
    [
      { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
      {
        transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 90}px)) scale(1.5) rotate(160deg)`,
        opacity: 1,
        offset: 0.45
      },
      {
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.35) rotate(360deg)`,
        opacity: 0.25
      }
    ],
    { duration: 760, easing: 'cubic-bezier(.4, .1, .3, 1)' }
  );

  anim.onfinish = () => {
    el.remove();
    bumpCart();
  };
  anim.oncancel = () => el.remove();
}

/**
 * Adds a ripple to any element with the `btn-ripple` class on pointer down.
 * Returns a cleanup function.
 */
export function initRipple(): () => void {
  const onDown = (ev: PointerEvent) => {
    const target = (ev.target as HTMLElement | null)?.closest<HTMLElement>('.btn-ripple');
    if (!target || (target as HTMLButtonElement).disabled) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const dot = document.createElement('span');
    dot.className = 'ripple-dot';
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${ev.clientX - rect.left - size / 2}px`;
    dot.style.top = `${ev.clientY - rect.top - size / 2}px`;
    target.appendChild(dot);
    window.setTimeout(() => dot.remove(), 650);
  };

  document.addEventListener('pointerdown', onDown, { passive: true });
  return () => document.removeEventListener('pointerdown', onDown);
}
