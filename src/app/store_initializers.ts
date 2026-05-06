import { MainStore as MainStoreType } from "./main_store";

// The function to initialize the entire state.

export const initialize_store = async(init_stats:MainStoreType["initialize_state"]) => {
    const {ss, bs, kbs, kbp, skill_preferences, bonus_preferences} = await window.ipcRenderer.initialize_app_state();
    init_stats(ss, bs, kbs, kbp, skill_preferences, bonus_preferences);
}
