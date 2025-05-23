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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Simule une base d'utilisateurs
const MOCK_USERS = [
  {
    id: "1",
    name: "Alice Martin",
    email: "alice.martin@email.com",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: "2",
    name: "Bob Dupont",
    email: "bob.dupont@email.com",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "3",
    name: "Chloé Bernard",
    email: "chloe.bernard@email.com",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: "4",
    name: "David Leroy",
    email: "david.leroy@email.com",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  // ...ajoute autant d'utilisateurs fictifs que tu veux
];

// Simule un appel API avec un délai
function fetchUsers(search: string) {
  return new Promise<typeof MOCK_USERS>((resolve) => {
    setTimeout(() => {
      const filtered = MOCK_USERS.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
      resolve(filtered);
    }, 400);
  });
}

const ModalInvite = ({
  open,
  onOpenChange,
  communityUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityUrl: string;
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof MOCK_USERS>([]);
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: () => fetchUsers(search),
    enabled: open && search.length > 0,
  });

  const t = useTranslations("inviteModal");

  const [copied, setCopied] = useState(false);

  const handleSelect = (user: (typeof MOCK_USERS)[0]) => {
    if (!selected.find((u) => u.id === user.id)) {
      setSelected((prev) => [...prev, user]);
    }
  };

  const handleRemove = (userId: string) => {
    setSelected((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleInvite = () => {
    // Simule l'envoi d'invitations
    toast.success(
      t("toast.success", { emails: selected.map((u) => u.email).join(", ") })
    );
    setSelected([]);
    setSearch("");
    onOpenChange(false);
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
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="flex items-center w-full px-3 py-2 hover:bg-accent transition"
                    onClick={() => handleSelect(user)}
                  >
                    <Avatar className="h-7 w-7 mr-2">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-left">
                      <span className="font-medium">{user.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {user.email}
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
              {selected.map((user) => (
                <span
                  key={user.id}
                  className="flex items-center bg-accent rounded-full px-3 py-1 text-sm"
                >
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.name}
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
