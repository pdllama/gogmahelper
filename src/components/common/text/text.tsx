import { ReactNode } from "react"


type TextProps = Partial<{
    classes:string,
    size:string|number,
    children:ReactNode,
    bold:boolean
}>

const fontSize = {
    'sm': '14px',
    'md': '16px',
    'lg': '18px',
    'xl': '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px'
}

type FontSizeMap = typeof fontSize

export default function Text({classes='', size=14, children, bold=false}:TextProps) {

    const parsedFontSize = typeof size == 'number' ? `${size}px` : fontSize[size as keyof FontSizeMap] == undefined ? '14px' : fontSize[size as keyof FontSizeMap]

//style={{fontSize: size}} 
    return (
        <p style={{fontSize: parsedFontSize}} className={`flex items-center justify-center text-wrap ${bold ? 'font-bold' : ''} ${classes}`}>{children}</p>
    )
}