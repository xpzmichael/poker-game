import os from "os";
import qrcode from "qrcode-terminal";

export function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (let iface of Object.values(interfaces)) {
    for (let details of iface) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address;
      }
    }
  }
}

export function showQRCode(url) {
  qrcode.generate(url, { small: true });
}
