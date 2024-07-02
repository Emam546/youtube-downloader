import { IpcRenderer } from "electron";

export function convertFunc<Key extends string, Pre extends string>(
    name: Key,
    preName: Pre
) {
    return `${preName}-${name}`;
}
export function ChangeApiRender(
    renderer: IpcRenderer,
    convFun: (name: string) => string
) {
    const send = renderer.send;
    const invoke = renderer.invoke;
    renderer.send = (channel, ...args) => send(convFun(channel), ...args);
    renderer.invoke = (channel, ...args) => invoke(convFun(channel), ...args);

    return renderer;
}
