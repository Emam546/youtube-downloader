const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const folderPath = path.join(__dirname, "../out/scripts");
const folders = ["youtube", "link", "Local"];
if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
folders.forEach((val) => {
  esbuild
    .build({
      entryPoints: [path.join(__dirname, `../scripts/${val}/index.ts`)],
      outdir: path.join(folderPath, val),
      bundle: true,
      minify: true,
      platform: "node",
      target: "esnext",
      sourcemap: true,
      tsconfig: "./tsconfig.json",
    })
    .catch(() => process.exit(1));
});
const order = {
  apps: {
    youtube: 1,
    local: 0,
    link: -1000,
  },
  version: "v0.0.10",
};

fs.writeFileSync(path.join(folderPath, "order.json"), JSON.stringify(order));
