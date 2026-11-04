import os from "node:os";

export function sendReceiptEmail() {
  return os.hostname();
}

export const checksumAlgorithm = "SHA256";
