const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const folderPath = "/out/scripts";
const folders = ["youtube", "link"];
if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
folders.forEach((val) => {
  esbuild
    .build({
      entryPoints: [`/scripts/${val}/index.ts`],
      outdir: `/out/scripts/${val}`,
      bundle: true,
      minify: true,
      platform: "node",
      target: "esnext",
      sourcemap: true,
      tsconfig: "./tsconfig.json",
    })
    .catch(() => process.exit(1));
});
const order = { apps: ["youtube", "link"], version: "v0.0.0" };

fs.writeFileSync(path.join(folderPath, "order.json"), JSON.stringify(order));
