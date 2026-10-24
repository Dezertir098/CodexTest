const path = require("node:path");
function resolveAsset(root, value) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "study:" ||
      url.hostname !== "app" ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes("\\") || pathname.includes("\0")) return null;
    const resolved = path.resolve(root, "." + pathname);
    const relative = path.relative(root, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
    return resolved;
  } catch {
    return null;
  }
}
function externalURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
module.exports = { resolveAsset, externalURL };
