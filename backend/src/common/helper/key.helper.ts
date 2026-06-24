import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");

export function encryptKey(text: string) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptKey(encryptedText: string) {
  if (!encryptedText.includes(":")) {
    throw new Error("Invalid encrypted format");
  }

  const [ivHex, encryptedHex] = encryptedText.split(":");

  // ✅ Validate IV length
  if (!ivHex || ivHex.length !== 32) {
    throw new Error("Invalid IV length");
  }

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export const hashKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");
