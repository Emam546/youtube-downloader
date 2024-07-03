import { IpcRenderer } from "electron";

export function convertFunc<Key extends string, Pre extends string>(
    name: Key,
    preName: Pre
) {
    return `${preName}-${name}`;
}
export function ChangeApiRender<Key extends string>(
    renderer: IpcRenderer,
    convFun: (name: Key) => string
) {
    const send = renderer.send;
    const invoke = renderer.invoke;
    renderer.send = (channel, ...args) => send(convFun(channel as Key), ...args);
    renderer.invoke = (channel, ...args) => invoke(convFun(channel as Key), ...args);

    return renderer;
}
