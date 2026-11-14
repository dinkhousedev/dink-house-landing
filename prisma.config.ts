import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 reads the connection URL here, not from schema.prisma.
// `prisma generate` doesn't need a URL, so the Docker build works without
// DATABASE_URL (Coolify only injects it at runtime).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
