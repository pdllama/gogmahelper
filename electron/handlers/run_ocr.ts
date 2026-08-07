import { createWorker } from 'tesseract.js';

let tesseract_worker : any|null = null

export default async function run_ocr(img_buffer:Buffer) {

    if (!tesseract_worker) {
        // console.time('import');
        // const { createWorker } = await import('tesseract.js');
        // console.timeEnd('import');
        // console.time('createWorker');
        tesseract_worker = await createWorker('eng');
        // console.timeEnd('createWorker')
    }

    try {
        const {data: {text}} = await tesseract_worker.recognize(img_buffer);
        return text.trim()
    } catch(error) {
        console.error("OCR Failed: ", error);
        return "";
    }
    

}