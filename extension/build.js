const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const extensionDir = path.join(process.cwd(), "extension");
const distDir = path.join(process.cwd(), "dist", "extension");

const staticFiles = ["./build.js", "./manifest.json", "./icon.png"];

async function bundleExtensionScripts() {
  await esbuild.build({
    entryPoints: [
      path.join(extensionDir, "src", "background.ts"),
      path.join(extensionDir, "src", "content-script", "index.ts"),
    ],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["chrome109"],
    minify: false,
    outdir: extensionDir,
    entryNames: "[name]",
  });

  fs.copyFileSync(path.join(extensionDir, "index.js"), path.join(extensionDir, "content-script.js"));
  fs.rmSync(path.join(extensionDir, "index.js"));
}

async function build() {
  await bundleExtensionScripts();

  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  [...staticFiles, "./background.js", "./content-script.js"].forEach((element) => {
    fs.copyFileSync(
      path.join("./extension", element),
      path.join("./dist/extension/", element),
    );
  });

  console.log("Extension scripts compiled and copied.");
}

build().catch(console.error);
