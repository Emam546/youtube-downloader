const fs = require("fs");
const path = require("path");
const files = [
  "./build.js",
  "./manifest.json",
  "./icon.png",
  "./background.js",
];
async function build() {
  if (!fs.existsSync("dist/extension/")) fs.mkdirSync("dist/extension/");
  files.forEach((element) => {
    fs.copyFileSync(
      path.join("./extension", element),
      path.join("./dist/extension/", element),
    );
  });

  console.log("Extension built as .crx");
}

build().catch(console.error);
