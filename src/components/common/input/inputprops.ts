
type InputProps = {
    value: string
    onChange: (val:string) => void
    onFocus: (() => void) | ((_:any) => void) | null
    onBlur: (() => void)| ((_:any) => void) | null
    onKeyDown: (() => void) | ((_:any) => void) | null
    numeric: boolean
    validate: (val:string) => boolean
    classes: string
    numericLimits: boolean
    min: number
    max: number
    focusedBorderOnly: boolean
    autofocus: boolean
}

export type {InputProps}