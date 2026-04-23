export const toRelativeTime = (isoTime: string | null) => {
  if (!isoTime) return 'Unknown update time';

  const diffSeconds = Math.floor((Date.now() - new Date(isoTime).getTime()) / 1000);
  if (diffSeconds < 60) return `${Math.max(diffSeconds, 0)}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
};
