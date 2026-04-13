
// The main menus of the application

enum menu { dashboard, skills, bonuses }

const menu_labels = {
    [menu.dashboard]: "Dashboard",
    [menu.skills]: "Skills",
    [menu.bonuses]: "Bonuses"
} as const

export {menu, menu_labels}