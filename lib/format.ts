const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// "2024-03-15" -> "15 Mar 2024"
export function formatDate(value: string | null) {
  return value ? dateFormat.format(new Date(value)) : null;
}
