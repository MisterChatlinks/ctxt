import { type Identifier, parse, type Statement } from "acorn";
import { type Node, walk } from "estree-walker";
import * as astring from "astring";
import { isAsyncFunction } from "@utils/types/isOfType";

interface callTrace {
    start: number;
    duration: string;
    label: string;
    arguments: unknown[];
    result: unknown | null;
    error: null | {
        message: string;
    };
}

interface traceDeclaration {
    type: string;
    kind: string;
    declarations: {
        type: string;
        id: Identifier;
        init: {
            type: string;
            callee: {
                type: string;
                name: string;
            };
            arguments: {
                type: string;
                id: any;
                params: any;
                body: any;
                generator: any;
                async: any;
            }[];
        };
    }[];
}

export class Tracer<T, U> {
    constructor(
        private fn: (args: U) => T | Promise<T>,
        // private target: MoniTextEventBus,
        // param: Record<string, unknown>,
    ) {
    }

    protected keywords = {
        useThrow$: "__throw$",
        useTrace$: "__trace$",
        traceDec$: "__traced$",
        fnTracer$: "__fnTracer$",
        makeResult$: "__mkResult$",
        passedArgs$: "__callArgs$",
    };

    protected code!: string;

    public build() {
        const self = this;

        const functionBody = `(${
            this.removeSemiColon(this.fn.toString())
        })(...${this.keywords.passedArgs$})`;

        const runtimeCode = `${
            this.wrapFunctionDeclarationsWith(
                this.wrapFnCallsWith(functionBody),
            )
        }`;

        const runtimeSetup = `
        Function.prototype.${this.keywords.useTrace$} = ${this.keywords.fnTracer$}
        Function.prototype.${this.keywords.useThrow$} = (e)=> { throw new Error(e); }
        ${this.traceWrapperFnBody}
        `;
        const isAsync = isAsyncFunction(this.fn);

        const stack: any[] = [];

        const runtimeContext = {
            [this.keywords.fnTracer$]: this.makeFnTracer(stack),
            [this.keywords.makeResult$]: null,
        };

        const fn = `(${isAsync ? "async" : ""} function (){
                try {                
                    ${runtimeSetup}
                    const result = ${isAsync ? "await" : ""} ${runtimeCode}
                    ${this.keywords.makeResult$}({ ok: true, value: result })
                } catch (e){            
                    console.log(\`[TRACE ERROR (\${e.name})] \${e.message}\`)
                    ${this.keywords.makeResult$}({ ok: false, error: e })
                }
            })()`;
            
        return isAsync
            ? async function (args: U) {
                return await new Promise((resolve) => {
                    //@ts-ignore
                    runtimeContext[self.keywords.makeResult$] = resolve;

                    //@ts-ignore
                    runtimeContext[self.keywords.passedArgs$] = [args];

                    self.runCode(fn, runtimeContext);
                    console.log(JSON.stringify(stack, null, 2));
                }).then((asyncResult) => {
                    return { ...(asyncResult || {}), exec: stack };
                });
            }
            : function (args: U) {
                let syncResult;
                //@ts-ignore
                runtimeContext[self.keywords.passedArgs$] = [args];
                //@ts-ignore
                runtimeContext[self.keywords.makeResult$] = (obj: any) => {
                    syncResult = obj;
                };
                self.runCode(fn, runtimeContext);
                console.log(JSON.stringify(stack, null, 2));
                return { ...(syncResult || {}), exec: stack };
            };
    }

    protected traceWrapperFnBody = `function ${this.keywords.traceDec$}(fn) {
        fn.${this.keywords.useTrace$} = ${this.keywords.fnTracer$}
        fn.${this.keywords.useThrow$} = (e) => { throw new Error(e); }
        return fn;
    }`;

    protected removeSemiColon(fn: string) {
        return fn.trimEnd().replace(/\;$/, "");
    }

    protected runCode = (code: string, context = {}) => {
        const keys = Object.keys(context);
        const values = Object.values(context);
        return new Function(...keys, `"use strict";\n${code}`)(...values);
    };

    protected uuid() {
        return Date.now();
    }

