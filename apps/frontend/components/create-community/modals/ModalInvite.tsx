"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { User } from "@/types/user";

async function fetchUsers(search: string): Promise<User[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/user/all?search=${encodeURIComponent(search)}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Erreur lors de la recherche d'utilisateurs");
  return res.json();
}

const ModalInvite = ({
  open,
  onOpenChange,
  communityUrl,
  communitySlug,
  refetch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityUrl: string;
  communitySlug: string;
  refetch?: any;
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User[]>([]);
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: () => fetchUsers(search),
    enabled: open && search.length > 0,
  });

  const t = useTranslations("inviteModal");

  const [copied, setCopied] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: async (userIds: (string | number)[]) => {
      console.log(userIds);
      console.log(communitySlug);
      await Promise.all(
        userIds.map(async (userId) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/learners/invite`,
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            }
          );
          if (!res.ok) {
            // On récupère le message d'erreur du backend
            const errorData = await res.json();
            throw new Error(errorData.message || "Erreur lors de l'invitation");
          }
        })
      );
    },
    onSuccess: () => {
      if (refetch) refetch();

      toast.success(
        t("toast.success", { emails: selected.map((u) => u.email).join(", ") })
      );
      setSelected([]);
      setSearch("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Affiche le message du backend dans le toast
      toast.error(error.message || "Erreur lors de l'envoi des invitations");
    },
  });

  const handleSelect = (user: User) => {
    if (!selected.find((u) => u.id === user.id)) {
      setSelected((prev) => [...prev, user]);
    }
  };

  const handleRemove = (userId: string | number) => {
    setSelected((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleInvite = () => {
    inviteMutation.mutate(selected.map((u) => u.id));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(communityUrl);
      setCopied(true);
      toast.success(t("copy.success"));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("copy.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {/* Zone de copie du lien */}
        <div className="flex items-center gap-2 mb-4 bg-muted rounded px-3 py-2">
          <Input
            value={communityUrl}
            readOnly
            className="flex-1 bg-muted border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            aria-label={t("copy.button")}
          >
            <Copy className="w-4 h-4" />
          </Button>
          {copied && (
            <span className="text-xs text-green-600 ml-2">
              {t("copy.copied")}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Input
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {/* Suggestions */}
          {search.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded-md bg-muted">
              {isLoading ? (
                <div className="p-2 text-sm text-muted-foreground">
                  {t("search.loading")}
                </div>
              ) : users.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  {t("search.noResult")}
                </div>
              ) : (
                users.map((user: User) => (
                  <button
                    key={user.id}
                    type="button"
                    className="flex items-center w-full px-3 py-2 hover:bg-accent transition"
                    onClick={() => handleSelect(user)}
                  >
                    <span className="flex-1 text-left">
                      <span className="font-medium">
                        {user.firstname} {user.lastname}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {user.pseudo} · {user.email}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Utilisateurs sélectionnés */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selected.map((user: User) => (
                <span
                  key={user.id}
                  className="flex items-center bg-accent rounded-full px-3 py-1 text-sm"
                >
                  {user.firstname} {user.lastname}{" "}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({user.pseudo})
                  </span>
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(user.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleInvite}
            disabled={selected.length === 0}
            className="w-full"
          >
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalInvite;
