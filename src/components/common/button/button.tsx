import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import "./button.css"

type ButtonProps = {
    children: ReactNode,
    classes: string,
    onClick: () => void,
    disableRipple: boolean
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

const spanOnClick = (e: MouseEvent, spanRef:any, buttonRef:any, onClick: () => void, toggleExpandedSpanState: (boolean)=>void) => {
    change_ripple_size(spanRef, buttonRef)
    const {left, top} = spanRef.getBoundingClientRect();
    const leftPosition = e.clientX - left
    const topPosition = e.clientY - top

    spanRef.style.left = leftPosition.toString() + "px"
    spanRef.style.top = topPosition.toString() + "px"

    toggleExpandedSpanState(true)

    onClick();

    // setTimeout(() => {
    //     if (spanRef !== null) { 
    //         // If covers cases where clicking the button may transition
    //         // into a state where the button is not actually rendered anymore.
    //         console.log("FIRED")
    //         spanRef.classList.remove("active")
    //     }
    // }, 600)
}

export default function Button({children, classes='', onClick=()=>{}, disableRipple=false }:ButtonProps) {
    const button = useRef(null)
    const span = useRef(null)
    const [expandedSpanState, setExpandedSpanState] = useState(false)

    useEffect(() => {
        setTimeout(() => {setExpandedSpanState(false); console.log('HIT HERE')}, 600)
    }, [expandedSpanState])

    return (
    <button 
        ref={button} 
        className={`
            relative 
            overflow-hidden 
            ${classes}
        `} 
        onClick={
            disableRipple ? onClick : 
            (e: MouseEvent) => spanOnClick(e, span.current, button.current, onClick, () => setExpandedSpanState(!expandedSpanState))
        }
    >
        <span ref={span} className={`z-5 ripple-class${expandedSpanState ? ' active' : ''}`}></span>
        {children}
    </button>
    )
}