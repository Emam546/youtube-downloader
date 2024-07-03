import { convertFunc } from "@utils/app";
import { Api } from "@shared/renderer/progress";
export function convertProgressFunc<
    Key extends keyof (Api.HandleMethods &
        Api.OnMethods &
        Api.HandleOnceMethods &
        Api.OnceMethods)
>(name: Key) {
    return convertFunc(name, "progress");
}
