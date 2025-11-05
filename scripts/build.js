const packageJson = require("../package.json");
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const folderPath = path.join(__dirname, "../out/scripts");
const folders = ["youtube", "link", "Local", "facebook", "ytdlp"];
if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
folders.forEach((val) => {
  esbuild
    .build({
      entryPoints: [path.join(__dirname, `../scripts/${val}/index.ts`)],
      outdir: path.join(folderPath, val),
      bundle: true,
      minify: true,
      sourcemap: false,
      platform: "node",
      // format:"cjs",
      tsconfig: "./tsconfig.json",
      external: ["ytdlp-nodejs"],
    })
    .catch(() => process.exit(1));
});
const order = {
  apps: {
    facebook: 3,
    youtube: 2,
    local: 1,
    link: -1,
    custom: -1000,
  },
  appVersion: packageJson.version,
  version: "v0.0.12",
};

fs.writeFileSync(path.join(folderPath, "order.json"), JSON.stringify(order));
