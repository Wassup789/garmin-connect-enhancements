import * as fs from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { version, description } = require("../package.json");

const filePath = "./build/app.js",
    outDir = "./dist/userscript",
    outPath = `${outDir}/garmin-connect-enhancements.user.js`;

async function run() {
    const headerText = (await fs.readFile("./templates/userscript/header.txt", "utf8"))
        .replace("[VERSION]", version)
        .replace("[DESCRIPTION]", description);
    await fs.mkdir(outDir, { recursive: true });

    const data = await fs.readFile(filePath, "utf-8");
    const updatedContent = headerText + data;

    await fs.writeFile(outPath, updatedContent, "utf-8");

    console.log(`UserScript header added to ${outPath}`);
}

run();
