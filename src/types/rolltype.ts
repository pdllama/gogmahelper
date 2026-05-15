import { weapons } from "./weapons"
import { elements } from "./element"

export enum roll_type {
    SKILLS="skills",
    BONUSES="bonuses"
}
export enum bonus_roll_type {
    AMEND="amend",
    KEEP="keep"
}

export enum set_bonus_skill {
    dm = "Doshaguma's Might",
    xwv = "Xu Wu's Vigor",
    faw = "Fulgur Anjanath's Will",
    gp = "Gravios's Protection",
    rf = "Rathalos's Flare",
    bs = "Blangonga's Spirit",
    eop = "Ebony Odogaron's Power",
    rdv = "Rey Dau's Voltage",
    udc = "Uth Duna's Cover",
    num = "Nu Udra's Mutiny",
    jdr = "Jin Dahaad's Revolt",
    gav = "Guardian Arkveld's Vitality",
    ah = "Arkveld's Hunger",
    zsp = "Zoh Shia's Pulse",
    gmt = "Gore Magala's Tyranny",
    mp = "Mizutsune's Prowess",
    lf = "Leviathan's Fury",
    st = "Seregios's Tenacity",
    or = "Omega Resonance",
    sodk = "Soul of the Dark Knight",
    gmp = "Gogmapocalypse"
}

export enum group_bonus_skill {
    na = "Neopteron Alert",
    nc = "Neopteron Camouflage",
    sp = "Scaling Prowess",
    sl = "Scale Layering",
    fl = "Flexible Leathercraft",
    bl = "Buttery Leathercraft",
    fp = "Fortifying Pelt",
    ap = "Alluring Pelt",
    lfa = "Lord's Favor",
    lfu = "Lord's Fury",
    gpu = "Guardian's Pulse",
    gpr = "Guardian's Protection",
    iw = "Imparted Wisdom",
    ls = "Lord's Soul"
}

export enum reinforcement {
    ATK = "ATTACK",
    AFF = "AFFINITY",
    SHARP = "SHARPNESS/AMMO",
    ELE = "ELEMENT"
}

export enum reinforcement_level {one="1", two="2", three="3", ex="EX"}

export type skill_roll = {
    roll_num: number,
    set_bonus: set_bonus_skill,
    group_bonus: group_bonus_skill
}

type bonus_type = {
    bonus: reinforcement,
    level: reinforcement_level
}

export type bonus_roll = {roll_num: number, roll: roll_type_other.five_bonus_rolls}
export type keep_bonus_roll = {roll_num: number, roll: roll_type_other.five_level_rolls} 

export type keep_bonus_profile = {
    name:string, // user-defined name for the profile
    weapon:weapons,
    element:elements,
    curr_reinforcements:roll_type_other.five_bonus_rolls,
    canonical_target_reinforcement_levels:roll_type_other.five_level_rolls
}

export type weapon_skill_stat = Partial<Record<weapons, roll_type_other.element_skill_stat>>
export type weapon_bonus_stat = Partial<Record<weapons, roll_type_other.element_bonus_stat>>
export type keep_bonus_stat = Partial<Record<string, roll_type_other.keep_bonus_roll_stats>>

export namespace roll_type_other {
    export type five_bonus_rolls = [bonus_type, bonus_type, bonus_type, bonus_type, bonus_type]
    export type five_level_rolls = [reinforcement_level, reinforcement_level, reinforcement_level, reinforcement_level, reinforcement_level] // Keep bonuses don't need to store reinforcements. Saves a little disk space.
    export type five_reinforcement_rolls = [reinforcement, reinforcement, reinforcement, reinforcement, reinforcement] // Amend bonus preferences don't need levels. Saves a little disk space

    // Complicated logic to check if two bonus rolls are the same, since the bonuses can be in any position.
    // We just check the reinforcement types. We compare levels when checking keep bonuses, but that is computed separately.
    export const compare_bonus_rolls = (br1:bonus_roll, br2:bonus_roll) => {
        // Returns true if br1 reinforcements === br2 reinforcements. Returns false otherwise
        let matchedIndices:Set<number> = new Set<number>;
        for (let bt of br1.roll) {
            const i = br2.roll.findIndex((bonus:bonus_type, i:number) => {
                return !matchedIndices.has(i) && bonus.bonus == bt.bonus
            })
            if (i == -1) {return false}
            else {matchedIndices.add(i)}
        }
        return true
    }

    // Gives a small overview of how many rolls, any good rolls, etc
    type skill_roll_stats = {
        num_rolls: number,
        god_rolls: Array<skill_roll>
    }
    type bonus_roll_stats = {
        num_rolls: number,
        god_rolls: Array<bonus_roll>,
    }
    export type keep_bonus_roll_stats = {
        num_rolls: number,
        god_rolls: Array<keep_bonus_roll>
    }


    // Record of element: skill_roll_stats
    export type element_skill_stat = Partial<Record<elements, skill_roll_stats>>
    // Record of weapon to element_skill_stat(s)
    


    // Record of element: bonus_roll_stats
    export type element_bonus_stat = Partial<Record<elements, bonus_roll_stats>>
    
    // Record of weapon to element_bonus_stat(s)
    // export {roll_type, set_bonus_skill, group_bonus_skill, compare_bonus_rolls}
    // export type {roll_map, skill_roll, reinforcement_level, reinforcement, weapon_skill_stat, weapon_bonus_stat, keep_bonus_stat, five_bonus_rolls, five_level_rolls, bonus_roll, keep_bonus_roll, bonus_roll_type, keep_bonus_profile}
}

