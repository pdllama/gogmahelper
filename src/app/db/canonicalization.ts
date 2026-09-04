import { bonus_roll, bonus_type, reinforcement, roll_type_other } from "@custom_types/rolltype"
import { gogma_database } from "./app_init"


const canonical_reinf_order = {
    "ATTACK": 1,
    "AFFINITY": 2,
    "ELEMENT": 3,
    "SHARPNESS/AMMO": 4
}
const canonical_lvl_order = {
    "EX": 1,
    "3": 2,
    "2": 3,
    "1": 4
}

type reinf_order_type = typeof canonical_reinf_order
type lvl_order_type = typeof canonical_lvl_order

export function canonicalize_reinforcements(roll:bonus_roll) {

    const n = roll.roll.map(r => r.bonus).sort((a:reinforcement, b:reinforcement) => canonical_reinf_order[a as keyof reinf_order_type] < canonical_reinf_order[b as keyof reinf_order_type] ? -1 : 1) as roll_type_other.five_reinforcement_rolls

    return gogma_database.convert_app_reinf_to_db(n)
}