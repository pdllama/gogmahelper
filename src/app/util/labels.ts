import { weapon_labels, weapons } from "@custom_types/weapons";


export function get_weapon_label(weapon:weapons) {
    return weapon_labels[weapon]
}