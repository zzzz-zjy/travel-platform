// Vercel build script - swaps provider to postgresql before building
const fs = require("fs");
const schema = "prisma/schema.prisma";
let content = fs.readFileSync(schema, "utf8");
content = content.replace('provider = "sqlite"', 'provider = "postgresql"');
fs.writeFileSync(schema, content);
console.log("Swapped provider to postgresql for Vercel build");
