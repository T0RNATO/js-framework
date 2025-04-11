import type {Plugin} from "vite";
import {Parser as Acorn, type Node, type CallExpression, type VariableDeclarator} from "acorn";
import tsPlugin from 'acorn-typescript'
// @ts-ignore
import {traverse} from "estraverse";
import {err} from "./utils.ts";

const Parser = Acorn.extend(tsPlugin({jsx: {}}) as never);

const nonReactiveNodes = ["FunctionExpression", "JSXEmptyExpression", "ArrowFunctionExpression"]

export default {
    name: "framework",
    enforce: "pre",
    transform(code, path) {
        if (path.endsWith('.tsx')) {
            const ast = Parser.parse(code, {ecmaVersion: "latest", sourceType: "module", locations: true});

            const ranges: [number, number][] = [];

            let refsName: string | null = null;

            traverse(ast, {
                enter(node: Node, parent: Node) {
                    // todo: make more efficient by skipping irrelevant nodes with `this.skip()` and allow for refs named other than $
                    if (node.type === "CallExpression" && (node as CallExpression).callee?.name === "refs") {
                        const declaration = (parent as VariableDeclarator).id;
                        if (!declaration || !("name" in declaration)) {
                            throw err(`'refs' may only be called in a variable declaration like \`const $ = refs({foo: 5});\` @ ${path}:${node.loc!.start.line}`)
                        }
                        if (refsName) {
                            throw err(`'refs' may only be called once per component @ ${path}:${node.loc!.start.line}`)
                        }
                        refsName = declaration.name;
                    }

                    if (node.type === "JSXExpressionContainer" &&
                        (!nonReactiveNodes.includes((node as Node & {expression: Node}).expression.type)) &&
                        code.slice(node.start, node.end).includes(refsName + ".")
                    ) {
                        ranges.push([node.start + 1, node.end - 1]);
                    }
                },
                fallback: 'iteration'
            });

            if (!ranges.length || !refsName) {
                return;
            }

            let prevIndex = 0;
            let out = "";

            const depMatcher = new RegExp(escape(refsName) + '\\.(\\w+)', 'g');

            for (const [start, end] of ranges) {
                out += code.slice(prevIndex, start);
                prevIndex = end;
                const original = code.slice(start, end);
                out += `new $Computed(() => ${original}, ${refsName}, ${
                    JSON.stringify(Array.from(original.matchAll(depMatcher))
                        .map(m => m[1]) || []
                    )
                })`
            }
            out += code.slice(ranges.at(-1)![1]);

            return {
                code: "import {$Computed} from '~/framework/reactivity';" + out,
                map: null,
            }
        }
    }
} satisfies Plugin;

function escape(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}