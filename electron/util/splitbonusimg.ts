import { nativeImage } from "electron";
import { writeFileSync } from "fs";

// Splits the Image Buffer sent by the renderer into 5 different parts (for each bonus) and returns the result.
// export default function splitBonusImg(img_buffer:Buffer) {
//     const stepCount = img_buffer.length/5
//     let start = 0;
//     let end = stepCount
//     const diffBuffers = []
//     for (let i = 0; i < 5; i++) {
//         diffBuffers.push(img_buffer.slice(start, end));
//         start+=stepCount;
//         end+=stepCount;
//     }
//     console.log(diffBuffers)
//     return diffBuffers
// }



export default function splitImageBuffer(img_buffer:Buffer) {
    const fullImage = nativeImage.createFromBuffer(img_buffer, {width: 350, height: 160})

    // Each pixel consists of 4 bytes: Red, Green, Blue, Alpha
    const bytesPerPixel = 3; 
    const rowLengthInBytes = 350 * bytesPerPixel;
    
    // Calculate base rows per piece and the remainder
    const baseRowsPerPiece = Math.floor(160 / 5);
    let remainderRows = 160 % 5;
    let currentTop = 0;
    
    const pieces = [];
    
    for (let i = 0; i < 5; i++) {
        // Distribute remainder rows evenly among the first few pieces
        const currentPieceHeight = baseRowsPerPiece + (remainderRows > 0 ? 1 : 0);
        remainderRows--;

        
        
        // // Calculate byte offsets for slicing
        // const startByte = currentRow * rowLengthInBytes;
        // const endByte = startByte + (currentPieceHeight * rowLengthInBytes);
        
        // // Use .subarray() to avoid copying memory needlessly
        // const bufferChunk = img_buffer.subarray(startByte, endByte);

        
        const croppedZone = fullImage.crop({
            x: 0,
            y: currentTop,
            width: 350,
            height: currentPieceHeight
        });
        const outputPngBuffer = croppedZone.toPNG();
        // writeFileSync(`bonus_${i+1}.png`, outputPngBuffer);

        
        pieces.push({
            buffer: outputPngBuffer,
            width: 350,
            height: currentPieceHeight
        });

        currentTop += currentPieceHeight;
    }
    
    return pieces;
}