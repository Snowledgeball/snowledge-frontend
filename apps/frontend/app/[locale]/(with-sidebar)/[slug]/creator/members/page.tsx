"use client";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@repo/ui";
import { useState } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";

type Member = {
  id: number;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  isContributor: boolean;
  created_at: string;
};

export default function Page() {
  const { slug } = useParams();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>("");
  const t = useTranslations("members");

  // Fetch des membres
  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery<Member[]>({
    queryKey: ["learners", slug],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${slug}/learners`,
        { credentials: "include" }
      );
      if (res.status == 401) {
        toast.error("Veuillez vous reconnecter pour accéder à cette page");
        window.location.href = "/";
      }
      if (!res.ok) throw new Error("Erreur lors du chargement des membres");
      return res.json();
    },
  });

  // Suppression d'un membre
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${slug}/learners/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners", slug] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async ({
      userId,
      isContributor,
    }: {
      userId: number;
      isContributor: boolean;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${slug}/learners/${userId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isContributor }),
        }
      );
      if (!res.ok) throw new Error("Erreur lors de la modification du statut");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners", slug] });
    },
  });

  // Filtrage
  const filteredMembers = members.filter((m) => {
    const name = `${m.user.firstname} ${m.user.lastname}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder={t("search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("role_member")}</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>{t("role_contributor")}</TableHead>
            <TableHead>{t("added_on")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                {member.user.firstname} {member.user.lastname}
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                <span className="capitalize">
                  {member.isContributor
                    ? t("role_contributor")
                    : t("role_member")}
                </span>
              </TableCell>
              <TableCell>
                {new Date(member.created_at).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                      <span className="sr-only">{t("actions")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        promoteMutation.mutate({
                          userId: member.user.id,
                          isContributor: !member.isContributor,
                        });
                      }}
                    >
                      {member.isContributor ? t("demote") : t("promote")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedMemberId(member.user.id);
                        setSelectedMemberName(
                          `${member.user.firstname} ${member.user.lastname}`
                        );
                      }}
                      className="text-destructive"
                    >
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Dialog de confirmation */}
      <Dialog
        open={selectedMemberId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMemberId(null);
            setSelectedMemberName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_delete_title")}</DialogTitle>
            <DialogDescription>
              {t("confirm_delete_desc", { name: selectedMemberName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedMemberId) {
                  deleteMutation.mutate(selectedMemberId);
                  setSelectedMemberId(null);
                  setSelectedMemberName("");
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground mt-8">
          {t("no_member")}
        </div>
      )}
      {isLoading && <div>{t("loading")}</div>}
      {isError && <div className="text-red-500 mt-4">{t("error")}</div>}
    </div>
  );
}
