/** Convert API failures to bounded display text without rendering response objects. */
export function apiErrorMessage(error: unknown, fallback = "The request failed."): string {
  if (!error || typeof error !== "object") return fallback;
  const value = error as Record<string, unknown>;
  for (const field of [value.message, value.detail]) {
    if (typeof field === "string" && field.trim()) return field.slice(0, 500);
  }
  if (Array.isArray(value.detail)) {
    const messages = value.detail.slice(0, 5).flatMap((item: unknown) => {
      if (!item || typeof item !== "object") return [];
      const msg = (item as Record<string, unknown>).msg;
      return typeof msg === "string" && msg.trim() ? [msg.slice(0, 200)] : [];
    });
    if (messages.length) return messages.join("; ").slice(0, 500);
  }
  return fallback;
}
