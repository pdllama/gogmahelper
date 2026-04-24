import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as fs from "fs/promises";
var weapons = /* @__PURE__ */ ((weapons2) => {
  weapons2["B"] = "bow";
  weapons2["CB"] = "charge_blade";
  weapons2["DB"] = "dual_blades";
  weapons2["GL"] = "gunlance";
  weapons2["GS"] = "great_sword";
  weapons2["H"] = "hammer";
  weapons2["HBG"] = "heavy_bowgun";
  weapons2["HH"] = "hunting_horn";
  weapons2["IG"] = "insect_glaive";
  weapons2["L"] = "lance";
  weapons2["LBG"] = "light_bowgun";
  weapons2["LS"] = "long_sword";
  weapons2["SA"] = "switch_axe";
  weapons2["SnS"] = "sword_and_shield";
  return weapons2;
})(weapons || {});
async function get_weapon_file_names() {
  try {
    const files = await fs.readdir("data");
    const formatted = files.map((f) => f.slice(0, f.indexOf(".")));
    const actualWeapons = formatted.filter((f) => Object.values(weapons).map((w) => w.toString()).includes(f));
    const type_map = {};
    for (let f of actualWeapons) {
      const json = await fs.readFile(`data/${f}.json`, "utf-8").then((f2) => JSON.parse(f2));
      if (json.skills != void 0 && json.bonuses != void 0) {
        type_map[f] = "both";
      } else if (json.skills != void 0) {
        type_map[f] = "skills";
      } else if (json.bonuses != void 0) {
        type_map[f] = "bonuses";
      } else {
        type_map[f] = "none";
      }
    }
    return { actualWeapons, type_map };
  } catch (error) {
    if (error.code == "ENOENT") {
      return [];
    }
    return [];
  }
}
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icons/appicon.png"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.setMenu(null);
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.on("context-menu", (_, params) => {
    win?.webContents.inspectElement(params.x, params.y);
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("get_weapon_file_names", get_weapon_file_names);
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
