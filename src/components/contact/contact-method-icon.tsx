type ContactMethodIconName = "telegram" | "phone" | "delivery";

export function ContactMethodIcon({ name }: { name: ContactMethodIconName }) {
  if (name === "phone") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7.2 3.8 4.5 6.5c.7 6.4 5.8 11.5 12.2 12.2l2.7-2.7-4-2-1.7 1.7a12.4 12.4 0 0 1-5.4-5.4L10 8.6l-2.8-4.8Z" />
      </svg>
    );
  }

  if (name === "delivery") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.8 12h16.4M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5S14.3 18.1 12 20.5M12 3.5C9.7 5.9 8.6 8.7 8.6 12s1.1 6.1 3.4 8.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m4 11.4 15.6-6.1-3.1 13.5-4.8-4-2.8 2.7.4-4.2 7.7-5.2-9.4 4.2L4 11.4Z" />
    </svg>
  );
}
