-- CreateEnum
CREATE TYPE "EstimateSource" AS ENUM ('manual', 'photo');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('draft', 'submitted');

-- CreateEnum
CREATE TYPE "JudgementStatus" AS ENUM ('queued', 'done', 'failed');

-- CreateEnum
CREATE TYPE "ResultLabel" AS ENUM ('FAIR', 'CAUTION', 'EXCESSIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate_no" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "car_id" TEXT,
    "source" "EstimateSource" NOT NULL DEFAULT 'manual',
    "status" "EstimateStatus" NOT NULL DEFAULT 'draft',
    "shop_name" TEXT,
    "total_amount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_items" (
    "id" TEXT NOT NULL,
    "estimate_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "labor_cost" INTEGER NOT NULL DEFAULT 0,
    "parts_cost" INTEGER NOT NULL DEFAULT 0,
    "total_cost" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estimate_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judgements" (
    "id" TEXT NOT NULL,
    "estimate_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "JudgementStatus" NOT NULL DEFAULT 'queued',
    "result_label" "ResultLabel",
    "confidence" DOUBLE PRECISION,
    "overall_score" INTEGER,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judgements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judgement_items" (
    "id" TEXT NOT NULL,
    "judgement_id" TEXT NOT NULL,
    "estimate_item_id" TEXT NOT NULL,
    "fair_min" INTEGER NOT NULL,
    "fair_max" INTEGER NOT NULL,
    "my_price" INTEGER NOT NULL,
    "position_pct" DOUBLE PRECISION NOT NULL,
    "result_label" "ResultLabel" NOT NULL,
    "reason_tags" TEXT[],
    "notes" TEXT,

    CONSTRAINT "judgement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "judgement_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "car_profiles" ADD CONSTRAINT "car_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "car_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judgements" ADD CONSTRAINT "judgements_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judgement_items" ADD CONSTRAINT "judgement_items_judgement_id_fkey" FOREIGN KEY ("judgement_id") REFERENCES "judgements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judgement_items" ADD CONSTRAINT "judgement_items_estimate_item_id_fkey" FOREIGN KEY ("estimate_item_id") REFERENCES "estimate_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_judgement_id_fkey" FOREIGN KEY ("judgement_id") REFERENCES "judgements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
