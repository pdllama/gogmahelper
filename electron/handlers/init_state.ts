import AppDatabase from "@app/database";
import { get_video_settings } from "./open_video_settings";


export default async function init_app_state(db:AppDatabase) {
    const allConfig = await get_video_settings()
    const videoSettings = {wilds_aspect_ratio: allConfig.wilds_aspect_ratio, video_settings: allConfig.video_settings};

    return {...db.initialize_stats(), ...db.initialize_preferences(), vs: videoSettings}
}