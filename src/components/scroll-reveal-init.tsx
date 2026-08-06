"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.12,
      rootMargin: "0px 0px -12% 0px",
    };

    const observedElements = new Set<Element>();

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const observeTargets = () => {
      document.querySelectorAll<HTMLElement>("[data-scroll-reveal]").forEach((element) => {
        if (!observedElements.has(element) && !element.classList.contains("is-revealed")) {
          observedElements.add(element);
          observer.observe(element);
        }
      });
    };

    observeTargets();

    const mutationObserver = new MutationObserver(() => observeTargets());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
