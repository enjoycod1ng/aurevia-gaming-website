"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const seen = new WeakSet<Element>();
    const pending = new Set<Element>();
    const selector = "[data-scroll-reveal]";
    const pendingClass = "scroll-reveal-pending";

    const reveal = (element: Element) => {
      element.classList.remove(pendingClass);
      pending.delete(element);
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });

    const observe = (element: Element) => {
      if (seen.has(element) || reducedMotion.matches) return;
      seen.add(element);

      // Keep the first screen and restored scroll positions visible immediately.
      // Content also stays visible when JavaScript or observers are unavailable.
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add(pendingClass);
      pending.add(element);
      observer.observe(element);
    };

    const visit = (root: Element, callback: (element: Element) => void) => {
      if (root.matches(selector)) callback(root);
      root.querySelectorAll(selector).forEach(callback);
    };

    visit(document.body, observe);

    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (node instanceof Element && !node.isConnected) {
            visit(node, (element) => {
              observer.unobserve(element);
              reveal(element);
              seen.delete(element);
            });
          }
        }
        for (const node of record.addedNodes) {
          if (node instanceof Element && node.isConnected) visit(node, observe);
        }
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const revealAll = () => {
      if (reducedMotion.matches) {
        pending.forEach(reveal);
        observer.disconnect();
      }
    };
    reducedMotion.addEventListener("change", revealAll);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      reducedMotion.removeEventListener("change", revealAll);
      pending.forEach(reveal);
    };
  }, []);

  return null;
}
