-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_guides" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "destination_city_id" INTEGER NOT NULL,
    "total_days" INTEGER NOT NULL,
    "budget_amount" INTEGER NOT NULL,
    "transport_mode" TEXT NOT NULL,
    "travel_style" TEXT NOT NULL,
    "raw_json" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "creator_ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "guides_destination_city_id_fkey" FOREIGN KEY ("destination_city_id") REFERENCES "cities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_guides" ("budget_amount", "created_at", "destination_city_id", "id", "raw_json", "title", "total_days", "transport_mode", "travel_style", "updated_at") SELECT "budget_amount", "created_at", "destination_city_id", "id", "raw_json", "title", "total_days", "transport_mode", "travel_style", "updated_at" FROM "guides";
DROP TABLE "guides";
ALTER TABLE "new_guides" RENAME TO "guides";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
