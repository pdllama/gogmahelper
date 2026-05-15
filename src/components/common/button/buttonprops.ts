import { ReactNode, MutableRefObject } from "react"

export type ButtonProps = {
    children: ReactNode,
    classes: string,
    onClick: () => void,
    disableRipple: boolean,
    disabled: boolean,
    enable_disabled_style: boolean,
    ref:MutableRefObject<HTMLButtonElement|null>
}