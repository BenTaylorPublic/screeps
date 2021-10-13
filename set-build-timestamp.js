const fs = require("fs");
const buildTimestamp = new Date().toISOString().slice(0, 19);
console.log("Built at: " + buildTimestamp);
let script = fs.readFileSync("./dist/main.js", "utf8");
script = script.replaceAll("%%BUILDTIME%%", buildTimestamp);
fs.writeFileSync("./dist/main.js", script);