
// The main menus of the application

enum menu { dashboard='dashboard', skills='skills', bonuses='bonuses' }


const menu_labels = {
    [menu.dashboard]: "Dashboard",
    [menu.skills]: "Skills",
    [menu.bonuses]: "Bonuses"
} as const

const menu_arr:menu[] = Object.keys(menu) as menu[]

export {menu, menu_arr, menu_labels}