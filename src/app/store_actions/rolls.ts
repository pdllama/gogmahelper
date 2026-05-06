import { elements } from "@custom_types/element";
import { roll_type } from "@custom_types/rolltype";
import { weapons } from "@custom_types/weapons";
import { MainStore } from "../main_store";
import { AlertStore } from "../alerts/alert_store";


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