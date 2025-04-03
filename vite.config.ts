import { defineConfig } from 'vite'
import path from "path";
// import Inspect from 'vite-plugin-inspect'

export default defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src"),
        },
    },
    plugins: [
        // Inspect(),
        {
            name: "framework",
            enforce: "pre",
            transform(code, path) {
                if (path.endsWith('.tsx')) {
                    let out = code.replaceAll(/(<.+>(?:.|\n|\r)*{)(.*\$\..*)(}(?:.|\n|\r)*<\/.+>)/gm,
                        "$1\$r(\$,() => {return $2})$3")
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