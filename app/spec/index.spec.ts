import { DownloadTheFile } from "@app/main/lib/progressBar/downloader";
describe("Test Download function", () => {
    test("Test", async () => {
        const response = await DownloadTheFile(
            "https://file-examples.com/storage/fe0e5e78596682d89b36118/2018/04/file_example_MOV_1920_2_2MB.mov"
        );
        const test = await new Promise((res, rej) => {
            response.on("data", () => res(true));
            response.on("end", () => res(false));
        });
        expect(test).toBe(true);
    });
});
