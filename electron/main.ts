import { app, BrowserWindow, ipcMain, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import AppDatabase from '../src/app/database'
import Database from 'better-sqlite3'
import { weapons } from '@custom_types/weapons'
import { elements } from '@custom_types/element'
import { roll_type, skill_roll } from '@custom_types/rolltype'
import get_mh_wilds_window_id from './handlers/get_mh_wilds_id'
import open_video_settings_window from './handlers/open_video_settings'
import run_ocr from './handlers/run_ocr'
import init_app_state from './handlers/init_state'


const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')



// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let child: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC as string, 'icons/appicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      webSecurity: true
    },
  })
  
  win.setMenu(null)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.webContents.on("context-menu", (_, params) => {
    win?.webContents.inspectElement(params.x, params.y);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.commandLine.appendSwitch('disable-features', 'WindowsGraphicsCapture');
app.commandLine.appendSwitch('enable-usermedia-screen-capturing');

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'gogmahelper.db')
  const db:AppDatabase = new AppDatabase(new Database(dbPath))

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media' || permission === 'display-capture') {
          callback(true);
      } else {
          callback(false);
      }
  });

  ipcMain.handle('initialize_app_state', () => init_app_state(db))
  ipcMain.handle('add_weapon_roller', (_:any, weapon:weapons, element:elements, rollType:roll_type) => db.add_weapon(weapon, element, rollType))
  ipcMain.handle('remove_weapon', (_:any, weapon:weapons, rollType:roll_type) => db.remove_weapon(weapon, rollType))
  ipcMain.handle('remove_combo', (_:any, weapon:weapons, element:elements, rollType:roll_type) => db.remove_combo(weapon, element, rollType))

  ipcMain.handle('get_mh_wilds_window_id', async() => get_mh_wilds_window_id())
  ipcMain.handle('run_ocr', async(_:any, img_buffer:Buffer) => run_ocr(img_buffer))
  ipcMain.handle('get_rolls', async(_:any, weapon:weapons, element:elements, rollType:roll_type) => db.get_rolls(weapon, element, rollType))
  ipcMain.handle('get_keep_rolls', async(_:any, keep_id:string) => db.get_keep_rolls(keep_id))

  ipcMain.handle('add_skill_roll', async(_:any, pid:number, roll:skill_roll, roll_exists:boolean) => db.add_skill_roll(pid, roll, roll_exists))

  ipcMain.on('open_video_settings', async(_, rollType:roll_type) => open_video_settings_window(rollType, child!, win, VITE_DEV_SERVER_URL, RENDERER_DIST, __dirname))
  // ipcMain.handle('open_video_settings', async() => open_video_settings_window(child!, win, VITE_DEV_SERVER_URL, RENDERER_DIST))

  

  createWindow()
}).catch(err => {
  console.log(err)
})
