import * as Youtube from "@scripts/youtube";
import * as facebook from "@scripts/facebook";
import * as link from "@scripts/link";
import * as ytdlp from "@scripts/ytdlp";
import { PluginType } from "@scripts/plugins";
export const Plugins = [facebook, Youtube, link, ytdlp] as PluginType[];
