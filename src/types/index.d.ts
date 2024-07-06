import {
    ApiMain as Api,
    ApiRender as OrgApiRender,
    Context,
} from "@shared/main";

declare global {
    namespace ApiMain {
        interface OnMethods extends Api.OnMethods {}
        interface OnceMethods extends Api.OnceMethods {}
        interface HandleMethods extends Api.HandleMethods {}
        interface HandleOnceMethods extends Api.HandleOnceMethods {}
        namespace Render {
            interface OnMethods extends OrgApiRender.OnMethods {}
            interface OnceMethods extends OrgApiRender.OnceMethods {}
        }
    }
    interface Window {
        context: Context;
    }
}
