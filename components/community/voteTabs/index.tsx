"use client";

import { VotingSessionTabs } from "./VotingSessionTabs";
import { VotingSessionProps } from "./common/types";

export function VotingSession({ communityId }: VotingSessionProps) {
  return <VotingSessionTabs communityId={communityId} />;
}

export default VotingSession;
