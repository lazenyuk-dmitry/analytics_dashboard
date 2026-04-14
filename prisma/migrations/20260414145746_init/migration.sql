-- CreateTable
CREATE TABLE "orders" (
    "id" BIGINT NOT NULL,
    "external_id" TEXT,
    "status" TEXT,
    "total_sum" DECIMAL(12,2),
    "customer_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
