import {BuildOptions, defineConfig} from "vite";
import minifyHTML from "rollup-plugin-minify-html-literals";

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
    const rollupOptions: BuildOptions["rollupOptions"] = {
        input: {
            "app": "src/app.ts",
            "browser-inject": "src/browser/inject.ts",
        },
        output: {
            entryFileNames: `[name].js`,
        }
    };

    if (mode === "production") {
        return {
            plugins: [
                minifyHTML.default()
            ],
            build: {
                outDir: "build",
                rollupOptions: rollupOptions
            }
        };
    } else {
        return {
            build: {
                minify: false,
                outDir: "build",
                rollupOptions: rollupOptions
            }
        };
    }
});
