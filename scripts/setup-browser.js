import * as fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { version, description } = require("../package.json");

const filePath = "./build/app.js",
    outDir = "./dist/browser",
    outPath = `${outDir}/app.js`;

/**
 * @type {[string, string][]}
 */
const baseFilesToCopy = [
    ["./build/app.js", "app.js"],
    ["./build/browser-inject.js", "content-script.js"],
    ["./assets/logo-16.png", "logo-16.png"],
    ["./assets/logo-32.png", "logo-32.png"],
    ["./assets/logo-48.png", "logo-48.png"],
    ["./assets/logo-128.png", "logo-128.png"],
];

/**
 * @param {string} directory
 */
async function createEmptyDirectory(directory) {
    await fs.mkdir(directory, { recursive: true });

    for (const existingFile of await fs.readdir(directory)) {
        await fs.unlink(path.join(directory, existingFile));
    }
}

/**
 * @param {"chrome"|"gecko"} target
 * @param {string} targetDir
 * @param {string} rawManifest
 */
async function writeManifestForTarget(target, targetDir, rawManifest) {
    const manifestData = JSON.parse(rawManifest);

    manifestData["version"] = version;
    manifestData["description"] = description;

    if (target === "chrome") {
        delete manifestData["browser_specific_settings"];
    }

    await fs.writeFile(path.join(targetDir, "manifest.json"), JSON.stringify(manifestData, null, 2), "utf-8");
}

/**
 * @param {string} targetDir
 */
async function copyFilesToDirectory(targetDir) {
    const filesToCopy = baseFilesToCopy.map((e) => [e[0], path.join(targetDir, e[1])]);
    for (const [source, output] of filesToCopy) {
        await fs.writeFile(output, await fs.readFile(source));
    }
}

/**
 * @param {"chrome"|"gecko"} target
 * @param {string} rawManifest
 */
async function packageForTarget(target, rawManifest) {
    const baseDir = path.join(outDir, target);

    await createEmptyDirectory(baseDir);
    await writeManifestForTarget(target, baseDir, rawManifest);
    await copyFilesToDirectory(baseDir);
}

async function run() {
    const rawManifest = await fs.readFile("./templates/browser/manifest.json", "utf8");

    console.log("Packaging for chrome...");
    await packageForTarget("chrome", rawManifest);

    console.log("Packaging for gecko...");
    await packageForTarget("gecko", rawManifest);

    console.log();
    console.log(`Browser extension contents updated at ${outDir}`);
}

run();
