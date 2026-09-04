// This class handles the entire screen reading loop and logic.
// The pipeline for screen reading is as follows:
//      1. Generate the loop 

import { CaptureStore } from "@app/capture_store";
import { MainStore } from "@app/main_store";
import {saveAmendRollToDb, saveSkillRollToDb, } from "@app/store_actions/videodetection/registerroll";
import { group_bonus_skill, set_bonus_skill, skill_roll, bonus_roll, keep_bonus_roll, roll_type } from "@custom_types/rolltype";
import { weapons } from "@custom_types/weapons";
import { elements } from "@custom_types/element";
import { parseBonusRoll } from "./parsers";
import React from "react";
import { editRollState } from "../../main/window/rollscreen";

const set_bonus_arr = Object.values(set_bonus_skill)
const group_bonus_arr = Object.values(group_bonus_skill)

type region = {
    x: number, y: number, width:number, height:number, 
}

type misc_options = {
    canvas_fps: number,
    pixel_threshold: number, 
    read_delay: number
}
 
export type saveRollTools = {
    profile_id: number|undefined,
    roll_exists: boolean,
    rollType: roll_type,
    roll_num: number,
    w:weapons|null,
    e:elements|null,
    insertRollIntoState: (roll:skill_roll|bonus_roll|keep_bonus_roll, roll_exists:boolean) => void;
    add_roll_to_state: MainStore["add_roll_to_stats"]|MainStore["add_keep_roll_to_stats"]
    increment_roll_num: MainStore["increment_roll"]
    update_last_roll: CaptureStore["set_last_skill_roll"]|CaptureStore["set_last_amend_roll"]|CaptureStore["set_last_keep_roll"]
    insert_capture_error: CaptureStore["insert_capture_error"],
    setEditRoll: React.Dispatch<React.SetStateAction<editRollState>>
}

export type video_region = region & {
    scale:number
}

export default class VideoProcessor {
    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    // private test_canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D;
    // private test_ctx: CanvasRenderingContext2D;
    private animationFrame: number | null = null;
    private region:video_region; // The Region 
    private detection_region:region;

    private ocrActive:boolean = false // flag used to demarcate when the ocr is running the first time its detected and avoid repeat running on subsequent frames within the time frame
    private pixelThreshold:number; // if 8% of pixels match the target blue in the detection area then we run ocr.

    private last_time = 0;
    private FPS:number;
    private frameTime:number;

    private readDelay:number;

    private saveRollTools:saveRollTools|undefined;
    private rollType:roll_type;

