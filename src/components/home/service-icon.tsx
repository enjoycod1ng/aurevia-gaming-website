import type { SiteContent } from "@/types/content";

type HomeServiceIconName = SiteContent["home"]["services"]["items"][number]["icon"];

export function ServiceIcon({ name }: { name: HomeServiceIconName }) {
  if (name === "devices") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3" y="5" width="13" height="10" rx="1.5" />
        <path d="M7 19h5M9.5 15v4" />
        <rect x="15" y="9" width="6" height="10" rx="1.5" />
      </svg>
    );
  }

  if (name === "diamond") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m12 3 8 9-8 9-8-9 8-9Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "controls") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />
        <circle cx="14" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 2.5c.8 4.6 3.2 7 7.5 7.8-4.3.8-6.7 3.2-7.5 7.7-.8-4.5-3.2-6.9-7.5-7.7C8.8 9.5 11.2 7.1 12 2.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
