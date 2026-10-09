// Desktop app: the web build (dist/, built with --mode desktop) served on app://, so that its absolute paths resolve
// as they do on the web. Logs opened from the system ("Open with", double click) are handed to the page.
import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  nativeTheme,
  net,
  protocol,
  shell,
} from "electron";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, "..", "dist");
const ORIGIN = "app://viewer";
const LOG_FILE = /\.(txt|bbl|bfl|cfl|log)$/i;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

// file each window still has to open, by webContents id, until its page asks for it
const pendingFiles = new Map();

function logFileIn(argv) {
  return argv.slice(1).find((arg) => LOG_FILE.test(arg) && fs.existsSync(arg));
}

function windowOptions() {
  return {
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#181818" : "#ffffff",
    icon: path.join(DIST, "images", "pwa", "inav_icon_512.png"),
    webPreferences: { preload: path.join(HERE, "preload.cjs") },
  };
}

function setUpWindow(win) {
  // the viewer's own "New Window" stays in the app, documentation links go to the browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(ORIGIN)) {
      return { action: "allow", overrideBrowserWindowOptions: windowOptions() };
    }
    if (/^https?:/.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(ORIGIN)) {
      event.preventDefault();
      if (/^https?:/.test(url)) {
        shell.openExternal(url);
      }
    }
  });
}

function openWindow(file) {
  const win = new BrowserWindow(windowOptions());
  if (file) {
    pendingFiles.set(win.webContents.id, file);
  }
  win.loadURL(`${ORIGIN}/index.html`);
  return win;
}

const firstInstance = app.requestSingleInstanceLock();
if (!firstInstance) {
  app.quit();
} else {
  // a log opened while the app runs gets a window of its own, like the viewer's "New Window"
  app.on("second-instance", (_event, argv) => {
    const file = logFileIn(argv);
    if (file) {
      openWindow(file);
    } else {
      BrowserWindow.getAllWindows()[0]?.focus();
    }
  });

  app.on("browser-window-created", (_event, win) => setUpWindow(win));

  ipcMain.on("viewer-ready", (event) => {
    const file = pendingFiles.get(event.sender.id);
    pendingFiles.delete(event.sender.id);
    if (file) {
      event.sender.send(
        "open-file",
        path.basename(file),
        fs.readFileSync(file),
      );
    }
  });

  app.whenReady().then(() => {
    protocol.handle("app", (request) => {
      const { pathname } = new URL(request.url);
      const file = path.join(DIST, decodeURIComponent(pathname));
      if (!file.startsWith(DIST + path.sep)) {
        return new Response("Not found", { status: 404 });
      }
      return net.fetch(pathToFileURL(file).toString());
    });
    if (process.platform !== "darwin") {
      Menu.setApplicationMenu(null);
    }
    openWindow(logFileIn(process.argv));
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      openWindow();
    }
  });
}
