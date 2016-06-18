var rollup = require("rollup");
var json = require("rollup-plugin-json");
var babel = require("rollup-plugin-babel");
var nodeResolve = require("rollup-plugin-node-resolve");
var commonJS = require("rollup-plugin-commonjs");
var uglify = require("rollup-plugin-uglify");
var fs = require("fs");

var main, background, pluginenv;
var mainHTML, manifest, scriptFrame;

function promisify(writeStream) {
    return new Promise((resolve, reject) => {
        writeStream.on("error", err => reject(err));
        writeStream.on("finish", () => resolve());
    });
}

//////////////////
console.info("[Main] Building...");
main = rollup.rollup({
    entry: "src/main.js",
    plugins: [
        nodeResolve({browser: true}),
        commonJS({
            include: "node_modules/**"
        }),
        json({exclude: "node_modules/**"}),
        babel({
            exclude: "node_modules/**"
        }),
        uglify()
    ]
}).then(bundle => {
    bundle.write({
        dest: "dist/main.js",
        format: "iife",
        sourceMap: true
    });
}).then(() => console.info("[Main] Complete!"));

console.info("[Main] Copying main.html...");
mainHTML = promisify(fs.createReadStream("src/main.html").pipe(fs.createWriteStream("dist/main.html")));
console.info("[Main] Copying manifest.json...");
manifest = promisify(fs.createReadStream("src/manifest.json").pipe(fs.createWriteStream("dist/manifest.json")));

//////////////////
console.info("[Background] Building...");
background = rollup.rollup({
    entry: "src/background.js",
    plugins: [ babel() ]
}).then(bundle => {
    bundle.write({
        dest: "dist/background.js",
        format: "iife"
    });
}).then(() => console.info("[Background] Complete!"));

//////////////////
console.info("[Plugin System] Buiding...");
scriptFrame = promisify(fs.createReadStream("src/plugenv/script_frame.html").pipe(fs.createWriteStream("dist/plugenv/script_frame.html")));
// script_init.js
pluginenv = rollup.rollup({
    entry: "src/plugenv/script_init.js",
    plugins: [ babel() ]
}).then(bundle => {
    bundle.write({
        dest: "dist/plugenv/script_init.js",
        format: "iife"
    });
}).then(() => console.info("[Plugin System] Complete!"));

Promise.all([main, background, pluginenv, mainHTML, manifest, scriptFrame])
    .then(() => {
        console.info("[BUILD] Success!");
        //process.exit();
    }).catch(err => {
        console.info("[BUILD] Failed!");
        console.error(err.stack);
        process.exit(-1);
    });

/**
 * TODO: Add CSS copying, minify JS and CSS
 */