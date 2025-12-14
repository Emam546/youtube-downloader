import packageJson from "../package.json";
import esbuild from "esbuild";

import path from "path";
import fs from "fs";

const folderPath = path.join(__dirname, "../out/scripts");

const folders = ["youtube", "link", "Local", "facebook", "ytdlp"];

export const order = {
  apps: {
    facebook: 3,
    youtube: 2,
    local: 1,
    link: -1,
    custom: -1000,
  },
  appVersion: packageJson.version,
  version: "v1.0.2",
};
async function Process() {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  await Promise.all(
    folders.map((val) => {
      return esbuild.build({
        entryPoints: [path.join(__dirname, `../scripts/${val}/index.ts`)],
        outdir: path.join(folderPath, val),
        bundle: true,
        minify: false,
        sourcemap: false,
        platform: "node",
        format: "cjs",
        tsconfig: "./tsconfig.json",
        define: {
          "import.meta.url": JSON.stringify(`file://index.js`),
        },
      });
    })
  );
  fs.writeFileSync(path.join(folderPath, "order.json"), JSON.stringify(order));
}
Process();
