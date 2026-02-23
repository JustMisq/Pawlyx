-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "billingInterval" TEXT NOT NULL DEFAULT 'monthly',
ALTER COLUMN "plan" SET DEFAULT 'starter';
