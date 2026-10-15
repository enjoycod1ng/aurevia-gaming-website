export const CONTACT_MAX_LENGTH = 160;

// Shared by the quote form and /api/contact so the browser rejects exactly the
// values the server would: an email address or a Telegram @handle.
export function isValidContact(value: string): boolean {
  const contact = value.trim();
  return (
    contact.length <= CONTACT_MAX_LENGTH &&
    (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ||
      /^@[A-Za-z0-9_]{5,32}$/.test(contact))
  );
}
