import styles from "./style.css"
import { splitMapIntoTiles } from "./splitMapIntoTiles";
import { resizeImage } from "./resizeMap";
import { Logger } from "./logger";
import { downloadZip } from "client-zip";
import { chunkData } from "./utils";

export function initialiseFileGenerator(): void{
  const loggerElement = document.createElement("div");
  loggerElement.classList.add(styles.logger);
  window.pages["File Generator"].append(loggerElement, document.createElement("br"));
  
  const logger = new Logger(loggerElement);
  const submitButton = document.getElementById("fileGeneratorSubmit");
  const mapInput = document.getElementById("fileGeneratorMapInput");
  const tileWidthInput = document.getElementById("fileGeneratorTileWidthInput");
  const tileHeightInput = document.getElementById("fileGeneratorTileHeightInput");
  const threadsInput = document.getElementById("fileGeneratorThreadsInput");
  const downloadButton = document.getElementById("fileGeneratorDownload");
  
  submitButton.addEventListener("click", async() => {
    const WORKER_COUNT = parseInt(threadsInput.value);
    if(WORKER_COUNT < 1 || !Number.isInteger(WORKER_COUNT)) return logger.error("Number of threads must be an integer greater than 0");
  
    const mapFiles = mapInput.files!;
    if(mapFiles!.length === 0) return logger.error("Files Missing");
  
    const fullResolutionMap = mapFiles[0];
    logger.log("Scaling map down to half size");
    const halfResolutionMap: Blob = await resizeImage(fullResolutionMap, 0.5);
  
    const TILE_WIDTH = parseInt(tileWidthInput.value);
    const TILE_HEIGHT = parseInt(tileHeightInput.value);
  
    if(isNaN(TILE_WIDTH) || TILE_WIDTH <= 0) return logger.error("Invalid tile width");
    if(isNaN(TILE_HEIGHT) || TILE_HEIGHT <= 0) return logger.error("Invalid tile height");

    if(TILE_WIDTH % 8 !== 0 || TILE_HEIGHT % 8 !== 0) return logger.error("Tile dimensions must be a multiple of 8");
    if(TILE_WIDTH > 2000 || TILE_HEIGHT > 2000) return logger.error("Tile dimensions must not exceed 2000x2000 pixels");
  
    logger.horizontalLine()
    .log("Splitting full size map")
    .horizontalLine();

    const fullSizeSplitData = await splitMapIntoTiles(fullResolutionMap, TILE_WIDTH, TILE_HEIGHT, 1, logger).catch(error => {
      const errorMessage = "Error while splitting full size map: " + error;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    });
  
    logger.horizontalLine()
    .log("Splitting half size map")
    .horizontalLine();

    const halfSizeSplitData = await splitMapIntoTiles(halfResolutionMap, TILE_WIDTH / 2, TILE_HEIGHT / 2, 0.5, logger).catch(error => {
      const errorMessage = "Error while splitting half size map: " + error;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    });
  
    if(fullSizeSplitData === undefined || halfSizeSplitData === undefined || fullSizeSplitData.length === 0 || halfSizeSplitData.length === 0) return logger.error("Error splitting maps");
  
    logger.log("Maps have been split", "Now converting files to .basis files")
    .horizontalLine()
    .log("Converting full size map tiles to .basis files", "The files being converted out of order is not a bug, so don't worry. The conversion isn't a fast process either.")
    .horizontalLine();
  
    const workers: Worker[] = [];
    for(let i = 0; i < WORKER_COUNT; i++) workers.push(new Worker("basisWorker.js"));

    function processBasisFiles(array: {name: string, texture: Blob}[], workerCount: number): Promise<{name: string, data: Uint8Array}[]>{
      return new Promise<{name: string, data: Uint8Array}[]>(async(resolve, reject) => {
        const basisFiles: {name: string, data: Uint8Array}[] = [];
        const textureCount = array.length;
        const chunks = chunkData(array, workerCount);
        const numberOfFilesConverted = {
          _count: 0,
          get count(): number{
            return this._count;
          },
          increment: function(): number{
            this._count++;
            if(this._count === textureCount) for(const worker of workers) worker.removeEventListener("message", workerOnMessage);
            return this.count;
          }
        }

        function workerOnMessage(message: MessageEvent<EncodingMessageFromWorker | ErrorMessageFromWorker>){
          const { data } = message;
          if(data.status === "error") return reject(`Error while encoding basis file: ${data.error}`);
          basisFiles.push({name: data.name, data: data.texture});
          logger.log(`${numberOfFilesConverted.increment()}/${textureCount} converted to .basis. File name: ${data.name}`);
          if(numberOfFilesConverted.count === textureCount) resolve(basisFiles);
        }

        for(let i = 0; i < workerCount; i++){
          const worker = workers[i];
          worker.addEventListener("message", workerOnMessage);
          const data: EncodingMessageForWorker = {
            mode: "encode",
            data: chunks[i],
          }
          worker.postMessage(data);
        }
      })
    }
  
    const fullSizeStart = Date.now();
    const fullSizeBasisFiles = await processBasisFiles(fullSizeSplitData.map(tile => {return {name: tile.name, texture: tile.blob}}), WORKER_COUNT).catch(reason => void logger.error(reason));
    if(!fullSizeBasisFiles) return;
    const fullSizeEnd = Date.now();
    logger.log(`Took ${(fullSizeEnd - fullSizeStart) / 1000} seconds to convert all ${fullSizeBasisFiles.length} full-size files`)

    .horizontalLine()
    .log("Converting half size map tiles to .basis files")
    .horizontalLine();
  
    const halfSizeStart = Date.now();
    const halfSizeBasisFiles = await processBasisFiles(halfSizeSplitData.map(tile => {return {name: tile.name, texture: tile.blob}}), WORKER_COUNT).catch(reason => void logger.error(reason));
    if(!halfSizeBasisFiles) return;
    const halfSizeEnd = Date.now();
    logger.log(`Took ${(halfSizeEnd - halfSizeStart) / 1000} seconds to convert all ${halfSizeBasisFiles.length} half-size files`);

    for(const worker of workers) worker.terminate();
  
    logger.log("Zipping up all the files");
  
    const fullSizeBasisBlobs: File[] = [];
    const halfSizeBasisBlobs: File[] = [];
    const fullSizePNGFiles: File[] = [];
  
    for(const file of fullSizeBasisFiles) fullSizeBasisBlobs.push(new File([file.data], file.name.split(".png")[0] + ".basis"));
    for(const file of halfSizeBasisFiles) halfSizeBasisBlobs.push(new File([file.data], file.name.split(".png")[0] + ".basis"));
    for(const file of fullSizeSplitData) fullSizePNGFiles.push(new File([file.blob], file.name));
  
    const fullSizeZipFile = await downloadZip(fullSizeBasisBlobs).blob();
    const halfSizeZipFile = await downloadZip(halfSizeBasisBlobs).blob();
    const PNGZipFile = await downloadZip(fullSizePNGFiles).blob();
  
    const zipFile = await downloadZip([
      {
        name: "1xBasis.zip",
        input: fullSizeZipFile,
      }, {
        name: "0.5xBasis.zip",
        input: halfSizeZipFile,
      }, {
        name: "PNGs.zip",
        input: PNGZipFile,
      }
    ]).blob();
    const anchor = document.createElement("a");
    const zipFileURL = URL.createObjectURL(zipFile);
    anchor.href = zipFileURL;
    anchor.download = `${fullResolutionMap.name.slice(0, fullResolutionMap.name.length - 4)}.zip`;
  
    logger.log("Files zipped up. Click the button to download! It should be next to the Create Files button");
  
    downloadButton.disabled = false;
    downloadButton.onclick = () => anchor.click();
  })
}