import type {Plugin} from "vite";
import {Parser as Acorn} from "acorn";
import type {Node, CallExpression, VariableDeclarator, ArrowFunctionExpression, Identifier} from "acorn";
import tsPlugin from 'acorn-typescript'
// @ts-ignore
import {traverse} from "estraverse";
import {err} from "./utils.ts";

const Parser = Acorn.extend(tsPlugin({jsx: {}}) as never);

const nonReactiveNodes = ["FunctionExpression", "JSXEmptyExpression", "ArrowFunctionExpression"];

const ancestors: Node[] = [];

export default {
    name: "framework",
    enforce: "pre",
    transform(code, path) {
        if (path.endsWith('.tsx')) {
            const ast = Parser.parse(code, {ecmaVersion: "latest", sourceType: "module", locations: true});

            // [start, end, additionalRefsName]
            const ranges: [number, number, string | null][] = [];

            let refsName: string | null = null;
            let propsName: string | null = null;

            traverse(ast, {
                enter(node: Node, parent: Node) {
                    ancestors.push(node);
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

                    if ((node.type === "JSXElement" || node.type === "JSXFragment") && (parent.type === "ArrowFunctionExpression" || parent.type === "ReturnStatement")) {
                        const parentFunc = ancestors.findLast(n => n.type === "ArrowFunctionExpression") as ArrowFunctionExpression;
                        if (parentFunc.params.length === 1) {
                            propsName = (parentFunc.params[0] as Identifier).name;
                        }
                    }

                    if (node.type === "JSXExpressionContainer" &&
                        (!nonReactiveNodes.includes((node as Node & {expression: Node}).expression.type))
                    ) {
                        const section = code.slice(node.start, node.end);
                        if (section.includes(refsName + ".") || section.includes(propsName + ".")) {
                            ranges.push([node.start + 1, node.end - 1, propsName]);
                        }
                    }
                },
                leave(node: Node, parent: Node) {
                    ancestors.pop();
                    if ((node.type === "JSXElement" || node.type === "JSXFragment") && (parent.type === "ArrowFunctionExpression" || parent.type === "ReturnStatement")) {
                        const parentFunc = ancestors.findLast(n => n.type === "ArrowFunctionExpression") as ArrowFunctionExpression;
                        if (parentFunc.params.length === 1) {
                            propsName = null;
                        }
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

            for (const [start, end, additionalRefsName] of ranges) {
                out += code.slice(prevIndex, start);
                prevIndex = end;
                const original = code.slice(start, end);
                const refsDeps = original.matchAll(depMatcher);

                if (!additionalRefsName) {
                    out += `new $Computed(() => ${original}, {${
                        matchesToDeps(refsDeps, refsName)
                    }})`
                } else {
                    const propsDeps = original.matchAll(new RegExp(escape(additionalRefsName) + '\\.(\\w+)', 'g'));
                    out += `new $Computed(() => ${original}, {${
                        matchesToDeps(refsDeps, refsName) + matchesToDeps(propsDeps, additionalRefsName)
                    }})`
                }
            }
            out += code.slice(ranges.at(-1)![1]);

            return {
                code: "import {$Computed} from '~/framework/reactivity';" + out,
                map: null,
            }
        }
    }
} satisfies Plugin;

function matchesToDeps(matches: IterableIterator<RegExpExecArray>, refsName: string): string {
    return Array.from(matches).map(m => m[1] + `: ${refsName}`).join(',') || '';
}

function escape(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}