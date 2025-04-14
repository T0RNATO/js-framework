import type {Plugin} from "vite";
import {Parser as Acorn} from "acorn";
import type {Node, CallExpression, VariableDeclarator, ArrowFunctionExpression, Identifier, FunctionDeclaration} from "acorn";
import tsPlugin from 'acorn-typescript'
// @ts-ignore
import {traverse} from "estraverse";
import {err} from "./utils.ts";

const Parser = Acorn.extend(tsPlugin({jsx: {}}) as never);

const nonReactiveNodes = ["FunctionExpression", "JSXEmptyExpression", "ArrowFunctionExpression"];
const variableChars = new Set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_1234567890.[]?!");

export default {
    name: "framework",
    enforce: "pre",
    transform(code, path) {
        if (!path.endsWith('.tsx')) return

        const ancestors: Node[] = [];

        const ast = Parser.parse(code, {ecmaVersion: "latest", sourceType: "module", locations: true});

        // [start, end, additionalRefsName]
        const ranges: [number, number, string | null][] = [];

        let refsName: string | null = null;
        let propsName: string | null = null;

        traverse(ast, {
            enter(node: Node, parent: Node) {
                // console.log(node.type);
                ancestors.push(node);
                if (node.type === "CallExpression" && ((node as CallExpression).callee as Identifier).name === "refs") {
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
                    const parentFunc = ancestors.findLast(n => (n.type === "ArrowFunctionExpression" || n.type === "FunctionDeclaration")) as ArrowFunctionExpression | FunctionDeclaration;
                    if (parentFunc.params.length === 1) {
                        propsName = (parentFunc.params[0] as Identifier).name;
                    }
                }

                if (node.type === "JSXExpressionContainer" &&
                    (!nonReactiveNodes.includes((node as Node & { expression: Node }).expression.type))
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
                    const parentFunc = ancestors.findLast(n => (n.type === "ArrowFunctionExpression" || n.type === "FunctionDeclaration")) as ArrowFunctionExpression | FunctionDeclaration;
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

        for (const [start, end, additionalRefsName] of ranges) {
            out += code.slice(prevIndex, start);
            prevIndex = end;
            const original = code.slice(start, end);

            out += `new $Computed(() => ${original}, {${
                parseComputed(original, additionalRefsName ? [refsName, additionalRefsName] : [refsName])
            }})`
        }
        out += code.slice(ranges.at(-1)![1]);

        return {
            code: "import {$Computed} from '~/framework/reactivity';" + out,
            map: null,
        }
    }
} satisfies Plugin;

// function refsToDeps(matches: IterableIterator<RegExpExecArray>, refsName: string): string {
//     return Array.from(matches).map(m => m[1] + `: ${refsName}`).join(',') || '';
// }

function isAt(string: string, subStr: string, index: number): boolean {
    for (let i = 0; i < subStr.length; i++) {
        if (string[i + index] !== subStr[i]) {
            return false;
        }
    }
    return true;
}

function parseComputed(s: string, refsNames: string[]) {
    console.log(s);
    const refsDeps: string[][] = [];
    let refsDep: string[] = [];
    let section = "";
    let foundRef = false;
    for (let i = 0; i < s.length; i++) {
        if (foundRef || refsNames.some(refsName => isAt(s, refsName, i))) {
            foundRef = true;
            const char = s[i];
            if (variableChars.has(char)) {
                if (char === "." || char === "[") {
                    refsDep.push(section);
                    section = "";
                }
                section += char;
            } else {
                refsDep.push(section);
                refsDeps.push(refsDep);
                refsDep = [];
                section = "";
                foundRef = false;
            }
        }
    }
    refsDep.push(section);
    refsDeps.push(refsDep);
    return refsDeps.map(dep => `${stripPropName(dep.at(-1)!)}: ${dep.slice(0, -1).join("")}`).join(",");
}

function stripPropName(prop: string) {
    if (prop.at(-1) === "]") {
        return prop.slice(1,-1);
    }
    return prop.slice(1);
}