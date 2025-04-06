import type {Plugin} from "vite";
import {Parser as Acorn, type Node} from "acorn";
import tsPlugin from 'acorn-typescript'
// @ts-ignore
import {traverse} from "estraverse";

const Parser = Acorn.extend(tsPlugin({jsx: {}}) as never);

export default {
    name: "framework",
    enforce: "pre",
    transform(code, path) {
        if (path.endsWith('.tsx')) {
            const ast = Parser.parse(code, {ecmaVersion: "latest", sourceType: "module", locations: true});

            const ranges: [number, number][] = [];

            traverse(ast, {
                enter(node: Node) {
                    // todo: make more efficient by skipping irrelevant nodes with `this.skip()` and allow for refs named other than $
                    if (node.type === "JSXExpressionContainer" && code.slice(node.start, node.end).includes("$.")) {
                        ranges.push([node.start + 1, node.end - 1]);
                    }
                },
                fallback: 'iteration'
            });

            if (!ranges.length) {
                return;
            }

            let prevIndex = 0;
            let out = "";

            for (const [start, end] of ranges) {
                out += code.slice(prevIndex, start);
                prevIndex = end;
                const original = code.slice(start, end);
                out += `$r($, () => ${original})`
            }
            out += code.slice(ranges.at(-1)![1], -1);

            return {
                code: "import {$r} from '~/framework/reactivity';" + out,
                map: null,
            }
        }
    }
} satisfies Plugin;