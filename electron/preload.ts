import { elements } from '@custom_types/element'
import { roll_type } from '@custom_types/rolltype'
import { weapons } from '@custom_types/weapons'
import { ipcRenderer, contextBridge } from 'electron'
import { skill_roll } from '@custom_types/rolltype'
import { bonus_roll_preference, skill_roll_preference } from '@custom_types/preferences'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  initialize_app_state: () => ipcRenderer.invoke('initialize_app_state'),
  add_weapon_roller: (weapon:weapons, element:elements, rollType:roll_type) => ipcRenderer.invoke('add_weapon_roller', weapon, element, rollType),
  remove_weapon:(weapon:weapons, rollType:roll_type) => ipcRenderer.invoke('remove_weapon', weapon, rollType),
  remove_combo:(weapon:weapons, element:elements, rollType:roll_type) => ipcRenderer.invoke('remove_combo', weapon, element, rollType),

  get_mh_wilds_window_id: () => ipcRenderer.invoke('get_mh_wilds_window_id'),
  open_video_settings: (rollType:roll_type) => ipcRenderer.send('open_video_settings', rollType),

  // video settings handlers
  get_vs_init_state: () => ipcRenderer.invoke("get_vs_init_state"),


  run_ocr: (img_buffer:any) => ipcRenderer.invoke("run_ocr", img_buffer),
  get_rolls: (weapon:weapons, element:elements, rollType:roll_type) => ipcRenderer.invoke("get_rolls", weapon, element, rollType),
  get_keep_rolls: (keep_id:string) => ipcRenderer.invoke("get_keep_rolls", keep_id),

  add_skill_roll: (pid:number, roll:skill_roll, roll_exists:boolean) => ipcRenderer.invoke('add_skill_roll', pid, roll, roll_exists),
  delete_skill_roll: (pid:number, rollnum:number) => ipcRenderer.invoke('delete_skill_roll', pid, rollnum),



  add_preference: (rt:roll_type, pref:skill_roll_preference|bonus_roll_preference) => ipcRenderer.invoke('add_preference', rt, pref),
  edit_preference: (rt:roll_type, orig:skill_roll_preference|bonus_roll_preference, n:skill_roll_preference|bonus_roll_preference) => ipcRenderer.invoke('edit_preference', rt, orig, n),
  remove_preference: (rt:roll_type, pref:skill_roll_preference|bonus_roll_preference) => ipcRenderer.invoke('remove_preference', rt, pref)
  // You can expose other APTs you need here.
  // ...
})
