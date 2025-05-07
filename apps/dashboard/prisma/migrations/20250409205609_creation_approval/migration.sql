-- CreateTable
CREATE TABLE "community_proposals" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "possible_contributors" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_proposal_votes" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "voter_id" INTEGER NOT NULL,
    "vote" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_proposal_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_proposal_community" ON "community_proposals"("community_id");

-- CreateIndex
CREATE INDEX "idx_proposal_author" ON "community_proposals"("author_id");

-- CreateIndex
CREATE INDEX "idx_proposal_status" ON "community_proposals"("status");

-- CreateIndex
CREATE INDEX "idx_proposal_votes_proposal" ON "community_proposal_votes"("proposal_id");

-- CreateIndex
CREATE INDEX "idx_proposal_votes_voter" ON "community_proposal_votes"("voter_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_proposal_voter" ON "community_proposal_votes"("proposal_id", "voter_id");

-- AddForeignKey
ALTER TABLE "community_proposals" ADD CONSTRAINT "community_proposals_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_proposals" ADD CONSTRAINT "community_proposals_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_proposal_votes" ADD CONSTRAINT "community_proposal_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "community_proposals"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_proposal_votes" ADD CONSTRAINT "community_proposal_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
