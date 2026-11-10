import babel from "rollup-plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
//import typescript from '@rollup/plugin-typescript';
import path from "path";

const PACKAGE_ROOT_PATH = process.cwd();
const PKG_JSON = require(path.join(PACKAGE_ROOT_PATH, "package.json"));

export default {
    input: "src/hello-pie.ts",
    output: {
        file: "dist/" + PKG_JSON.name + ".js",
        format: "iife",
        name: "index",
        sourcemap: true
    },
    plugins: [
        nodeResolve({
            mainFields: ['jsnext']
        }),
        //typescript({lib: ["es5", "es6", "dom"], target: "es5"}),
        babel({
            exclude: "node_modules/**",
            extensions: [".ts", ".js"]
        })
    ]
};