    protected makeFnTracer(stack: callTrace[]) {
        const self = this;
        //@ts-ignore
        return function (name: string | null, fn = this) {
            return function (...args: any[]) {
                //@ts-ignore
                const meta!: callTrace = {};
                stack.push(meta);

                meta.start = Date.now();
                meta.label = name || fn?.name || fn.toString();
                meta.arguments = args;

                try {
                    //@ts-ignore
                    const res = fn.apply(this, args);
                    meta.result = res;
                    meta.duration = `${
                        (Date.now() - meta.start).toFixed(2)
                    } ms`;
                    return res;
                } catch (e) {
                    meta.error = {
                        message: `Tracing ${(e as Error)?.name} ${
                            (e as Error)?.message
                        }`,
                    };
                    meta.duration = `${
                        (Date.now() - meta.start).toFixed(2)
                    } ms`;
                    fn[self.keywords.useThrow$](e); // to throw back inside the vm/sandbox;
                }
            };
        };
    }

    /**
     * Rewrites top-level function declarations and arrow function assignments
     * into traced(fn) calls.
     */
    protected wrapFunctionDeclarationsWith(code: string): string {
        const self = this;

        const ast = parse(code, {
            ecmaVersion: 2022,
            sourceType: "module",
        });

        const replacements: { node: Node; replacement: traceDeclaration }[] =
            [];

        walk(ast as Node, {
            enter(node, parent) {
                // Handle: const fn = (...) => { ... }
                if (
                    node.type === "VariableDeclarator" &&
                    (node.init?.type === "ArrowFunctionExpression" ||
                        node.init?.type === "FunctionExpression")
                ) {
                    (node as any).init = {
                        type: "CallExpression",
                        callee: {
                            type: "Identifier",
                            name: self.keywords.traceDec$,
                        },
                        arguments: [node.init],
                    };
                }

                // Handle: function fn(...) { ... }
                if (
                    node.type === "FunctionDeclaration" &&
                    parent?.type === "Program"
                ) {
                    const { id, params, body, generator, async } = node;

                    const fnExpr = {
                        type: "FunctionExpression",
                        id,
                        params,
                        body,
                        generator,
                        async,
                    };

                    const tracedDecl = {
                        type: "VariableDeclaration",
                        kind: "const",
                        declarations: [{
                            type: "VariableDeclarator",
                            id,
                            init: {
                                type: "CallExpression",
                                callee: {
                                    type: "Identifier",
                                    name: self.keywords.useTrace$,
                                },
                                arguments: [fnExpr],
                            },
                        }],
                    };

                    // Queue a top-level replacement
                    //@ts-ignore
                    replacements.push({ node, replacement: tracedDecl });
                }
            },
        });

        // Manually apply replacements for top-level FunctionDeclarations
        for (const { node, replacement } of replacements) {
            const index = ast.body.indexOf(node as Statement);
            if (index !== -1) {
                ast.body.splice(index, 1, replacement as Statement);
            }
        }

        return astring.generate(ast);
    }

    protected wrapFnCallsWith(code: string) {
        const self = this;

        const ast = parse(code, {
            ecmaVersion: 2022,
            sourceType: "module",
        }) as Node;

        // ⚙️ Transform: wrap simple `fn()` calls into `fn.trace$()()`
        walk(ast, {
            enter(node, _parent) {
                if (
                    node.type === "CallExpression" &&
                    node.callee.type === "Identifier"
                ) {
                    const origCallee = node.callee;

                    node.callee = {
                        type: "CallExpression",
                        callee: {
                            type: "MemberExpression",
                            object: origCallee,
                            property: {
                                type: "Identifier",
                                name: self.keywords.useTrace$,
                            },
                            computed: false,
                            optional: false,
                        },
                        arguments: [
                            {
                                type: "Literal",
                                value: origCallee?.name ? "string" : "null",
                                raw: origCallee?.name
                                    ? `"${origCallee?.name}"`
                                    : undefined,
                            },
                        ],
                        optional: false,
                    };
                }
            },
        });

        return astring.generate(ast);
    }
}

// const test = new Tracer(function ({ a, b }: { a: number; b: number }) {
//     const t = function (c: number, b: number) {
//         return c.toPrecision(1) + b;
//     };

//     t(t(a, b), t(a, b));

//     return a + b;
// }).build();

// const { ok, exec } = test({ a: 7, b: 8 })

// monitext.error("Runtime error").context({ ok, exec });


// console.log("hiiii from outside")
