const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const prismaDir = path.resolve("./prisma");
const basePath = path.join(prismaDir, "schema.base.prisma");
const enumsPath = path.join(prismaDir, "enums.prisma");
const outPath = path.join(prismaDir, "schema.prisma");

for (const file of [basePath, enumsPath]) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
}

const enums = fs.readFileSync(enumsPath, "utf-8");
const base = fs.readFileSync(basePath, "utf-8");

fs.writeFileSync(outPath, `${enums}\n\n${base}`);

try {
  execSync("npx prisma format", { stdio: "inherit", cwd: path.resolve(".") });
  execSync("npx prisma validate", { stdio: "inherit", cwd: path.resolve(".") });
  console.log(
    "✅ Prisma schema merged, formatted, and validated successfully!",
  );
} catch (err) {
  console.error(
    "❌ Merged schema failed validation — check schema.prisma for errors.",
  );
  process.exit(1);
}
