import { rmSync, existsSync } from "fs";

if (existsSync(".next")) {
  rmSync(".next", { recursive: true, force: true });
  console.log("Cleared .next cache");
}
