import { useState, useEffect } from "react";
import { analyticsApi, type Badge } from "@/api/analytics";

interface UserBadgesProps {
  badges?: Badge[];
  userId?: string;
  size?: "sm" | "md";
}

export function UserBadges({ badges: initialBadges, userId, size = "md" }: UserBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>(initialBadges || []);
  const [loading, setLoading] = useState(!initialBadges && !!userId);

  useEffect(() => {
    if (initialBadges) {
      setBadges(initialBadges);
      return;
    }
    if (userId) {
      setLoading(true);
      analyticsApi
        .getUserBadges(userId)
        .then(setBadges)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialBadges, userId]);

  if (loading) {
    return <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />;
  }

  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((b) => (
        <div
          key={b.id}
          title={b.description}
          className={`group relative inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium transition-all hover:scale-105 ${
            size === "sm" ? "text-[10px]" : "text-xs"
          } ${b.color}`}
        >
          <span>{b.icon}</span>
          <span>{b.title}</span>
        </div>
      ))}
    </div>
  );
}
