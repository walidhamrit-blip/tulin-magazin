import { useEffect } from "react";

/**
 * Reference-counted body scroll lock.
 * Several overlays (mobile menu, cart, quick view, story modal) can be open
 * or close in sequence on a phone — a plain boolean would let one of them
 * re-enable scrolling while another is still visible.
 */
let locks = 0;
let previousOverflow = "";
let previousPadding = "";

function applyLock() {
  if (locks === 0) {
    previousOverflow = document.body.style.overflow;
    previousPadding = document.body.style.paddingInlineEnd;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    // Compensate the desktop scrollbar so the layout does not jump.
    if (scrollbar > 0) document.body.style.paddingInlineEnd = `${scrollbar}px`;
    document.documentElement.dataset.scrollLocked = "true";
  }
  locks += 1;
}

function releaseLock() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  document.body.style.overflow = previousOverflow;
  document.body.style.paddingInlineEnd = previousPadding;
  delete document.documentElement.dataset.scrollLocked;
}

/** Locks page scrolling while `active` is true (no-op when false). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    applyLock();
    return releaseLock;
  }, [active]);
}
