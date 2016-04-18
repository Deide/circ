"use strict";
var fs = require("fs");
var semver = require("semver");

var pkg = JSON.parse(fs.readFileSync("./package.json")),
    manifest = JSON.parse(fs.readFileSync("./src/manifest.json"));

const args = process.argv.slice(2);
const version = pkg.version;
let newVersion;

try {
    newVersion = args.reduce((ver, op) => semver.inc(ver, op), version);
} catch (e) {
    console.error(e.stack);
    process.exit(-1);
}

pkg.version = newVersion;
manifest.version = newVersion;
console.info("Bumping version to " + newVersion);
fs.writeFileSync("./package.json", JSON.stringify(pkg, null, 4));
fs.writeFileSync("./src/manifest.json", JSON.stringify(manifest, null, 2));
