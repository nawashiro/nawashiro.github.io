export type PostTimestamps = {
  published: string;
  updated: string;
};

// Date-only values use UTC. Datetimes must carry an explicit offset.
const timestampPattern = /^(\d{4}-\d{2}-\d{2})(?:T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/;

export function parsePostTimestamp(
  value: unknown,
  location: string,
  field: keyof PostTimestamps,
): Date {
  const match = typeof value === "string" ? timestampPattern.exec(value) : null;
  const calendarDate = match ? new Date(`${match[1]}T00:00:00.000Z`) : null;
  const date = match ? new Date(value as string) : null;
  if (!match || !calendarDate || !Number.isFinite(calendarDate.getTime()) ||
      calendarDate.toISOString().slice(0, 10) !== match[1] ||
      !date || !Number.isFinite(date.getTime())) {
    throw new Error(`${location}: invalid or missing ${field}; use YYYY-MM-DD or an ISO datetime with an explicit timezone`);
  }
  return date;
}

export function readPostTimestamps(
  data: Record<string, unknown>,
  location: string,
): PostTimestamps {
  parsePostTimestamp(data.published, location, "published");
  parsePostTimestamp(data.updated, location, "updated");
  return { published: data.published as string, updated: data.updated as string };
}

export function compareUpdatedDescending(a: PostTimestamps, b: PostTimestamps): number {
  return new Date(b.updated).getTime() - new Date(a.updated).getTime() ||
    new Date(b.published).getTime() - new Date(a.published).getTime();
}
