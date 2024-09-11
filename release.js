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
const options = {
    token: process.env.GH_TOKEN,
    owner: packageJson.build.publish.owner,
    repo: packageJson.build.publish.repo,
    tag: `v${packageJson.version}`,
    name: `v${packageJson.version}`,
    notes: "",
    draft: true,
    prerelease: false,
    reuseRelease: true,
    reuseDraftOnly: true,
    skipAssetsCheck: false,
    skipDuplicatedAssets: false,
    skipIfPublished: false,
    editRelease: false,
    deleteEmptyTag: false,
    assets: readDir("./dist"),
};
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
console.log(readDir("./dist"));
publishRelease(options, function (err, release) {
    if (err) return console.error(err);
    console.log("finish Release");
    // `release`: object returned from github about the newly created release
});
// const f = fs.createWriteStream("release.json", "w");
// f.write(
//     JSON.stringify({
//         name: options.name,
//         version: packageJson.version,
//         date: formatDate(new Date()),
//         changelog: "",
//         updateURL: `https://github.com/Emam546/youtube-downloader/releases/download/${options.name}/youtube-downloader-setup-${packageJson.version}-win.exe`,
//     })
// );
// f.close();
