import { weapons } from "./weapons"
import { elements } from "./element"

// There are various scenarios where we may want a "both", even if it may seem counter-intuitive.
enum roll_type {
    NONE="none",
    SKILLS="skills",
    BONUSES="bonuses",
    BOTH="both"
}

enum bonus_roll_type {
    AMEND="amend",
    KEEP="keep"
}

// This is used to differentiate between weapons that have skill rolls, bonus rolls, or both associated with them.
// None typically isn't used since weapon files without rolls would normally be deleted, but it's a catch-all
type roll_map = Partial<Record<weapons, roll_type>>


enum set_bonus_skill {
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

enum group_bonus_skill {
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

enum reinforcement {
    atk = "ATK",
    aff = "AFF",
    shpammo = "SHARP/AMMO",
    cap = "CAP",
    ele = "ELE"
}

enum reinforcement_level {one, two, three, ex}


type skill_roll = {
    roll_num: number,
    set_bonus: set_bonus_skill,
    group_bonus: group_bonus_skill
}

type bonus_type = {
    bonus: reinforcement,
    level: reinforcement_level
}

type bonus_roll = {roll_num: number, roll: [bonus_type, bonus_type, bonus_type, bonus_type, bonus_type]}


// Complicated logic to check if two bonus rolls are the same, since the bonuses can be in any position.
// Also, we want to compare differently if we're amending bonuses or keeping them.
//  amend-bonus: check equality on the reinforcements, not the level
//  keep-bonus: check equality on the reinforcements and level
const compare_bonus_rolls = (br1:bonus_roll, br2:bonus_roll, br_type:bonus_roll_type) => {
    // Returns true if br1 reinforcements === br2 reinforcements (amend) and br1 levels === br2 levels (keep). Returns false otherwise

    let matchedIndices:Set<number> = new Set<number>;

    for (let bt of br1.roll) {
        const i = br2.roll.findIndex((bonus:bonus_type, i:number) => {
            return !matchedIndices.has(i) && bonus.bonus == bt.bonus && ((br_type == bonus_roll_type.KEEP && bonus.level == bt.level) || br_type != bonus_roll_type.KEEP)
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

// Record of element: skill_roll_stats
type element_skill_stat = Partial<Record<elements, skill_roll_stats>>
// Record of weapon to element_stat(s)
type weapon_skill_stat = Partial<Record<weapons, element_skill_stat>>


export {roll_type, compare_bonus_rolls}
export type {roll_map, skill_roll, weapon_skill_stat, bonus_roll, bonus_roll_type}

