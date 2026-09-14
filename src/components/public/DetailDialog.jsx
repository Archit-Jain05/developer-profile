import { useCallback, useLayoutEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import "./DetailDialog.css";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Transform that makes `panel` cover the `origin` element's box. */
function coverTransform(origin, panel) {
  const from = origin.getBoundingClientRect();
  const to = panel.getBoundingClientRect();
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

/**
 * Modal detail view that grows out of the card that opened it and shrinks
 * back into it on close. Mount it to open; `onClose` fires once it has closed.
 */
export default function DetailDialog({ originRef, labelledBy, onClose, children }) {
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const scrimRef = useRef(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

    dialog.showModal();

    const panel = panelRef.current;
    const origin = originRef.current;
    if (!prefersReducedMotion() && origin) {
      panel.animate([{ transform: coverTransform(origin, panel), opacity: 0.35 }, { transform: "none", opacity: 1 }], {
        duration: 460,
        easing: EASE,
      });
      panel.querySelector(".detail__content")?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], {
        duration: 460,
        easing: "ease-out",
      });
    }
    scrimRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });

    return () => {
      root.style.overflow = previous.overflow;
      root.style.paddingRight = previous.paddingRight;
      if (dialog.open) dialog.close();
    };
  }, [originRef]);

  const requestClose = useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    const panel = panelRef.current;
    const origin = originRef.current;
    const reduced = prefersReducedMotion();

    const animations = [
      scrimRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 1 : 280, fill: "forwards" }),
    ];
    if (!reduced && origin) {
      panel.querySelector(".detail__content")?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 140,
        fill: "forwards",
      });
      animations.push(
        panel.animate([{ transform: "none", opacity: 1 }, { transform: coverTransform(origin, panel), opacity: 0.2 }], {
          duration: 340,
          easing: EASE,
          fill: "forwards",
        }),
      );
    } else {
      animations.push(panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 1 : 200, fill: "forwards" }));
    }
    await Promise.allSettled(animations.map((a) => a.finished));
    dialogRef.current?.close();
    onClose();
  }, [onClose, originRef]);

  return (
    <dialog
      ref={dialogRef}
      className="detail"
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
    >
      <div ref={scrimRef} className="detail__scrim" onClick={requestClose} />
      <div ref={panelRef} className="detail__panel">
        <button type="button" className="detail__close" aria-label="Close" onClick={requestClose}>
          <FiX aria-hidden="true" />
        </button>
        <div className="detail__content">{children}</div>
      </div>
    </dialog>
  );
}
