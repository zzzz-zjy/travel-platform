import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const client = createClient({
  url: "https://travel-platform-zzzz-zjy.aws-ap-northeast-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODAzODk5MTMsImlkIjoiMDE5ZTg3ODEtNTIwMS03ZDNmLTllZjQtNzA0YmU1ODg0ZTM5IiwicmlkIjoiZjM0N2NmYTctOGQ4YS00OGZlLTk0YTMtOGNhZmFhOWQ2YjUyIn0.9ZFNUECAP-3zU4iLzQSKw-v1LW86WEJfRz0ki6r3xLX3icYKemqmqmnZ49YQ6S4SBRZfkh6_88gDdfHELQSlBw",
});

const raw = readFileSync(new URL("./schema.sql", import.meta.url), "utf-8");

// Strip Prisma CLI noise and comments, then extract pure SQL by semicolons
const cleaned = raw
  .split("\n")
  .filter((l) => !l.trim().startsWith("◇") && !l.trim().startsWith("Loaded"))
  .join("\n");

const statements = cleaned
  .split(";")
  .map((s) => {
    // Remove -- comment lines and trim
    return s
      .split("\n")
      .filter((l) => !l.trim().startsWith("--"))
      .join("\n")
      .trim();
  })
  .filter((s) => s.length > 0);

console.log(`Executing ${statements.length} statements...`);

for (let i = 0; i < statements.length; i++) {
  try {
    await client.execute(statements[i] + ";");
    process.stdout.write(".");
  } catch (e) {
    if (e.message.includes("already exists")) {
      process.stdout.write("s");
    } else {
      console.error(`\nFailed at statement ${i + 1}: ${statements[i].substring(0, 120)}`);
      console.error(e.cause || e.message);
      process.exit(1);
    }
  }
}

console.log("\nSchema pushed successfully!");
await client.close();
