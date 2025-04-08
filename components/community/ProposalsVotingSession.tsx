"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThumbsUp, ThumbsDown, User, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface TopicProposal {
  id: string;
  title: string;
  description: string;
  communityId: string;
  createdBy: {
    id: string;
    name: string;
    profilePicture?: string;
    role: "contributor" | "creator";
  };
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  votes: {
    approve: number;
    reject: number;
  };
}

interface ProposalsVotingSessionProps {
  communityId: string;
}

export default function ProposalsVotingSession({
  communityId,
}: ProposalsVotingSessionProps) {
  const [proposals, setProposals] = useState<TopicProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [showContributionAlert, setShowContributionAlert] = useState(false);
  const [selectedProposal, setSelectedProposal] =
    useState<TopicProposal | null>(null);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
  });

  // Fonction pour récupérer les propositions
  const fetchProposals = useCallback(async () => {
    try {
      // TODO: Remplacer par un vrai appel API
      const mockProposals: TopicProposal[] = [
        {
          id: "1",
          title: "Introduction à TypeScript",
          description:
            "Un guide complet pour démarrer avec TypeScript, couvrant les types de base jusqu'aux fonctionnalités avancées.",
          communityId: communityId,
          createdBy: {
            id: "1",
            name: "John Doe",
            profilePicture: "/images/default-avatar.png",
            role: "creator",
          },
          status: "pending",
          createdAt: new Date(),
          votes: {
            approve: 15,
            reject: 3,
          },
        },
      ];

      setProposals(mockProposals);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des propositions:", error);
      toast.error("Erreur lors de la récupération des propositions");
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Remplacer par un vrai appel API
      const newProposalData: TopicProposal = {
        id: Math.random().toString(),
        ...newProposal,
        communityId: communityId,
        createdBy: {
          id: "1",
          name: "John Doe",
          profilePicture: "/images/default-avatar.png",
          role: "creator",
        },
        status: "pending",
        createdAt: new Date(),
        votes: {
          approve: 0,
          reject: 0,
        },
      };

      setProposals((prev) => [...prev, newProposalData]);
      setIsProposalDialogOpen(false);
      setNewProposal({ title: "", description: "" });
      toast.success("Proposition soumise avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la soumission de la proposition");
    }
  };

  const handleVote = async (proposalId: string, vote: "approve" | "reject") => {
    try {
      // TODO: Remplacer par un vrai appel API
      setProposals((prev) =>
        prev.map((proposal) => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              votes: {
                ...proposal.votes,
                [vote]: proposal.votes[vote] + 1,
              },
            };
          }
          return proposal;
        })
      );
      toast.success("Vote enregistré avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du vote");
    }
  };

  const handleContribute = (proposal: TopicProposal) => {
    setSelectedProposal(proposal);
    setShowContributionAlert(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">Chargement des propositions...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Propositions de sujets</h2>
          <p className="text-muted-foreground">
            Votez pour les sujets que vous souhaitez voir développés
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-primary text-white hover:bg-primary/90">
              Proposer un sujet
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-[500px] bg-white">
            <SheetHeader>
              <SheetTitle>Proposer un nouveau sujet</SheetTitle>
              <SheetDescription>
                Remplissez le formulaire ci-dessous pour proposer un nouveau
                sujet à la communauté. Les propositions sont soumises au vote
                des membres.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmitProposal}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Titre
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ex: Introduction à TypeScript"
                      value={newProposal.title}
                      onChange={(e) =>
                        setNewProposal((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="description"
                      className="text-right self-start"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre proposition en détail..."
                      value={newProposal.description}
                      onChange={(e) =>
                        setNewProposal((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="col-span-3 min-h-[200px]"
                      required
                    />
                  </div>
                </div>
                <div className="items-top flex space-x-2">
                  <Checkbox id="terms" />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Se proposer pour rédiger ce sujet
                    </Label>
                  </div>
                </div>
              </div>
              <SheetFooter className="mt-4">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </SheetClose>
                <Button type="submit">Soumettre la proposition</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Guide de vote</AlertTitle>
        <AlertDescription>
          Votez pour les sujets qui vous intéressent. Les sujets les plus
          populaires seront développés en priorité.
        </AlertDescription>
      </Alert>

      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="grid gap-4">
          {proposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="relative hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" className="p-0">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={proposal.createdBy.profilePicture}
                              />
                              <AvatarFallback>
                                <User className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={proposal.createdBy.profilePicture}
                              />
                              <AvatarFallback>
                                <User className="w-6 h-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">
                                {proposal.createdBy.name}
                              </h4>
                              <p className="text-sm text-muted-foreground capitalize">
                                {proposal.createdBy.role}
                              </p>
                              <div className="flex items-center pt-2">
                                <span className="text-xs text-muted-foreground">
                                  Membre depuis{" "}
                                  {new Date(
                                    proposal.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {proposal.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Proposé par {proposal.createdBy.name} •{" "}
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            {proposal.votes.approve}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmer votre vote
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Voulez-vous vraiment approuver cette proposition ?
                              Votre vote ne pourra pas être modifié.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end gap-2">
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleVote(proposal.id, "approve")}
                            >
                              Confirmer
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            {proposal.votes.reject}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmer votre vote
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Voulez-vous vraiment rejeter cette proposition ?
                              Votre vote ne pourra pas être modifié.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end gap-2">
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleVote(proposal.id, "reject")}
                            >
                              Confirmer
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {proposal.description}
                  </p>
                  <div className="flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="secondary" size="sm">
                          Je veux contribuer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Contribuer à la rédaction
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            En acceptant, vous rejoindrez l'équipe de rédaction
                            de ce contenu. Vous serez notifié des prochaines
                            étapes une fois que la proposition sera approuvée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              toast.success("Votre intérêt a été enregistré !");
                              setShowContributionAlert(false);
                            }}
                          >
                            Confirmer
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
