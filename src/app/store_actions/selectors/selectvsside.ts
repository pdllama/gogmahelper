import { CaptureStore } from "@app/capture_store"
import { roll_type } from "@custom_types/rolltype"
import { useShallow } from "zustand/shallow"


export const select_video_settings = (state:CaptureStore, rollType:roll_type) => {
    const key = rollType === roll_type.SKILLS ? "skills" : "bonuses";
    const ds = state.video_settings

    return {
        wilds_aspect_ratio: state.wilds_aspect_ratio,
        display_x: ds[`${key}_display_x`],
        display_y: ds[`${key}_display_y`],
        display_width: ds[`${key}_display_width`],
        display_height: ds[`${key}_display_height`],
        display_scale: ds[`${key}_display_scale`],

        detection_x: ds[`${key}_detection_x`],
        detection_y: ds[`${key}_detection_y`],
        detection_width: ds[`${key}_detection_width`],
        detection_height: ds[`${key}_detection_height`],

        canvas_fps: ds[`${key}_canvas_fps`],
        pixel_threshold: ds[`${key}_pixel_threshold`],
        read_delay: ds[`${key}_read_delay`],
    }
}