-- CreateTable
CREATE TABLE "rate_limits" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_ip_date_key" ON "rate_limits"("ip", "date");
