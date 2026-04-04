import crypto from "crypto"

const keyHex = process.env.PAYFAST_ENCRYPTION_KEY
if (!keyHex) {
  throw new Error("PAYFAST_ENCRYPTION_KEY is not configured")
}

const key = Buffer.from(keyHex, "hex")
if (key.length !== 32) {
  throw new Error("PAYFAST_ENCRYPTION_KEY must be a 32-byte hex string")
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`
}

export function decrypt(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(":")
  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted text format")
  }

  const iv = Buffer.from(ivHex, "hex")
  const encryptedData = Buffer.from(encryptedHex, "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])
  return decrypted.toString("utf8")
}
