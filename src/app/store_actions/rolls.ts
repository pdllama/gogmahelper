import { element_labels, elements } from "@custom_types/element";
import { roll_type, skill_roll, bonus_roll, keep_bonus_roll } from "@custom_types/rolltype";
import { weapon_labels, weapons } from "@custom_types/weapons";
import { MainStore } from "../main_store";
import { AlertStore } from "../alerts/alert_store";
import { rollsDataState } from "../../main/window/rollscreen";


export async function add_new_weapon(
    store_function:MainStore["modify_skill_stat_element"]|MainStore["modify_amend_stat_element"],
    add_alert:AlertStore["add_alert"],
    weapon:weapons, 
    element:elements, 
    rollType:roll_type) 
{
    await window.ipcRenderer.add_weapon_roller(weapon, element, rollType) // updates the backend. adds a weapon profile and a roll number 0
    store_function(weapon, element, true); // updates the store
    add_alert({title: '', content: 'Added the weapon combo!', type: 'success', timeout: 3})
}


export async function remove_weapon(
    store_function:MainStore["modify_skill_stat_weapon"]|MainStore["modify_amend_stat_weapon"],
    add_alert:AlertStore["add_alert"],
    weapon:weapons,
    rollType:roll_type
) {
    await window.ipcRenderer.remove_weapon(weapon, rollType);
    store_function(weapon, false);
    add_alert({title: '', content: `Removed ${weapon_labels[weapon]} rolls!`, type: 'success', timeout: 3})
}

export async function remove_combo(
    store_function:MainStore["modify_skill_stat_element"]|MainStore["modify_amend_stat_element"],
    add_alert:AlertStore["add_alert"],
    weapon:weapons,
    element:elements,
    rollType:roll_type
) {
    await window.ipcRenderer.remove_combo(weapon, element, rollType);
    store_function(weapon, element, false);
    add_alert({title: '', content: `Removed ${element_labels[element]} rolls!`, type: 'success', timeout: 3})
}

// type get_rolls_output = {
//     rolls: Array<skill_roll|bonus_roll|keep_bonus_roll>,
//     profile_id: 
// }

export async function initialize_combo_rolls(
    set_state: React.Dispatch<React.SetStateAction<rollsDataState>>,
    w:weapons, e:elements, rt:roll_type
) {
    const arr:any = await window.ipcRenderer.get_rolls(w, e, rt);
    set_state(state => {return {...state, rolls: arr.rolls, pid: arr.profile_id, loadedRolls: true}});
}