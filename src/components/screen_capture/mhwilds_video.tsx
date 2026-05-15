import { useEffect, useRef } from "react";
import start_capture from "@app/screen_capture/start_capture";
import VideoProcessor from "@app/screen_capture/videoprocessor";
import { video_region } from "@app/screen_capture/videoprocessor";

type MHWildsVideoProps = video_region & {
    get_processor: (v:VideoProcessor) => void
}

export default function MhWildsVideo({x=1030, y=358, width=350, height=70, scale=1.55, get_processor=(v:VideoProcessor) => {}}:Partial<MHWildsVideoProps>) {

    const video_ref = useRef(null)
    const canvas_ref = useRef(null)
    const canvas2_ref = useRef(null)

    const processor_ref = useRef<VideoProcessor|null>(null)
    
    
    useEffect(() => {
        try {
            if (video_ref.current !== null) {
            const canvas = canvas_ref.current! as HTMLCanvasElement;
            const canvas2 = canvas2_ref.current! as HTMLCanvasElement;
            // button_ref.current!.click();
            start_capture(video_ref.current as HTMLVideoElement, canvas)
            const processor = new VideoProcessor(video_ref.current, canvas, canvas2, {x, y, width, height, scale});
            processor_ref.current = processor;
            get_processor(processor)
            
            return () => processor_ref.current!.stop()

            } else {
                console.log("NULL VIDEO ELEMENT??")
            }
        } catch (e:any) {
            console.log("RENDERER ERROR: ", e)
        }
        return undefined
    }, [])
    

    return (
        <>
        <div className='overflow-hidden overflow-x-hidden relative' style={{width, minWidth: width, height, minHeight: height}}>
        <video 
            ref={video_ref}
            onPlay={(e:React.SyntheticEvent<HTMLVideoElement, Event>) => {
                processor_ref.current?.start()
            }}
            onEnded={(_) => processor_ref.current?.stop()}
            onPause={(_) => processor_ref.current?.stop()}
            className='w-[1280px] h-[720px] max-w-none max-h-none absolute'
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                left: `${-1*(x*scale)}px`, 
                top: `${-1*(y*scale)}px`,
            }}
        ></video>
        </div>
        <canvas ref={canvas_ref} style={{width, height, minWidth: width, minHeight: height}}/>
        <canvas ref={canvas2_ref} style={{width, height, minWidth: width, minHeight: height}}/>
        </>
    )
}