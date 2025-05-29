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
} from "@repo/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const router = useRouter();
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>("");

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
        router.push("/");
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
      <h1 className="text-2xl font-bold mb-6">Gestion des membres</h1>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Date d'ajout</TableHead>
            <TableHead>Actions</TableHead>
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
                  {member.isContributor ? "Contributeur" : "Membre"}
                </span>
              </TableCell>
              <TableCell>
                {new Date(member.created_at).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedMemberId(member.user.id);
                    setSelectedMemberName(
                      `${member.user.firstname} ${member.user.lastname}`
                    );
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Supprimer
                </Button>
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
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <b>{selectedMemberName}</b> de
              la communauté ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
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
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground mt-8">
          Aucun membre trouvé.
        </div>
      )}
      {isLoading && <div>Chargement...</div>}
      {isError && (
        <div className="text-red-500 mt-4">
          Erreur lors du chargement des membres.
        </div>
      )}
    </div>
  );
}
