import { getVideoData } from "@scripts/plugins/getVideoData";
import { predictInputString as predictInputStringOrg } from "@scripts/plugins/predictInputString";
import { Plugins } from "@serv/plugins";

export const getData = getVideoData(Plugins);
export const predictInputString = predictInputStringOrg(Plugins);
