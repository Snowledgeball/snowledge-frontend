import { Button } from "@repo/ui";
import { Community } from "@/types/community";

interface InvitationListProps {
  invitations: Community[];
  isLoading: boolean;
  onAccept: (slug: string) => Promise<void>;
  onDecline: (slug: string) => Promise<void>;
  t: (key: string) => string;
}

export function InvitationList({
  invitations,
  isLoading,
  onAccept,
  onDecline,
  t,
}: InvitationListProps) {
  if (isLoading) return <p>{t("loading")}</p>;
  if (invitations.length === 0) return <p>{t("no_invitations")}</p>;

  return (
    <ul className="space-y-2">
      {invitations.map((community) => (
        <li
          key={community.id}
          className="flex items-center justify-between border rounded p-2"
        >
          <div>
            <span className="font-medium">{community.name}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              ({community.slug})
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onAccept(community.slug)}>
              {t("accept")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecline(community.slug)}
            >
              {t("decline")}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