    constructor(
        video:HTMLVideoElement,
        canvas: HTMLCanvasElement,
        // test_canvas: HTMLCanvasElement,
        region:video_region, // equivalent to the display 
        detection_region:region,
        misc_options:misc_options,
        saveRollTools:saveRollTools
    ) {
        this.video = video;
        this.canvas = canvas;
        // this.test_canvas = test_canvas
        this.region = {x: region.x, y: region.y, width: region.width/region.scale, height:region.height/region.scale, scale: region.scale}
        this.detection_region = detection_region
        this.pixelThreshold = misc_options.pixel_threshold
        this.FPS = misc_options.canvas_fps
        this.frameTime = 1000/this.FPS
        this.readDelay = misc_options.read_delay
        this.saveRollTools = saveRollTools
        this.rollType = !saveRollTools ? roll_type.BONUSES : saveRollTools.rollType;

        const ctx = canvas.getContext("2d", {willReadFrequently:true})

        if (!ctx) {
            throw new Error("Could not get canvas context");
        }
        ctx.imageSmoothingEnabled = false;
        this.ctx = ctx

        // const test_ctx = test_canvas.getContext("2d", {willReadFrequently:false})

        // if (!test_ctx) {
        //     throw new Error("Could not get canvas context");
        // }
        // test_ctx.imageSmoothingEnabled = false;
        // this.test_ctx = test_ctx

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
        const imageData = this.ctx.getImageData(
            this.detection_region.x, this.detection_region.y, 
            this.detection_region.width, this.detection_region.height
        );
        
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
                
                /* Perform OCR */
                this.perform_ocr()

            
            }, this.readDelay*1000)
        }

    }

    public updateRollTools = (
        profile_id: number|undefined,
        roll_exists: boolean,
        rollType: roll_type,
        roll_num: number
    ) => {
        if (this.saveRollTools) {
            this.saveRollTools.profile_id = profile_id
            this.saveRollTools.roll_exists = roll_exists
            this.saveRollTools.rollType = rollType
            this.saveRollTools.roll_num = roll_num
        }
    }

    private perform_ocr = async() => {
        const blob = await new Promise<Blob|null>(resolve => this.canvas.toBlob(resolve, 'image/png'));
        // this.test_ctx.drawImage(
        //     this.video, 
        //     this.region.x, this.region.y,
        //     this.region.width, this.region.height, 
        //     0, 0, 
        //     this.test_canvas.width, this.test_canvas.height
        // )

        // 2. Convert Blob to an ArrayBuffer
        const arrayBuffer : ArrayBuffer = await blob!.arrayBuffer();
        
        // 3. Wrap it in a Uint8Array (Electron automatically converts this to a Node Buffer on the other side)
        const imageBuffer = new Uint8Array(arrayBuffer);
        const ocr_result = await window.ipcRenderer.run_ocr(imageBuffer, this.rollType)

        const text = this.rollType === roll_type.SKILLS ? ocr_result as string : ocr_result as string[]


        // The text comes out sometimes with random nonsense characters, so we have to filter it out.
        
        if (this.rollType === roll_type.SKILLS) {
            // NOTE: 1. sometimes they do not register spaces and the db dispatch (to do string.replace for ' sanitization) errors out
            //          ex Zoh Shia's Pulse -> ZohShia's Pulse
            //  2. it also sometimes messes up the spelling on some things. ex Guardian's Pulse -> Guardian's Patse
            //      2.5 sometimes this spelling is way off?? ex Guardian's SOMETHING -> Guardian's RTA??
            //      2.55 undercases some things. ex Imparted Wisdom => imparted wisdom
            //  3. it also sometimes uses the apostrophe ’‘ instead of ', which results in undefined and was frankly very confusing (this can be solved via .replace, though) ex. Fulgur Anjanath's Will -> Fulgur Anjanath’s Will
            //  4. sometimes it doesnt even scan the set bonus at all! ex one raw text was "p- Fortifying Pelt"
            // Not sure how to fix this issue. Appears to happen randomly. Probably cant be fixed, just need good error handling and user notification.
            const set_bonus = set_bonus_arr.filter((sbs:any) => text.includes(sbs))[0]
            const group_bonus = group_bonus_arr.filter((gs:any) => text.includes(gs))[0]
            
            const error = set_bonus === undefined || group_bonus === undefined
            if (error) {
                if (this.saveRollTools) {
                    const {increment_roll_num, update_last_roll, insert_capture_error, setEditRoll, roll_num, rollType} = this.saveRollTools
                    increment_roll_num(rollType)
                    update_last_roll(null)
                    insert_capture_error({roll_num, raw: text as string})
                    setEditRoll({curr: roll_num, roll: {roll_num, set_bonus: set_bonus === undefined ? "" : set_bonus, group_bonus: group_bonus === undefined ? "" : group_bonus}})
                }
            } else if (this.saveRollTools) {
                const {profile_id, roll_num, roll_exists, rollType, w, e, insertRollIntoState, add_roll_to_state, increment_roll_num, update_last_roll} = this.saveRollTools
                const roll = {roll_num: roll_num, set_bonus, group_bonus}
                
                saveSkillRollToDb(
                    roll, (profile_id as number), roll_exists, rollType, 
                    (w as weapons), (e as elements), 
                    insertRollIntoState, 
                    add_roll_to_state as MainStore["add_roll_to_stats"], 
                    increment_roll_num,
                    update_last_roll as (sr:skill_roll|null) => void
                );
            }
        } else {
            const parsed_roll = parseBonusRoll(text as string[], this.saveRollTools ? this.saveRollTools.roll_num : 0)
            if (parsed_roll.error_row) {
                if (this.saveRollTools) {
                    const {increment_roll_num, update_last_roll, insert_capture_error, setEditRoll, roll_num, rollType} = this.saveRollTools
                    increment_roll_num(rollType)
                    update_last_roll(null)
                    let raw = "";
                    (text as string[]).forEach((s:string, i:number) => {
                        if (i !== 0) {raw+="\n"}
                        raw+=s
                    })
                    insert_capture_error({roll_num, raw})
                    setEditRoll({curr: roll_num, roll: parsed_roll.r})
                }
            }
            else if (this.saveRollTools) {
                const {profile_id, roll_exists, rollType, w, e, insertRollIntoState, add_roll_to_state, increment_roll_num, update_last_roll} = this.saveRollTools
                
                saveAmendRollToDb(
                    parsed_roll.r as bonus_roll, (profile_id as number), roll_exists, rollType,
                    (w as weapons), (e as elements),
                    insertRollIntoState,
                    add_roll_to_state as MainStore["add_roll_to_stats"],
                    increment_roll_num,
                    update_last_roll as (br:bonus_roll|null) => void
                )

            }
        }
        this.ocrActive = false;
        
    }
}