import { ReactNode } from "react"

export type SlidingWindowProps = {
    active:boolean, 
    children:ReactNode,
    transition_type:'slide-down'|'slide-up'|'slide-left'|'slide-right'|'fade',
    classes:string
}

export const edit_relevant_style = (div_ele:HTMLDivElement, transition_type:SlidingWindowProps["transition_type"], activate:boolean) => {
    if (transition_type === 'slide-down' || transition_type === 'slide-up') {
        div_ele.style.top = activate ? '0%' : transition_type === 'slide-down' ? '-100%' : '100%'
    } else if (transition_type === 'slide-left' || transition_type === 'slide-right') {
        div_ele.style.right = activate ? '0%' : transition_type === 'slide-right' ? '100%' : '-100%'
    } else {
        div_ele.style.opacity = activate ? '100%' : '0%'
    }
}