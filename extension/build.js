const fs = require("fs");
const path = require("path");
const files = [
  "./build.js",
  "./manifest.json",
  "./icon.png",
  "./background.js",
];
const dir = path.join(process.cwd(), "dist", "extension");
async function build() {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  files.forEach((element) => {
    fs.copyFileSync(
      path.join("./extension", element),
      path.join("./dist/extension/", element),
    );
  });

  console.log("Extension built as .crx");
}

build().catch(console.error);
