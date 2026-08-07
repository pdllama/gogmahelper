"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  initialize_app_state: () => electron.ipcRenderer.invoke("initialize_app_state"),
  add_weapon_roller: (weapon, element, rollType) => electron.ipcRenderer.invoke("add_weapon_roller", weapon, element, rollType),
  remove_weapon: (weapon, rollType) => electron.ipcRenderer.invoke("remove_weapon", weapon, rollType),
  remove_combo: (weapon, element, rollType) => electron.ipcRenderer.invoke("remove_combo", weapon, element, rollType),
  get_mh_wilds_window_id: () => electron.ipcRenderer.invoke("get_mh_wilds_window_id"),
  open_video_settings: (rollType) => electron.ipcRenderer.send("open_video_settings", rollType),
  // video settings handlers
  get_vs_init_state: () => electron.ipcRenderer.invoke("get_vs_init_state"),
  run_ocr: (img_buffer) => electron.ipcRenderer.invoke("run_ocr", img_buffer),
  get_rolls: (weapon, element, rollType) => electron.ipcRenderer.invoke("get_rolls", weapon, element, rollType),
  get_keep_rolls: (keep_id) => electron.ipcRenderer.invoke("get_keep_rolls", keep_id),
  add_skill_roll: (pid, roll, roll_exists) => electron.ipcRenderer.invoke("add_skill_roll", pid, roll, roll_exists)
  // You can expose other APTs you need here.
  // ...
});
