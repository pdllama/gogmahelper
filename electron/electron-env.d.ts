/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

interface api {
  on(channel: string, listener: (...args: any[]) => void): void
  off(channel: string, listener: (...args: any[]) => void): void
  send(channel: string, ...args: any[]): void
  invoke(channel: string, ...args: any[]): Promise<any>

  initialize_app_state(): Promise<any>
  add_weapon_roller(weapon:weapons, element:elements, rollType:roll_type): Promise<any>
  remove_weapon(weapon:weapons, rollType:roll_type): Promise<any>
  remove_combo(weapon:weapons, element:elements, rollType:roll_type): Promise<any>

  get_mh_wilds_window_id(): Promise<any>
  open_video_settings(rollType:roll_type): Promise<any>
  get_vs_init_state(): Promise<any>

  run_ocr(img_buffer:any, rollType:roll_type): Promise<string|string[]>
  get_rolls(weapon:weapons, element:elements, rollType:roll_type): Promise<Any>
  get_keep_rolls(keep_id: string): Promise<Array<any>>

  add_skill_roll(pid:number, roll:skill_roll, roll_exists:boolean): void
  delete_skill_roll(pid:number, rollnum:number): void
  add_amend_roll(pid:number, roll:bonus_roll, roll_exists:boolean): void
  delete_amend_roll(pid:number, rollnum:number): void

  add_preference: (rt:roll_type, pref:skill_roll_preference|bonus_roll_preference) => Promise<any>
  edit_preference: (rt:roll_type, orig:skill_roll_preference|bonus_roll_preference, n:skill_roll_preference|bonus_roll_preference) => Promise<any>
  remove_preference: (rt:roll_type, pref:skill_roll_preference|bonus_roll_preference) => Promise<any>

}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: api
}
