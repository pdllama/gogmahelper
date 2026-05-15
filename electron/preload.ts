import { elements } from '@custom_types/element'
import { roll_type } from '@custom_types/rolltype'
import { weapons } from '@custom_types/weapons'
import { ipcRenderer, contextBridge } from 'electron'

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
  get_vs_init_state: () => ipcRenderer.invoke("get_vs_init_state")

  // You can expose other APTs you need here.
  // ...
})
