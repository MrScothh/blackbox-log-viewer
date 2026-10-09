// Desktop packages with electron-forge, as INAV Configurator builds its own. The app is the web build in dist/
// (npm run desktop:make builds it first with --mode desktop) plus electron/; nothing else goes into the package.
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const description =
  "Blackbox log viewer for the open source flight controller software INAV.";

function packaged(file) {
  return (
    file === "" ||
    file === "/package.json" ||
    /^\/(dist|electron)(\/|$)/.test(file)
  );
}

export default {
  packagerConfig: {
    name: "INAV Blackbox Explorer",
    executableName: "inav-blackbox-explorer",
    icon: path.join(here, "assets", "desktop", "inav"),
    asar: true,
    ignore: (file) => !packaged(file.replaceAll("\\", "/")),
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32", "linux", "darwin"],
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        // same name and volume title, no spaces: see INAV Configurator's forge.config.js
        name: "INAV-Blackbox-Explorer",
        title: "INAV-Blackbox-Explorer",
        background: "./assets/desktop/dmg-background.png",
        icon: "./assets/desktop/inav.icns",
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          name: "inav-blackbox-explorer",
          productName: "INAV Blackbox Explorer",
          categories: ["Utility"],
          icon: "./public/images/pwa/inav_icon_512.png",
          description,
          homepage: "https://github.com/iNavFlight/blackbox-log-viewer",
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          name: "inav-blackbox-explorer",
          productName: "INAV Blackbox Explorer",
          license: "GPL-3.0",
          categories: ["Utility"],
          icon: "./public/images/pwa/inav_icon_512.png",
          description,
          homepage: "https://github.com/iNavFlight/blackbox-log-viewer",
        },
      },
    },
  ],
};
