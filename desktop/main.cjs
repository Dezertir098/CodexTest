const {
  app,
  BrowserWindow,
  Menu,
  protocol,
  net,
  shell,
  dialog,
  nativeTheme,
} = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { resolveAsset, externalURL } = require("./security.cjs");

// A stable, secure origin keeps storage independent of the portable EXE's
// temporary extraction folder. Only this application's bundled files are served.
protocol.registerSchemesAsPrivileged([
  {
    scheme: "study",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);
app.setName("Путь к ЕГЭ");
const testProfile = app.commandLine.getSwitchValue("user-data-dir");
app.setPath(
  "userData",
  testProfile || path.join(app.getPath("appData"), "PutKEGE"),
);
const acquiredLock = app.requestSingleInstanceLock();
if (!acquiredLock) app.quit();
let window;
app.on("second-instance", () => {
  if (!window) return;
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
});

function openExternal(url) {
  const safe = externalURL(url);
  if (safe) void shell.openExternal(safe).catch(() => {});
}

async function start() {
  await app.whenReady();
  nativeTheme.themeSource = "dark";
  const assets = path.join(app.getAppPath(), "dist");
  protocol.handle("study", async (request) => {
    const file = resolveAsset(assets, request.url);
    if (!file) return new Response("Not found", { status: 404 });
    // Core lessons never need a server. The optional web tutor is not bundled
    // or started silently by this desktop app.
    if (new URL(request.url).pathname === "/api/tutor") {
      return new Response(
        JSON.stringify({
          error: "Tutor is not configured in this offline desktop edition",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    try {
      const response = await net.fetch(pathToFileURL(file).toString());
      const headers = new Headers(response.headers);
      headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-src 'none'; form-action 'none'",
      );
      return new Response(response.body, { status: response.status, headers });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });
  Menu.setApplicationMenu(null);
  window = new BrowserWindow({
    width: 1320,
    height: 920,
    minWidth: 800,
    minHeight: 600,
    title: "Путь к ЕГЭ",
    backgroundColor: "#12121d",
    show: false,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged,
    },
  });
  window.webContents.session.setPermissionRequestHandler(
    (_contents, _permission, callback) => callback(false),
  );
  window.webContents.session.setPermissionCheckHandler(() => false);
  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    // Internal navigation uses hash routes and does not navigate the document.
    if (url.split(/[?#]/)[0] !== "study://app/index.html") {
      event.preventDefault();
      openExternal(url);
    }
  });
  window.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  window.once("ready-to-show", () => window.show());
  window.on("closed", () => {
    window = null;
  });
  await window.loadURL("study://app/index.html");
}
app.on("window-all-closed", () => app.quit());
if (acquiredLock)
  start().catch((error) => {
    dialog.showErrorBox("Не удалось открыть Путь к ЕГЭ", error.message);
    app.exit(1);
  });
