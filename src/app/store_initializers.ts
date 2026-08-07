import { CaptureStore } from "./capture_store";
import { MainStore as MainStoreType } from "./main_store";

// The function to initialize the entire state.

export const initialize_stores = async(init_stats:MainStoreType["initialize_state"], init_cap_store:CaptureStore["initialize_capture_store"]) => {
    const {ss, bs, kbs, kbp, skill_preferences, bonus_preferences, vs} = await window.ipcRenderer.initialize_app_state();
    init_stats(ss, bs, kbs, kbp, skill_preferences, bonus_preferences);
    init_cap_store(vs);
}

