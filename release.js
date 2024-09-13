const publishRelease = require("publish-release");
const fs = require("fs");
const path = require("path");
const packageJson = require("./package.json");
function readDir(dir) {
    const result = fs.readdirSync(dir);
    return result
        .filter((file) => {
            const state = fs.statSync(path.join(dir, file));
            if (!state.isFile()) return false;
            return true;
        })
        .map((file) => path.join(dir, file));
}
//https://github.com/Emam546/youtube-downloader/releases/download/v1.1.3/youtube-downloader.Setup.1.1.3.exe
//https://github.com/Emam546/youtube-downloader/releases/download/v1.1.3/youtube-downloader-Setup-1.1.3.exe
const assets = readDir("./dist");
const options = {
    token: process.env.GH_TOKEN,
    owner: packageJson.publish.owner,
    repo: packageJson.publish.repo,
    tag: `v${packageJson.version}`,
    name: `v${packageJson.version}`,
    notes: "",
    draft: true,
    prerelease: false,
    reuseRelease: true,
    reuseDraftOnly: false,
    skipAssetsCheck: false,
    skipDuplicatedAssets: false,
    skipIfPublished: false,
    editRelease: false,
    deleteEmptyTag: false,
    assets: assets,
};

console.log(assets);
publishRelease(options, function (err, release) {
    if (err) return console.error(err);
    console.log("finish Release");
    // `release`: object returned from github about the newly created release
});
