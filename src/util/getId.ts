export function youtube_parser(url: string) {
    const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
}
function youtube_validate(url: string) {
    const regExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com(?:\S+)?$/;
    const match = url.match(regExp);
    return match && match.length > 0;
}
export function youtube_playlist_parser(url: string) {
    const reg = new RegExp("[&?]list=([a-z0-9_]+)", "i");
    const match = reg.exec(url);

    if (match && match[1].length > 0 && youtube_validate(url)) {
        return match[1];
    } else {
        return false;
    }
}
export async function validVideoId(id:string) {
    const url = "http://img.youtube.com/vi/" + id + "/mqdefault.jpg";
    const { status } = await fetch(url);
    if (status === 404) return false;
    return true;
}

