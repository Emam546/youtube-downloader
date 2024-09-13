import {
    ConvertToIpCHandleMainFunc,
    ConvertToIpCMainFunc,
} from "@shared/api";
import { Api } from "@shared/renderer/finish";
type OnMethodsType = {
    [K in keyof Api.OnMethods]: ConvertToIpCMainFunc<Api.OnMethods[K]>;
};
type OnceMethodsType = {
    [K in keyof Api.OnceMethods]: ConvertToIpCMainFunc<Api.OnceMethods[K]>;
};
type HandelMethodsType = {
    [K in keyof Api.HandleMethods]: ConvertToIpCHandleMainFunc<
        Api.HandleMethods[K]
    >;
};
type HandelOnceMethodsType = {
    [K in keyof Api.HandleOnceMethods]: ConvertToIpCHandleMainFunc<
        Api.HandleOnceMethods[K]
    >;
};
export type FlagType = "w" | "a";
export const OnMethods: OnMethodsType = {};
export const OnceMethods: OnceMethodsType = {};
export const HandleMethods: HandelMethodsType = {};
export const HandleOnceMethod: HandelOnceMethodsType = {};
