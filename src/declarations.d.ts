declare module "*.css"{
  const styles: {
    [key: string]: string,
  }
  export default styles;
}

type Page = "File Generator" | "Map Builder" | "Help";

interface Window{
  pages: {
    "File Generator": HTMLDivElement,
    "Map Builder": HTMLDivElement,
    "Help": HTMLDivElement,
    switchPage: (pageName: string) => void,
    addEventListener: (page: Page, on: "switchTo" | "switchFrom", callback: () => void) => void,
    eventListeners: {page: Page, on: "switchTo" | "switchFrom", callback: () => void}[],
  }
}

interface Document{
  getElementById(elementID: "mainContainer"): HTMLDivElement,
  getElementById(elementID: "navigationBar"): HTMLDivElement,

  getElementById(elementID: "fileGenerator"): HTMLDivElement,
  getElementById(elementID: "fileGeneratorMain"): HTMLDivElement,
  getElementById(elementID: "fileGeneratorMapInput"): HTMLInputElement,
  getElementById(elementID: "fileGeneratorTileWidthInput"): HTMLInputElement,
  getElementById(elementID: "fileGeneratorTileHeightInput"): HTMLInputElement,
  getElementById(elementID: "fileGeneratorThreadsInput"): HTMLInputElement,
  getElementById(elementID: "fileGeneratorSubmit"): HTMLButtonElement,
  getElementById(elementID: "fileGeneratorDownload"): HTMLButtonElement,

  getElementById(elementID: "mapBuilder"): HTMLDivElement,
  getElementById(elementID: "mapBuilderCanvasContainer"): HTMLDivElement,
  getElementById(elementID: "mapBuilderCanvas"): HTMLCanvasElement,
  getElementById(elementID: "mapBuilderCanvasProgressBar"): HTMLDivElement,
  getElementById(elementID: "mapBuilderCanvasProgressBarFill"): HTMLDivElement,
  getElementById(elementID: "mapBuilderCanvasLoading"): HTMLDivElement,
  getElementById(elementID: "mapBuilderCanvasLoadingText"): HTMLDivElement,
  getElementById(elementID: "mapBuilderToolbar"): HTMLDivElement,
  getElementById(elementID: "mapBuilderToolbarGeneral"): HTMLDivElement,
  getElementById(elementID: "mapBuilderToolbarGeneralForm"): HTMLDivElement,
  getElementById(elementID: "mapBuilderToolbarMetadata"): HTMLDivElement,
  getElementById(elementID: "mapBuilderToolbarMetadataForm"): HTMLDivElement,
  getElementById(elementID: "mapBuilderToolbarFilters"): HTMLDivElement,
  getElementById(elementID: "mapBuilderToolbarFiltersForm"): HTMLDivElement,
  getElementById(elementID: "mapBuilderToolbarFiltersFormHexGrid"): HTMLInputElement,
  getElementById(elementID: "mapBuilderMapInput"): HTMLInputElement,
  getElementById(elementID: "mapBuilderHexCountX"): HTMLInputElement,
  getElementById(elementID: "mapBuilderHexCountY"): HTMLInputElement,
  getElementById(elementID: "mapBuilderHexCountXLabel"): HTMLLabelElement,
  getElementById(elementID: "mapBuilderHexCountYLabel"): HTMLLabelElement,
  getElementById(elementID: "mapBuilderMapInputError"): HTMLSpanElement,

  getElementById(elementID: "help"): HTMLDivElement,
  getElementById(elementID: "helpContainer"): HTMLDivElement,
  getElementById(elementID: "helpContainerFileGeneration"): HTMLDivElement,
  getElementById(elementID: "helpContainerFileGenerationHeader"): HTMLDivElement,
  getElementById(elementID: "helpContainerFileGenerationContent"): HTMLDivElement,
  getElementById(elementID: "helpContainerMapBuilder"): HTMLDivElement,
  getElementById(elementID: "helpContainerMapBuilderHeader"): HTMLDivElement,
  getElementById(elementID: "helpContainerMapBuilderContent"): HTMLDivElement,

  getElementById(elementID: "version"): HTMLDivElement,
}

type MessageForWorker = EncodingMessageForWorker | TranscodingMessageForWorker

type EncodingMessageForWorker = {
  mode: "encode",
  data: {name: string, texture: Blob}[],
}

type TranscodingMessageForWorker = {
  mode: "transcode",
  data: {name: string, file: File}[],
  canvas: OffscreenCanvas,
}

type EncodingMessageFromWorker = {
  name: string,
  texture: Uint8Array,
  status: "completed",
}

type TranscodingMessageFromWorker = {
  name: string,
  blobURL: string,
  status: "completed",
}

type ErrorMessageFromWorker = {
  error: string,
  status: "error",
}