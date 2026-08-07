import { app_config_defaults, Config } from "@custom_types/files/config";
import { bonus_roll, keep_bonus_roll, skill_roll } from "@custom_types/rolltype";
import { create } from "zustand";

// This is the store for the video capture settings when ACTUALLY rolling in main window.

export interface CaptureStore extends Config {

    last_skill_roll: null|skill_roll
    last_amend_roll: null|bonus_roll
    last_keep_roll: null|keep_bonus_roll

    initialize_capture_store: (c:Config) => void
    set_last_skill_roll: (sr:skill_roll) => void;
    set_last_amend_roll: (br:bonus_roll) => void;
    set_last_keep_roll: (kr:keep_bonus_roll) => void;

}

export const useCaptureStore = create<CaptureStore>((set) => ({
    ...app_config_defaults,
    last_skill_roll: null,
    last_amend_roll: null,  
    last_keep_roll: null,

    initialize_capture_store: (c:Config) => {set({...c})},
    set_last_skill_roll: (sr:skill_roll) => {set({last_skill_roll: sr})},
    set_last_amend_roll: (br:bonus_roll) => {set({last_amend_roll: br})},
    set_last_keep_roll: (kr:keep_bonus_roll) => {set({last_keep_roll: kr})}

}))