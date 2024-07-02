import { convertFunc } from "@utils/app";

export function convertProgressFunc<Key extends string>(name: Key) {
    return convertFunc(name, "progress");
}
