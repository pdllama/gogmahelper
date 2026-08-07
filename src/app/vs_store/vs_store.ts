import { VideoSettingsConfig } from '@custom_types/files/config'
import { roll_type } from '@custom_types/rolltype'
import {create} from 'zustand'
import { VsScreens } from '@custom_types/files/config'

// This is the store for the video settings window, not for the main window roll capture

export interface VsStore extends VideoSettingsConfig {
    rollType: roll_type
    initialized: boolean
    screen: VsScreens

    initialize: (v:VideoSettingsConfig) => void
}

export const useVsStore = create<VsStore>((set) => ({
    initialized: false,
    rollType: roll_type.SKILLS,
    screen: VsScreens.display,
    
    wilds_aspect_ratio: '16:9',
    display_x: 0,
    display_y: 0,
    display_width: 0,
    display_height: 0,
    display_scale: 1,

    detection_x: 0,
    detection_y: 0,
    detection_width: 0,
    detection_height: 0,

    canvas_fps: 0,
    pixel_threshold: 0,
    read_delay: 0,

    initialize: (v:VideoSettingsConfig) => set(() => ({...v, initialized: true}))

}))