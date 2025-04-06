import { defineConfig } from 'vite'
// @ts-ignore
import path from "path";

declare const __dirname: string;

export default defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src"),
        },
    },
    plugins: [
        {
            name: "framework",
            enforce: "pre",
            transform(code, path) {
                if (path.endsWith('.tsx')) {
                    let out = code.replaceAll(/(?<=<[^]+{)([^>]*?\$\.[^$>]*)(?=}[^]*>)/gm,
                        "\$r(\$,() => {return $1})")
                    if (out !== code) {
                        out = "import {$r} from \"~/framework/reactivity.ts\";" + out;
                    }
                    return {
                        code: out,
                        map: null,
                    }
                }
            }
        }
    ]
})