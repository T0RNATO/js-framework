import { defineConfig } from 'vite'
// @ts-ignore
import path from "path";
import framework from "./src/framework/vite-plugin"
// import Inspect from "vite-plugin-inspect";

declare const __dirname: string;

export default defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src"),
        },
    },
    plugins: [framework]
})