-- CreateTable
CREATE TABLE "community" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_url" VARCHAR(255),
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_bans" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "banned_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_bans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_channels" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_contributors" (
    "community_id" INTEGER NOT NULL,
    "contributor_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_contributors_pkey" PRIMARY KEY ("community_id","contributor_id")
);

-- CreateTable
CREATE TABLE "community_contributors_requests" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "expertise_domain" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "rejection_reason" TEXT,

    CONSTRAINT "community_contributors_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_learners" (
    "community_id" INTEGER NOT NULL,
    "learner_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_learners_pkey" PRIMARY KEY ("community_id","learner_id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "likes_count" INTEGER DEFAULT 0,
    "title" VARCHAR(255) NOT NULL,
    "tag" INTEGER NOT NULL,
    "cover_image_url" VARCHAR(255) NOT NULL,
    "accept_contributions" BOOLEAN DEFAULT false,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "qa_enabled" BOOLEAN DEFAULT true,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts_category" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_posts_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts_comment_conversations" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "community_posts_comment_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts_comments" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ(6),

    CONSTRAINT "community_posts_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts_enrichment_reviews" (
    "id" SERIAL NOT NULL,
    "contribution_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "is_validated" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_posts_contribution_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts_enrichments" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "original_content" TEXT NOT NULL,
    "status" VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,

    CONSTRAINT "community_posts_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts_reviews" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_validated" BOOLEAN DEFAULT false,

    CONSTRAINT "community_posts_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_presentation" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "video_url" TEXT,
    "topic_details" TEXT NOT NULL,
    "code_of_conduct" TEXT NOT NULL,
    "disclaimers" TEXT NOT NULL,

    CONSTRAINT "community_presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_qa_answers" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_accepted" BOOLEAN DEFAULT false,

    CONSTRAINT "community_qa_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_qa_questions" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'ACTIVE',
    "post_id" INTEGER,

    CONSTRAINT "community_qa_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "userName" VARCHAR(50) NOT NULL,
    "profilePicture" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "accountAddress" VARCHAR(65) NOT NULL,
    "publicKey" VARCHAR(65) NOT NULL,
    "privateKey" VARCHAR(160) NOT NULL,
    "salt" VARCHAR(32) NOT NULL,
    "iv" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_name_key" ON "community"("name");

-- CreateIndex
CREATE INDEX "idx_community_bans_community_id" ON "community_bans"("community_id");

-- CreateIndex
CREATE INDEX "idx_community_bans_user_id" ON "community_bans"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_community_user_ban" ON "community_bans"("community_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_community_channels_community" ON "community_channels"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_contributors_requests_community_id_contributor_id_key" ON "community_contributors_requests"("community_id", "requester_id");

-- CreateIndex
CREATE INDEX "idx_posts_category_community" ON "community_posts_category"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_posts_category_community_id_name_key" ON "community_posts_category"("community_id", "name");

-- CreateIndex
CREATE INDEX "idx_comment_conversations_post" ON "community_posts_comment_conversations"("post_id");

-- CreateIndex
CREATE INDEX "idx_comments_author" ON "community_posts_comments"("author_id");

-- CreateIndex
CREATE INDEX "idx_comments_conversation" ON "community_posts_comments"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_review_contribution_id" ON "community_posts_enrichment_reviews"("contribution_id");

-- CreateIndex
CREATE INDEX "idx_review_status" ON "community_posts_enrichment_reviews"("status");

-- CreateIndex
CREATE INDEX "idx_review_user_id" ON "community_posts_enrichment_reviews"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_contribution_user" ON "community_posts_enrichment_reviews"("contribution_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_contribution_post_id" ON "community_posts_enrichments"("post_id");

-- CreateIndex
CREATE INDEX "idx_contribution_status" ON "community_posts_enrichments"("status");

-- CreateIndex
CREATE INDEX "idx_contribution_user_id" ON "community_posts_enrichments"("user_id");

-- CreateIndex
CREATE INDEX "idx_reviews_post" ON "community_posts_reviews"("post_id");

-- CreateIndex
CREATE INDEX "idx_reviews_reviewer" ON "community_posts_reviews"("reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_presentation_community_id_key" ON "community_presentation"("community_id");

-- CreateIndex
CREATE INDEX "idx_qa_answers_author" ON "community_qa_answers"("author_id");

-- CreateIndex
CREATE INDEX "idx_qa_answers_question" ON "community_qa_answers"("question_id");

-- CreateIndex
CREATE INDEX "idx_qa_questions_author" ON "community_qa_questions"("author_id");

-- CreateIndex
CREATE INDEX "idx_qa_questions_community" ON "community_qa_questions"("community_id");

-- CreateIndex
CREATE INDEX "idx_qa_questions_post" ON "community_qa_questions"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "username_unique" ON "user"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "email_unique" ON "user"("email");

-- AddForeignKey
ALTER TABLE "community" ADD CONSTRAINT "fk_community_category" FOREIGN KEY ("category_id") REFERENCES "community_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community" ADD CONSTRAINT "fk_community_creator" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_bans" ADD CONSTRAINT "fk_community_bans_community" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_bans" ADD CONSTRAINT "fk_community_bans_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_channels" ADD CONSTRAINT "community_channels_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_contributors" ADD CONSTRAINT "community_contributors_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_contributors" ADD CONSTRAINT "community_contributors_user_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_contributors_requests" ADD CONSTRAINT "community_contributors_requests_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_learners" ADD CONSTRAINT "community_learners_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_learners" ADD CONSTRAINT "community_learners_user_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_tag_category" FOREIGN KEY ("tag") REFERENCES "community_posts_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_category" ADD CONSTRAINT "community_posts_category_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_comment_conversations" ADD CONSTRAINT "fk_conversation_post" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_comments" ADD CONSTRAINT "fk_comment_author" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_comments" ADD CONSTRAINT "fk_comment_conversation" FOREIGN KEY ("conversation_id") REFERENCES "community_posts_comment_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_enrichment_reviews" ADD CONSTRAINT "fk_review_contribution" FOREIGN KEY ("contribution_id") REFERENCES "community_posts_enrichments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_enrichment_reviews" ADD CONSTRAINT "fk_review_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_enrichments" ADD CONSTRAINT "fk_contribution_post" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_enrichments" ADD CONSTRAINT "fk_contribution_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_reviews" ADD CONSTRAINT "fk_reviews_post" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts_reviews" ADD CONSTRAINT "fk_reviews_reviewer" FOREIGN KEY ("reviewer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_presentation" ADD CONSTRAINT "community_presentation_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_qa_answers" ADD CONSTRAINT "community_qa_answers_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_qa_answers" ADD CONSTRAINT "community_qa_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "community_qa_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_qa_questions" ADD CONSTRAINT "community_qa_questions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_qa_questions" ADD CONSTRAINT "community_qa_questions_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_qa_questions" ADD CONSTRAINT "fk_question_post" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

