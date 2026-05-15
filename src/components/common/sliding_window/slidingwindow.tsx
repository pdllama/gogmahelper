import { useEffect, useRef } from "react";
import { edit_relevant_style, SlidingWindowProps } from "./sliding_window_logic";
import "./slidingwindow.css"

const init_style = {
    'slide-down': 'top-[-100%]',
    'slide-up': 'top-[100%]',
    'slide-left': 'right-[-100%] top-[0%]',
    'slide-right': 'right-[100%] top-[0%]', // Need to set top so that 
    'fade': 'opacity-0 top-[0%]'
}

// parent component of the window must be position relative
export default function SlidingWindow({active=false, children, transition_type='slide-down', classes=''}:Partial<SlidingWindowProps>) {
    const isInitialMount = useRef(true);
    const window_ref = useRef<HTMLDivElement|null>(null);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            const divEle = window_ref.current as HTMLDivElement;
            if (active) {
                edit_relevant_style(divEle, transition_type, true)
            } else {
                edit_relevant_style(divEle, transition_type, false)
            }
        }
    }, [active])

    return (
        <div 
            className={`
                absolute ${init_style[transition_type]} z-5 ${transition_type} ${active ? 'pointer-events-auto' : 'pointer-events-none'}
                ${classes}
            `} 
            ref={window_ref}
        >
            {children}
        </div>
    )
}