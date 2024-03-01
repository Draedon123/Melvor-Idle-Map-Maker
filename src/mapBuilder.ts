import { extname } from "path";
import styles from "./style.css";
import { Application, Sprite, Texture, Container, Graphics, GraphicsGeometry, Point, Polygon } from "pixi.js";
import { Viewport } from "pixi-viewport";
import  { chunkData } from "./utils";

type CartesianCoordinate = {
  x: number,
  y: number,
}

type AxialCoordinate = {
  q: number,
  r: number,
}

export function initialiseMapBuilder(): void{
  const SQRT3 = 1.7320508075688772;
  const THIRD_PI = 1.0471975511965976;

  const FLAT_HEX_ORIENT = {
    forward: [
      [3 / 2, 0],
      [SQRT3 / 2, SQRT3],
    ],
    inverse: [
      [2 / 3, 0],
      [-1 / 3, SQRT3 / 3],
    ],
  } as const;

  class HexDisplay extends Container<Graphics>{
    constructor(public q: number, public r: number, public origin: CartesianCoordinate, template: Graphics){
      super();

      this.cullable = true;

      this.setGraphic(template.geometry).reposition(origin);
    }

    public setGraphic(geometry: GraphicsGeometry): HexDisplay{
      if(this.children.length > 0) this.removeChildAt(0).destroy();
      this.addChildAt(new Graphics(geometry), 0);
      return this;
    }

    public reposition(origin: CartesianCoordinate): HexDisplay{
      this.x = origin.x;
      this.y = origin.y;
      return this;
    }
  }

  const mapInput = document.getElementById("mapBuilderMapInput");
  const errorSpan = document.getElementById("mapBuilderMapInputError");
  const canvas = document.getElementById("mapBuilderCanvas");
  
  const app = new Application({
    view: canvas,
    resolution: Math.max(window.devicePixelRatio || 1, 2),
    resizeTo: window.pages["Map Builder"],
    autoDensity: true,
  })
  
  const viewport = new Viewport({
    events: app.renderer.events,
    screenWidth: canvas.offsetWidth,
    screenHeight: canvas.offsetHeight,
    worldWidth: 1000,
    worldHeight: 1000,
    passiveWheel: false,
  });

  viewport.sortableChildren = true;

  const hexLayer = new Container<HexDisplay>();
  const backgroundLayer = new Container<Sprite>();

  backgroundLayer.zIndex = 5;
  hexLayer.zIndex = 10;

  viewport.addChild(hexLayer, backgroundLayer);
  
  window.pages.addEventListener("Map Builder", "switchTo", () => app.resize());
  document.getElementById("mapBuilderHexCountX").addEventListener("change", updateHexLayer);
  document.getElementById("mapBuilderHexCountY").addEventListener("change", updateHexLayer);
  
  viewport.drag().decelerate({minSpeed: 0.3, friction: 0.96}).pinch().wheel({percent: 10});
  app.stage.addChild(viewport);
  
  let backgroundSprite: Sprite;
  const WORKER_COUNT = 2;
  
  mapInput.addEventListener("change", async() => {
    errorSpan.textContent = "";
    if(!mapInput.files?.length) return;
  
    if(WORKER_COUNT < 1 || !Number.isInteger(WORKER_COUNT)) throw new Error("Number of threads must be an integer greater than 0");
  
    const files = [...mapInput.files];
    const xValues: number[] = [];
    const yValues: number[] = [];
    for(const file of files){
      // validating file names
      const filenameSplit = file.name.split(/_|@/);
      if(!file.name.startsWith("tile")) return error(`File name invalid. File name must start with "tile" (case sensitive). Instead, it started with ${filenameSplit[0]}`);
      const x = parseFloat(filenameSplit[1]);
      const y = parseFloat(filenameSplit[2]);
      xValues.push(x);
      yValues.push(y);
      if(isNaN(x) || isNaN(y) || !Number.isInteger(x) || !Number.isInteger(y)) return error(`X and Y must be integers. ie, with x = 1 and y = 2, tile_1_2@0.5x.basis`);
      if(filenameSplit[3].slice(0, 4) !== "0.5x" && filenameSplit[3].slice(0, 2) !== "1x") return error(`File resolution must be either 0.5. ie, tile_0_0@0.5x.basis`);
      if(extname(file.name) !== ".basis") return error("File must be a basis file. These can be generated from png files in the File Generator tab");
    }
  
    const tilesX = Math.max(...xValues) + 1;
    const tilesY = Math.max(...yValues) + 1;
  
    const tiles = {
      tileHeight: 0,
      tileWidth: 0,
      tiles: [] as {x: number, y: number, texture: HTMLImageElement}[],
    }
  
    const toBeTranscoded: {file: File, name: string}[] = [];
  
    for(let x = 0; x < tilesX; x++) for(let y = 0; y < tilesY; y++){
      const file = files.find(file => {
        const position = getXAndYFromFilename(file.name);
        return position.x === x && position.y === y;
      });
  
      if(file === undefined) return error(`Missing basis file at position x = ${x}, y = ${y}`);
      toBeTranscoded.push({file, name: `${x}_${y}`});
    }

    for(const child of viewport.children) (child as Container).removeChildren().forEach(child => child.destroy());
    
    await transcodeBasisFiles(toBeTranscoded, WORKER_COUNT);
    
    const textureCanvas = document.createElement("canvas");
    const ctx = textureCanvas.getContext("2d");
    if(ctx === null) return error("HTML5 2D canvas not supported");

    textureCanvas.width = tiles.tileWidth * tilesX;
    textureCanvas.height = tiles.tileHeight * tilesY;
  
    for(const tile of tiles.tiles) ctx.drawImage(tile.texture, tile.x * tiles.tileWidth, tile.y * tiles.tileHeight);
  
    const texture = Texture.from(textureCanvas);
    const devicePixelRatio = Math.max(window.devicePixelRatio || 1, 2);
    const longestSide = Math.max(canvas.width, canvas.height) / devicePixelRatio;
    const scaleFactor = Math.min((canvas.width / devicePixelRatio) / texture.width, (canvas.height / devicePixelRatio) / texture.height);
    
    backgroundSprite = new Sprite(texture);
    
    backgroundSprite.setTransform(0, 0);

    backgroundSprite.width = texture.width * scaleFactor;
    backgroundSprite.height = texture.height * scaleFactor;

    backgroundLayer.width = backgroundSprite.width;
    backgroundLayer.height = backgroundSprite.height;

    hexLayer.width = backgroundSprite.width;
    hexLayer.height = backgroundSprite.height;

    backgroundLayer.setTransform(0, 0);
    hexLayer.setTransform(0, 0);

    viewport.worldWidth = longestSide;
    viewport.worldHeight = longestSide;

    backgroundLayer.addChild(backgroundSprite);
    viewport.addChild(backgroundLayer, hexLayer);
    viewport.setTransform((canvas.width / devicePixelRatio - viewport.width) / 2, (canvas.height / devicePixelRatio - viewport.height) / 2, 1, 1);

    updateHexLayer();
  
    function transcodeBasisFiles(array: {file: File, name: string}[], chunks: number): Promise<void>{
      return new Promise<void>(async(resolve, reject) => {
        const workers: Worker[] = [];
        const basisFileCount = array.length;
        const arrayLength = array.length;

        for(let i = 0; i < WORKER_COUNT; i++) workers.push(new Worker("basisWorker.js"));

        const chunkedData = chunkData(array, chunks);
        let filesTranscoded = 0;

        const progressBar = document.getElementById("mapBuilderCanvasProgressBarFill");
        const progressBarContainer = document.getElementById("mapBuilderCanvasLoading");
        progressBarContainer.classList.remove(styles.hidden);
        
        for(let i = 0; i < WORKER_COUNT; i++){
          const worker = workers[i];
          const canvas = new OffscreenCanvas(0, 0);

          worker.addEventListener("message", (message: MessageEvent<TranscodingMessageFromWorker | ErrorMessageFromWorker>) => {
            const { data } = message;

            if(data.status === "error") return reject("Error while transcoding .basis file: " + data.error);

            const image = document.createElement("img");
            image.onload = () => {
              tiles.tileHeight = image.height;
              tiles.tileWidth = image.width;

              tiles.tiles.push({
                x: parseInt(data.name.split("_")[0]),
                y: parseInt(data.name.split("_")[1]),
                texture: image,
              })

              URL.revokeObjectURL(data.blobURL);

              filesTranscoded++;

              progressBar.style.width = `${(filesTranscoded / arrayLength) * 100}%`;

              if(filesTranscoded === basisFileCount){
                progressBar.style.width = `100%`;
                progressBarContainer.classList.add(styles.fadeOut2Seconds);
                setTimeout(() => {
                  progressBarContainer.classList.add(styles.hidden);
                  progressBarContainer.classList.remove(styles.fadeOut2Seconds);
                  progressBar.style.width = "0";
                }, 5000);
                for(const worker of workers) worker.terminate();
                resolve();
              };
            }
            image.src = data.blobURL;
          })
          const data: TranscodingMessageForWorker = {
            canvas,
            data: chunkedData[i],
            mode: "transcode",
          }
          worker.postMessage(data, [canvas]);
        }
      })
    }
  })
  
  function error(message: string): void{
    errorSpan.textContent = message;
  }
  
  function getXAndYFromFilename(filename: string): CartesianCoordinate{
    const filenameSplit = filename.split(/_|@/);
    return {x: parseInt(filenameSplit[1]), y: parseInt(filenameSplit[2])};
  }

  function getHexScale(tileCount: CartesianCoordinate, mapDimensions: CartesianCoordinate): CartesianCoordinate{
    const hexScale = {x: 1, y: 1};
    hexScale.x = (mapDimensions.x / ((tileCount.x - 0.5 * Math.floor(tileCount.x / 2)) + (tileCount.y % 2 === 0 ? 0.25 : 0))) / 2;
    hexScale.y = mapDimensions.y / (tileCount.y * SQRT3);
    return hexScale;
  }

  function getHexVertices(hexScale: CartesianCoordinate): CartesianCoordinate[]{
    const points: CartesianCoordinate[] = [];
    for(let i = 0; i < 6; i++){
      const theta = i * THIRD_PI;
      
      const x = hexScale.x * Math.cos(theta) * 0.5;
      const y = hexScale.y * Math.sin(theta) * 0.5;

      points.push({ x, y });
    }
    return points;
  }

  function updateHexLayer(): void{
    if(!backgroundSprite) return;

    const hexesX = parseInt(document.getElementById("mapBuilderHexCountX").value);
    const hexesY = parseInt(document.getElementById("mapBuilderHexCountY").value);

    if(isNaN(hexesX) || isNaN(hexesY)) return;

    hexLayer.removeChildren().forEach(child => child.destroy());

    const hexScale = getHexScale({x: hexesX, y: hexesY}, {x: backgroundSprite.texture.width, y: backgroundSprite.texture.height});
    const hexVertices = getHexVertices(hexScale);
    const origin = {
      x: hexScale.x,
      y: hexScale.y * SQRT3 / 2,
    }

    const graphics = new Graphics();
    graphics.lineStyle({
      width: Math.max(backgroundSprite.texture.width, backgroundSprite.texture.height) / 5000,
      color: 0xffffff,
      alpha: 1,
      alignment: 0,
    })
    .beginFill(0, 0)
    .drawPolygon(hexVertices)
    .endFill();

    for(let x = 0; x < hexesX; x++){
      for(let y = 0; y < hexesY; y++){
        if(x % 2 === 1 && y === hexesY - 1) continue;
        const { q, r } = odd_q_to_axial(x, y);
        const { x: originX, y: originY } = getHexOrigin({ q, r }, hexScale, origin);
        const hexDisplay = new HexDisplay(q, r, { x: originX, y: originY }, graphics);
        hexLayer.addChild(hexDisplay);
      }
    }
    hexLayer.width = backgroundLayer.width;
    hexLayer.height = backgroundLayer.height;
  }

  // @ts-expect-error
  window.updateHexLayer = updateHexLayer;

  function getHexOrigin(axialCoordinates: AxialCoordinate, hexScale: CartesianCoordinate, mapOrigin: CartesianCoordinate): CartesianCoordinate{
    const x = ((FLAT_HEX_ORIENT.forward[0][0] * axialCoordinates.q + FLAT_HEX_ORIENT.forward[0][1] * axialCoordinates.r) * hexScale.x + mapOrigin.x) / 2;
    const y = ((FLAT_HEX_ORIENT.forward[1][0] * axialCoordinates.q + FLAT_HEX_ORIENT.forward[1][1] * axialCoordinates.r) * hexScale.y + mapOrigin.y) / 2;
    return { x, y };
  }

  function odd_q_to_axial(column: number, row: number): AxialCoordinate{
    const q = column;
    const r = row - (column - (column & 1)) / 2;
    return { q, r };
  }

  // i think the game uses odd_q instead of even_q (vertical)
  // you can find the difference here
  // https://www.redblobgames.com/grids/hexagons/#coordinates-offset
  function even_q_to_axial(column: number, row: number): AxialCoordinate{
    const q = column;
    const r = row - (column + (column & 1)) / 2;
    return { q, r };
  }

  // @ts-ignore
  window.updateHexLayer = updateHexLayer;
}