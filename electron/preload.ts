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
  add_weapon_roller: (weapon:weapons, element:elements, rollType:roll_type) => ipcRenderer.invoke('add_weapon_roller', weapon, element, rollType)

  // You can expose other APTs you need here.
  // ...
})
