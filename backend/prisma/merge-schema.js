const fs = require("fs");
const path = require("path");

const prismaDir = path.resolve("./prisma");
const base = fs.readFileSync(path.join(prismaDir, "schema.base.prisma"), "utf-8");
const enums = fs.readFileSync(path.join(prismaDir, "enums.prisma"), "utf-8");

const merged = `${enums}\n\n${base}`;
fs.writeFileSync(path.join(prismaDir, "schema.prisma"), merged);

console.log("✅ Prisma schema merged successfully!");
