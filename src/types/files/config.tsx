

// The type of the config file. 
// This is the config for various important information across the application, primarily the video display settings.
// These settings typically don't change often which makes it perfect for a config file. 

import { roll_type } from "@custom_types/rolltype"

export interface Config {

    wilds_aspect_ratio: '16:9' | '21:9',

    video_settings: {
        skills_display_x: number,
        skills_display_y: number,
        skills_display_width: number,
        skills_display_height: number,
        skills_display_scale: number,

        skills_detection_x: number,
        skills_detection_y: number,
        skills_detection_width: number,
        skills_detection_height: number,

        skills_canvas_fps: number,
        skills_pixel_threshold: number,
        skills_read_delay: number,


        bonuses_display_x: number,
        bonuses_display_y: number,
        bonuses_display_width: number,
        bonuses_display_height: number,
        bonuses_display_scale: number,

        bonuses_detection_x: number,
        bonuses_detection_y: number,
        bonuses_detection_width: number,
        bonuses_detection_height: number,

        bonuses_canvas_fps: number,
        bonuses_pixel_threshold: number,
        bonuses_read_delay: number,
    }
}

// For a single side.
export interface VideoSettingsConfig {
    wilds_aspect_ratio: '16:9' | '21:9',
    display_x: number,
    display_y: number,
    display_width: number,
    display_height: number,
    display_scale: number,

    detection_x: number,
    detection_y: number,
    detection_width: number,
    detection_height: number,

    canvas_fps: number,
    pixel_threshold: number,
    read_delay: number,
}

const generate_default = (
    rollType:roll_type,
    display_x: number, display_y: number, display_width:number, display_height:number, scale: number,
    detection_x: number, detection_y: number, detection_width: number, detection_height: number
) => {

    const display_detection_settings:any = {}

    display_detection_settings[`${rollType}_display_x`] = display_x;
    display_detection_settings[`${rollType}_display_y`] = display_y;
    display_detection_settings[`${rollType}_display_width`] = display_width;
    display_detection_settings[`${rollType}_display_height`] = display_height;
    display_detection_settings[`${rollType}_display_scale`] = scale;

    display_detection_settings[`${rollType}_detection_x`] = detection_x;
    display_detection_settings[`${rollType}_detection_y`] = detection_y;
    display_detection_settings[`${rollType}_detection_width`] = detection_width;
    display_detection_settings[`${rollType}_detection_height`] = detection_height;

    display_detection_settings[`${rollType}_canvas_fps`] = 5;
    display_detection_settings[`${rollType}_pixel_threshold`] = 0.08;
    display_detection_settings[`${rollType}_read_delay`] = rollType === roll_type.SKILLS ? 0.5 : 1.2;

    return display_detection_settings
}


export const app_config_defaults:Config = {
    wilds_aspect_ratio: '16:9',
    video_settings: {
        ...generate_default(roll_type.SKILLS, 1030, 358, 350, 70, 1.55, 0, 0, 20, 70),
        ...generate_default(roll_type.BONUSES, 1030, 440, 350, 160, 1.55, 0, 0, 20, 160)
    }
}

// Default for one type of config (skills or bonuses).

//  
//
//  display region settings:
//  x
//  y
//  width
//  height
//  scale
//
//  detection region settings:
//  x
//  y
//  width
//  height
//  
//  canvas fps
//  pixel threshold
//  ocr delay (detection delay)