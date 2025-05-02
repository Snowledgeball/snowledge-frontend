-- CreateTable
CREATE TABLE "test_field" (
    "id" SERIAL NOT NULL,
    "test_field" TEXT DEFAULT 'test',

    CONSTRAINT "test_field_pkey" PRIMARY KEY ("id")
);
