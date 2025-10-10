import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "schema"),
  migrations: { path: path.join(__dirname, "migrations") },
});
