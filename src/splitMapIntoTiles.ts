import type { Logger } from "./logger";

export function splitMapIntoTiles(file: File | Blob, tileWidth: number, tileHeight: number, resolutionName: 0.5 | 1, logger: Logger): Promise<{name: string, blob: Blob}[]>{
  return new Promise(async(resolve, reject) => {
    const imageData = new Blob([await file.arrayBuffer()], { type: "image/png" });
    const imageURL = URL.createObjectURL(imageData);
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if(ctx === null) return reject("Your browser does not support this method of image resizing. If you're not on Safari... then something is wrong lol");

    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      
      const numberOfTilesX = image.width / tileWidth;
      const numberOfTilesY = image.height / tileHeight;
      
      if(!Number.isInteger(numberOfTilesX) || !Number.isInteger(numberOfTilesY)) return reject("Tile width and height do not produce an integer amount of tiles");

      logger.log(`Split map is ${numberOfTilesX}x${numberOfTilesY} tiles`);

      ctx.drawImage(image, 0, 0);

      const promises: Promise<{name: string, blob: Blob}>[] = [];

      for(let i = 0; i < numberOfTilesX; i++){
        for(let j = 0; j < numberOfTilesY; j++){
          const fileName = `tile_${i}_${j}@${resolutionName}x.png`;

          promises.push(new Promise((resolve, reject) => {
            const tile = document.createElement("canvas");
            const ctx = tile.getContext("2d")!;
            tile.width = tileWidth;
            tile.height = tileHeight;
            ctx.drawImage(canvas, i * tileWidth, j * tileHeight, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
            tile.toBlob(blob => {
              if(blob === null) return reject("Could not split map. HTML5 canvas data could not be turned into blob");
              resolve({name: fileName, blob});
            }, "image/png")
          }))
        }
      }

      Promise.all(promises).then(blobs => {
        URL.revokeObjectURL(imageURL);
        resolve(blobs);
      });
    }

    image.onerror = () => reject("Error resizing map. Maybe the uploaded image is invalid?");

    image.src = imageURL;
  })
}