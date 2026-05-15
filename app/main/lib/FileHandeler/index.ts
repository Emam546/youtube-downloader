import { protocol } from "electron";
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
    const requestedPath = req.url.slice(`${protocolName}://`.length);
    callback({
      path: decodeURI(requestedPath),
    });
  });
}
