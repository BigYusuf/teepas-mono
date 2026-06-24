import fs from "fs";
import path from "path";

const INPUT_FILE = path.resolve("./prisma/schema.prisma");
const OUTPUT_FILE = path.resolve("./packages/types/generatedTypes.ts");

function parsePrismaSchema(schema: string) {
  const enums: string[] = [];
  const models: string[] = [];

  // --- Parse Enums ---
  const enumRegex = /enum\s+(\w+)\s*{([^}]+)}/g;
  let match;
  while ((match = enumRegex.exec(schema)) !== null) {
    const enumName = match[1];
    const values = match[2]
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    const tsEnum = `export enum ${enumName} {
${values.map((v) => `  ${v} = "${v}",`).join("\n")}
}

export type ${enumName}Type = keyof typeof ${enumName};

export const ${enumName}Options = Object.entries(${enumName}).map(([label, value]) => ({
  label,
  value,
}));\n`;

    enums.push(tsEnum);
  }

  // --- Parse Models ---
  const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
  while ((match = modelRegex.exec(schema)) !== null) {
    const modelName = match[1];
    const fields = match[2]
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v && !v.startsWith("//"));

    const tsFields = fields
      .map((f) => {
        const parts = f.split(/\s+/);
        const name = parts[0];
        const prismaType = parts[1] || "String";
        const optional = prismaType.endsWith("?");

        let tsType = prismaToTsType(prismaType.replace("?", ""));
        if (optional) tsType += " | null";

        return `  ${name}: ${tsType};`;
      })
      .join("\n");

    const tsInterface = `export interface ${modelName} {
${tsFields}
}\n`;

    models.push(tsInterface);
  }

  return { enums, models };
}

function prismaToTsType(prismaType: string): string {
  switch (prismaType) {
    case "String":
      return "string";
    case "Int":
    case "Float":
    case "Decimal":
      return "number";
    case "Boolean":
      return "boolean";
    case "Json":
      return "JSON";
    case "DateTime":
      return "Date";
    default:
      // Handle enums or custom types
      return prismaType;
  }
}

function generateTypes() {
  const schema = fs.readFileSync(INPUT_FILE, "utf-8");
  const { enums, models } = parsePrismaSchema(schema);

  const result = `// Auto-generated from Prisma schema
// ⚠️ Do not edit directly — run "pnpm generate:types" instead

${enums.join("\n")}
${models.join("\n")}
`;

  fs.writeFileSync(OUTPUT_FILE, result);
  console.log(`✅ Types and Enums generated in: ${OUTPUT_FILE}`);
}

generateTypes();
