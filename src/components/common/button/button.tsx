import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import "./button.css"
import useDebouncedFunction from "../../../app/util/useDebounce";

type ButtonProps = {
    children: ReactNode,
    classes: string,
    onClick: () => void,
    disableRipple: boolean,
    disabled: boolean
}

function change_ripple_size(span:any, button:any) {
        // Dynamically changes the size of the ripple based on the size of the button.
        const {left, top, right, bottom} = button.getBoundingClientRect();
        const height = bottom-top;
        const width = right-left;
        const smallestDim = height > width ? width : height;
        span.style.width = (smallestDim/2).toString() + "px"
        span.style.height = (smallestDim/2).toString() + "px"
    }

const spanOnClick = (e: MouseEvent, spanRef:any, buttonRef:any, onClick: () => void, toggleExpandedSpanState: ()=>void) => {
    change_ripple_size(spanRef, buttonRef)
    const {left, top} = buttonRef.getBoundingClientRect();
    const leftPosition = e.clientX - left
    const topPosition = e.clientY - top

    spanRef.style.left = leftPosition.toString() + "px"
    spanRef.style.top = topPosition.toString() + "px"

    toggleExpandedSpanState()

    onClick();
}

export default function Button({children, classes='', onClick=()=>{}, disableRipple=false, disabled=false }:Partial<ButtonProps>) {
    const button = useRef(null)
    const span = useRef(null)
    const [expandedSpanState, setExpandedSpanState] = useState(false)
    const expandFunction = useDebouncedFunction(() => setTimeout(() => {setExpandedSpanState(false)}), 600)

    useEffect(() => {
        expandFunction()
    }, [expandedSpanState])

    return (
    <button 
        ref={button} 
        className={`
            relative 
            overflow-hidden 
            ${disabled ? 'pointer-events-none' : ''}
            ${classes}
        `} 
        onClick={
            disableRipple ? onClick : 
            (e: MouseEvent) => spanOnClick(e, span.current, button.current, onClick, () => {setExpandedSpanState(true)})
        }
    >
        <span ref={span} className={`z-5 ripple-class${expandedSpanState ? ' active' : ''}`}></span>
        {children}
    </button>
    )
}