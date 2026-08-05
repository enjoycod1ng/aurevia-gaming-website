import type { ServiceIconName } from "@/types/content";

export function ServiceIcon({ name }: { name: ServiceIconName }) {
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

  if (name === "shield") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3.2 19 6v5.2c0 4.4-2.7 7.7-7 9.6-4.3-1.9-7-5.2-7-9.6V6l7-2.8Z" />
        <path d="m8.8 12 2.1 2.1 4.5-4.6" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m5.5 12.5 4.2 4.2 8.8-9.2" />
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
