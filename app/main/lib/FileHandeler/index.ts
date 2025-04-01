import { protocol, net } from "electron";
import path from "path";
import url from "node:url";
const protocolName = "video";
protocol.registerSchemesAsPrivileged([
  {
    scheme: protocolName,
    privileges: {
      bypassCSP: true,
      stream: true,
    },
  },
]);
export function fileHandler() {
  protocol.registerFileProtocol(protocolName, (req, callback) => {
    let requestedPath = req.url.slice(`${protocolName}://`.length);
    callback({
      path: decodeURI(requestedPath),
    });
  });
}
