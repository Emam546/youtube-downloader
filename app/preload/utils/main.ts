import { convertFunc, ChangeApiRender } from "@utils/app";

export function convertMainFunc<Key extends string>(name: Key) {
    return convertFunc(name, "main");
}
