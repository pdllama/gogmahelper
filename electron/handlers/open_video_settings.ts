import { app_config_defaults, Config, VideoSettingsConfig } from "@custom_types/files/config"
import { BrowserWindow, ipcMain } from "electron"
import path from 'node:path'
import {readFile, writeFile} from 'fs/promises'
import { roll_type } from "@custom_types/rolltype"

export async function create_child(

) {
    
}

export default async function open_video_settings_window(
    rollType:roll_type,
    child:BrowserWindow|null, win:BrowserWindow|null,
    VITE_DEV_SERVER_URL:string|undefined, RENDERER_DIST:string,
    dirname:string
) {
    const configSettings:Config = await get_video_settings()
    const state_settings = get_state_settings(configSettings, rollType)
    ipcMain.handle('get_vs_init_state', () => {return {...state_settings, rollType}})
    child = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC as string, 'icons/appicon.png'),
        parent: win!,
        modal: true, // Prevents using parent until child is closed
        show: false, // Start hidden for smoother loading
        width: configSettings.wilds_aspect_ratio === '16:9' ? 1380 : 1780,
        height: 920,
        webPreferences: {
            preload: path.join(dirname, "preload.mjs"),
            contextIsolation: true
        }
    })
    
    child.setMenu(null)

    if (VITE_DEV_SERVER_URL) {
        child.loadURL(`${VITE_DEV_SERVER_URL}/index_video_settings.html`)
    } else {
        // win.loadFile('dist/index.html')
        child.loadFile(path.join(RENDERER_DIST, 'index_video_settings.html'))
    }

    

    child.webContents.openDevTools()

    child.webContents.once('did-finish-load', () => {
        child.webContents.send('initial-state', state_settings)
    })

    child.on('ready-to-show', () => {
        child!.show()
    })

    child.on('closed', () => {
        ipcMain.removeHandler('get_vs_init_state')
    })

    // video settings handlers
    


}

// The default window size of the video settings should be proportional to the aspect ratio of mh wilds - 16:9 or 21:9.
// We default at 16:9 for the first time the user launches the video settings.
// Every time
export async function get_video_settings() {
    try {
        const config_settings:Config = await readFile('config.json', 'utf-8').then((f:string) => JSON.parse(f));
        return config_settings
    } catch (e:any) {
        console.log(e)
        if (e.code === 'ENOENT') { // config file hasn't been created yet.
            await writeFile('config.json', JSON.stringify(app_config_defaults, null, 4))  
        } 
        return app_config_defaults
    }
}

function get_state_settings(config:Config, rollType:roll_type) : VideoSettingsConfig {
    const settings:Partial<VideoSettingsConfig> = {}
    const path = config.video_settings

    settings.wilds_aspect_ratio = config.wilds_aspect_ratio;
    settings.display_x = path[`${rollType}_display_x`];
    settings.display_y = path[`${rollType}_display_y`];
    settings.display_width = path[`${rollType}_display_width`];
    settings.display_height = path[`${rollType}_display_height`];

    settings.detection_x = path[`${rollType}_detection_x`];
    settings.detection_y = path[`${rollType}_detection_y`];
    settings.detection_width = path[`${rollType}_detection_width`];
    settings.detection_height = path[`${rollType}_detection_height`];

    settings.canvas_fps = path[`${rollType}_canvas_fps`];
    settings.pixel_threshold = path[`${rollType}_pixel_threshold`];
    settings.read_delay = path[`${rollType}_read_delay`];

    return settings as VideoSettingsConfig;
}