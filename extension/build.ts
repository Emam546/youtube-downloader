import fs from "fs";
import path from "path";
const crx3 = require("crx3");

async function build() {
  if (!fs.existsSync("dist/extension/")) fs.mkdirSync("dist/extension/");
  await crx3([path.join(__dirname, "./manifest.json")], {
    crxPath: "dist/extension/extension.crx",
  });

  console.log("Extension built as .crx");
}

build().catch(console.error);
