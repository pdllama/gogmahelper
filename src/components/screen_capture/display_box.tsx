import { useVsStore } from "@app/vs_store/vs_store";
import { useShallow } from "zustand/shallow";



export default function DisplayBox({}) {

    const {x, y, width, height, scale} = useVsStore(useShallow((state) => {return {x: state.display_x, y: state.display_y, width: state.display_width, height: state.display_height, scale: state.display_scale}}));

    console.log(x, y, width, height)

    const circle_scale = 20
    const pos = circle_scale/-2

    return (
        <div className='absolute border border-white bg-opacity-100 z-15' style={{width, height, top: `${y}px`, left: `${x}px`}}>
            <div className='relative size-full'>
                <div className='absolute bg-white rounded-full' style={{width: `${circle_scale}px`, height:`${circle_scale}px`, top:`${pos}px`, left:`${pos}px`}}/>
                <div className='absolute bg-white rounded-full' style={{width: `${circle_scale}px`, height:`${circle_scale}px`, top:`${pos}px`, left:`${width+pos-2}px`}}/>
                <div className='absolute bg-white rounded-full' style={{width: `${circle_scale}px`, height:`${circle_scale}px`, top:`${height+pos-2}px`, left:`${pos}px`}}/>
                <div className='absolute bg-white rounded-full' style={{width: `${circle_scale}px`, height:`${circle_scale}px`, top:`${height+pos-2}px`, left:`${width+pos-2}px`}}/>
            </div>
        </div>
    )

}