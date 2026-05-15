// This class handles the entire screen reading loop and logic.
// The pipeline for screen reading is as follows:
//      1. Generate the loop 

export type video_region = {
    x: number, y: number, width:number, height:number, scale:number
}

export default class VideoProcessor {
    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    private canvas2: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private ctx2: CanvasRenderingContext2D;
    private animationFrame: number | null = null;
    private region:video_region; // The Region 

    private ocrActive:boolean = false
    private pixelThreshold:number = 0.08 // if 8% of pixels match the target blue in the detection area then we run ocr.

    private last_time = 0;
    private FPS = 5;
    private frameTime = 1000/this.FPS;

    private readDelay = 0.5;

    constructor(
        video:HTMLVideoElement,
        canvas: HTMLCanvasElement,
        canvas2: HTMLCanvasElement,
        region:video_region
    ) {
        this.video = video;
        this.canvas = canvas;
        this.canvas2 = canvas2;
        this.region = {x: region.x, y: region.y, width: region.width/region.scale, height:region.height/region.scale, scale: region.scale}

        const ctx = canvas.getContext("2d", {willReadFrequently:true})

        if (!ctx) {
            throw new Error("Could not get canvas context");
        }
        ctx.imageSmoothingEnabled = false;
        this.ctx = ctx

        const ctx2 = canvas2.getContext("2d", {willReadFrequently:true})

        if (!ctx2) {
            throw new Error("Could not get canvas context");
        }
        ctx2.imageSmoothingEnabled = false;
        this.ctx2 = ctx2

    }

    start() {
        this.processFrames(0);
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    private processFrames = (now:number) => {
        
        this.ctx.drawImage(
            this.video, 
            this.region.x, this.region.y,
            this.region.width, this.region.height, 
            0, 0, 
            this.canvas.width, this.canvas.height
        )

        if (((now - this.last_time) >= this.frameTime) && !this.ocrActive) {
            this.last_time = now
            this.detectRollOccurred();
        }
        this.animationFrame = this.video.requestVideoFrameCallback(this.processFrames);
    }

    // This function detects if a pixel is the bright saturated blue that occurs on the left side of a roll when it happens.
    // In skill rolls and non-EX bonus rolls, this appears as a bright blue, but for EX bonus rolls, it is pure white.
    // We just check if either of those happen.
    private detectRoll = (r:number, g:number, b:number):boolean => {
        return this.detectBlueFlash(r, g, b) || this.detectEXRoll(r, g, b)
    }

    private detectBlueFlash = (r:number, g:number, b:number):boolean => {
        return (r < 80 && g > 180 && b > 180)
    }

    // I could set up an EX roll detection so that, if theres no ex roll for that specific roll, the read delay can be shorter.
    // This is because the roll animation is longer when theres an ex roll.
    // With the current default, the program can still decipher rolls with the delay even if the user instantly clicks "no" to apply asap, but not if theres no ex rolls
    // There's also other considerations like if its an all ex roll (and the delay starts when the ex flash occurs).
    // The only solution right now is that users will have to wait half a second longer to say no if theres no ex rolls, but im thinking that could get really annoying.
    // But there could be a detection script applied for that later on.
    private detectEXRoll = (r:number, g:number, b:number):boolean => {
        return (r > 220 && g > 220 && b > 220)
    }

    private detectRollOccurred = () => {
        const imageData = this.ctx.getImageData(0, 0, 20, this.region.height);
        
        const data = imageData.data;

        let matchingPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (this.detectRoll(r, g, b)) {
                matchingPixels++;
            }
        }

        const totalPixelCount = data.length/4

        const percent_blue = matchingPixels/totalPixelCount;

        if (percent_blue >= this.pixelThreshold) {
            this.ocrActive = true;
            setTimeout(() => {
                // const img = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
                this.ctx2.drawImage(
                    this.video, 
                    this.region.x, this.region.y,
                    this.region.width, this.region.height, 
                    0, 0, 
                    this.canvas2.width, this.canvas2.height
                )
                this.ocrActive = false;
            }, this.readDelay*1000)
        }

    }

    private get_video_scale_x_and_y() {
        const videoRect = this.video.getBoundingClientRect();

        const displayedWidth = videoRect.width;
        const displayedHeight = videoRect.height;

        const scaleX = this.video.videoWidth / displayedWidth;
        const scaleY = this.video.videoHeight / displayedHeight;


        return {scaleX, scaleY}
    }
}