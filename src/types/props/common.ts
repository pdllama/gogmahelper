import { elements } from "../element";
import { menu } from "../menutype";
import { weapons } from "../weapons";

type MenuProp = {
    menu: menu
}

type AppStateProp = MenuProp & {
    weapon: (weapons|null),
    element: (elements|null)
}

export type {MenuProp, AppStateProp}