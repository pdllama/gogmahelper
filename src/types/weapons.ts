enum weapons {
    B='bow', 
    CB='charge_blade', 
    DB='dual_blades', 
    GL='gunlance', 
    GS='great_sword', 
    H='hammer', 
    HBG='heavy_bowgun', 
    HH='hunting_horn', 
    IG='insect_glaive',
    L='lance', 
    LBG='light_bowgun', 
    LS='long_sword', 
    SA='switch_axe', 
    SnS='sword_and_shield'
}

const weapon_labels = {
    [weapons.B]: "Bow",
    [weapons.CB]: "Charge Blade",
    [weapons.DB]: "Dual Blades",
    [weapons.GL]: "Gunlance",
    [weapons.GS]: "Great Sword",
    [weapons.H]: "Hammer",
    [weapons.HBG]: "Heavy Bowgun",
    [weapons.HH]: "Hunting Horn",
    [weapons.IG]: "Insect Glaive",
    [weapons.L]: "Lance",
    [weapons.LBG]: "Light Bowgun",
    [weapons.LS]: "Long Sword",
    [weapons.SA]: "Switch Axe",
    [weapons.SnS]: "Sword and Shield"
} as const

export {weapons, weapon_labels}