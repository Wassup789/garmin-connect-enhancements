import * as fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { version, description } = require("../package.json");

const filePath = "./build/app.js",
    outDir = "./dist/browser",
    outPath = `${outDir}/app.js`;

const filesToCopy = [
    ["./build/app.js", path.join(outDir, "app.js")],
    ["./build/browser-inject.js", path.join(outDir, "content-script.js")],
    ["./assets/logo-16.png", path.join(outDir, "logo-16.png")],
    ["./assets/logo-32.png", path.join(outDir, "logo-32.png")],
    ["./assets/logo-48.png", path.join(outDir, "logo-48.png")],
    ["./assets/logo-128.png", path.join(outDir, "logo-128.png")],
];

async function run() {
    const manifestContent = (await fs.readFile("./templates/browser/manifest.json", "utf8"))
        .replace("[VERSION]", JSON.stringify(version))
        .replace("[DESCRIPTION]", JSON.stringify(description));
    await fs.mkdir(outDir, { recursive: true });

    await fs.writeFile(path.join(outDir, "manifest.json"), manifestContent, "utf-8");

    for (const [source, output] of filesToCopy) {
        await fs.writeFile(output, await fs.readFile(source));
    }

    console.log(`Browser extension contents updated at ${outDir}`);
}

run();
