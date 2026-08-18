import { ReactNode } from "react";

type GridWrapperProps = Partial<{
    children: ReactNode,
    min_size: string|number,
    max_size: string|number,
    gap: number
}>

export default function GridWrapper({children, min_size='250px', max_size='1fr', gap=0.5}:GridWrapperProps) {

    //grid-cols-[repeat(auto-fit, minmax(${min_size}, ${max_size}))]

    return (
        <>
        <style>
            {
            `.custom-grid-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(${min_size}, ${max_size}));
                place-items: start;
                gap: ${gap}rem;
            }`
            }
        </style>
        <div className={`custom-grid-container`}>
            {children}
        </div>
        </>
    )
}