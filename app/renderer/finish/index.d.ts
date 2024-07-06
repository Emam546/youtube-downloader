import {
    ApiRender,
    Api,
    Context,
} from "@shared/renderer/finish";
declare global {
    namespace ApiMain {
        interface OnMethods extends Api.OnMethods {}
        interface OnceMethods extends Api.OnceMethods {}
        interface HandleMethods extends Api.HandleMethods {}
        interface HandleOnceMethods extends Api.HandleOnceMethods {}
        namespace Render {
            interface OnMethods extends ApiRender.OnMethods {}
            interface OnceMethods extends ApiRender.OnceMethods {}
        }
    }
    interface Window {
        context: Context;
    }
}
