CREATE TABLE IF NOT EXISTS "FinancialRecord" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "receiptUrl" TEXT,
    "tags" TEXT[],
    "cropId" TEXT,
    "livestockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FinancialRecord_farmId_idx" ON "FinancialRecord"("farmId");
CREATE INDEX "FinancialRecord_type_idx" ON "FinancialRecord"("type");
CREATE INDEX "FinancialRecord_date_idx" ON "FinancialRecord"("date");
