import { createWorker, PSM } from 'tesseract.js';
import { roll_type } from '@custom_types/rolltype';
import splitBonusImg from '../util/splitbonusimg';

let tesseract_worker : any|null = null

export default async function run_ocr(img_buffer:Buffer, rollType:roll_type) {
    // uncomment below to have it write a png file to see the exact image it is reading from. 
    // roll.png and roll2.png (in root dir) gives an idea of the skill/bonus roll images respectively
    // await writeFileSync('img.png', img_buffer); 

    if (!tesseract_worker) {

        tesseract_worker = await createWorker('eng');
        await tesseract_worker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_BLOCK
        })
    }

    try {
        if (rollType === roll_type.SKILLS) {
            const {data: {text}} = await tesseract_worker.recognize(img_buffer);
            return text.trim()
        } else {
            // Divide the bonus img into equal fives to get each bonus
            const img_buffers = splitBonusImg(img_buffer);
            const texts = []
            for (let i = 0; i < 5; i++) {
                const b = img_buffers[i]
                // const fullimage = nativeImage.createFromBuffer(img_buffers[i].buffer, {width: img_buffers[i].width, height: img_buffers[i].height})
                // await writeFileSync(`bonus${i+1}.png`, fullimage.toPNG());
                const {data: {text}} = await tesseract_worker.recognize(b.buffer);
                texts.push(text.trim())
            }
            return texts
        }
    } catch(error) {
        console.error("OCR Failed: ", error);
        return "";
    }
    

}