const esbuild = require("esbuild");
const fs = require("fs");
const folders = ["youtube", "link"];
folders.forEach((val) => {
  esbuild
    .build({
      entryPoints: [`./scripts/${val}/index.ts`],
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
const order = ["youtube", "link"];

fs.writeFileSync("./out/scripts/order.json", JSON.stringify(order));
