"use client";
import VotingCardRow from "@/components/voting/shared/voting-card-row";
import type { Vote } from "@/components/voting/shared/voting-card-row";
import { useState } from "react";
import VoteScreen from "./vote-screen";
import { FileText } from "lucide-react";

// ============
// Function: VotingInProgressList
// ------------
// DESCRIPTION: Displays a list of ongoing votes using VotingCardRow for each vote. Uses mock data for now. Handles navigation to VoteScreen.
// PARAMS: None
// RETURNS: JSX.Element (the voting list UI)
// ============
const mockVotes: Vote[] = [
  {
    id: "1",
    title: "Automation Strategies for Small Businesses",
    description:
      "Exploring how automation tools can save time, reduce errors, and scale operations — from CRM to marketing workflows.",
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
    progress: 67,
    participationLevel: "medium",
    submitter: {
      name: "Alice Johnson",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      profileUrl: "#",
    },
    eligible: true,
    alreadyVoted: false,
    quorum: { current: 48, required: 70 },
    format: "masterclass",
  },
  {
    id: "2",
    title: "Building a Personal Brand as a Knowledge Worker",
    description:
      "Understanding the key elements of visibility, credibility, and community-building to grow your audience and influence.",
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // in 1 day
    progress: 42,
    participationLevel: "low",
    submitter: {
      name: "Bob Smith",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      profileUrl: "#",
    },
    eligible: false,
    alreadyVoted: true,
    quorum: { current: 30, required: 70 },
    format: "white paper",
  },
  {
    id: "3",
    title: "Structuring and Pricing Online Services Effectively",
    description:
      "Investigating best practices to package, price, and position digital services for freelancers, consultants, and creators.",
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
    progress: 92,
    participationLevel: "high",
    submitter: {
      name: "Carol Lee",
      avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
      profileUrl: "#",
    },
    eligible: true,
    alreadyVoted: false,
    quorum: { current: 65, required: 70 },
    format: "masterclass",
  },
];

const VotingInProgressList = () => {
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);

  if (selectedVote) {
    return (
      <VoteScreen vote={selectedVote} onBack={() => setSelectedVote(null)} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {mockVotes.map((vote: Vote) => (
        <VotingCardRow
          key={vote.id}
          vote={vote}
          onVoteNow={() => setSelectedVote(vote)}
        />
      ))}
    </div>
  );
};

export default VotingInProgressList;
