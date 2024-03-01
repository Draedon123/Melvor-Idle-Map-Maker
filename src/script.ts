import styles from "./style.css";
import Moveable from "moveable";
import SimpleBar from "simplebar";
import { initialiseFileGenerator } from "./fileGenerator";
import { initialiseMapBuilder } from "./mapBuilder";

(() => {
const defaultPage = "File Generator";
const initalisationStatus = {
  "File Generator": false,
  "Map Builder": false,
}

window.pages = {
  "File Generator": document.getElementById("fileGenerator"),
  "Map Builder": document.getElementById("mapBuilder"),
  async switchPage(pageName){
    let hasSwitchedPage = false;
    for(const key of Object.keys(window.pages)){
      // @ts-ignore
      const page: HTMLDivElement = pages[key];
      
      if(page === undefined || typeof page === "function") return;

      if(key === pageName){
        page.classList.remove(styles.hidden);
        localStorage.setItem("s", key);
        hasSwitchedPage = true;

        switch(pageName){
          case "File Generator": {
            if(initalisationStatus["File Generator"] === false){
              initalisationStatus["File Generator"] = true;
              initialiseFileGenerator();
            }
            break;
          }
          case "Map Builder": {
            if(initalisationStatus["Map Builder"] === false){
              initalisationStatus["Map Builder"] = true;
              initialiseMapBuilder();
              initialiseToolbar();
              break;
            }
          }
        }
        for(const { callback } of this.eventListeners.filter(listener => listener.on === "switchTo" && listener.page === key)) callback();
      }
      else{
        page.classList.add(styles.hidden);
        for(const { callback } of this.eventListeners.filter(listener => listener.on === "switchFrom" && listener.page === key)) callback();
      }
    }
    if(!hasSwitchedPage) window.pages.switchPage(defaultPage), console.warn(`Page with name ${pageName} not found`);
  },
  addEventListener(page, on, callback) {
    this.eventListeners.push({page, on, callback});
  },
  eventListeners: [],
}

function init(): void{
  document.getElementById("mainContainer").classList.add(styles.mainContainer);
  const localStorageStartingPage = localStorage.getItem("s");
  const startingPage = localStorageStartingPage === null ? defaultPage : localStorageStartingPage;

  const navigationBar = document.getElementById("navigationBar");
  navigationBar.classList.add(styles.navigationBar);

  for(const key of Object.keys(window.pages)){
    // @ts-ignore
    const value = pages[key];
    if(typeof value === "function") break;
    value.classList.add(styles.container);

    const navigationBarItem = document.createElement("div");
    navigationBarItem.classList.add(styles.navigationBarItem);
    const anchor = document.createElement("a");
    anchor.textContent = key;
    anchor.onclick = () => window.pages.switchPage(key);
    navigationBarItem.append(anchor);
    navigationBar.append(navigationBarItem);
  }

  window.pages["Map Builder"].classList.add(styles.mapBuilder);

  const fileGenerator = document.getElementById("fileGenerator");
  const fileGeneratorMain = document.getElementById("fileGeneratorMain");
  const mapBuilderMapInputError = document.getElementById("mapBuilderMapInputError");
  const mapBuilderToolbar = document.getElementById("mapBuilderToolbar");
  const mapBuilderCanvasLoading = document.getElementById("mapBuilderCanvasLoading");
  const mapBuilderCanvasLoadingText = document.getElementById("mapBuilderCanvasLoadingText");
  const mapBuilderCanvasProgressBar = document.getElementById("mapBuilderCanvasProgressBar");
  const mapBuilderCanvasProgressBarFill = document.getElementById("mapBuilderCanvasProgressBarFill");
  const mapBuilderCanvasContainer = document.getElementById("mapBuilderCanvasContainer");
  const mapBuilderToolbarFiltersForm = document.getElementById("mapBuilderToolbarFiltersForm");
  const version = document.getElementById("version");

  fileGenerator.classList.add(styles.fileGenerator);
  fileGeneratorMain.classList.add(styles.fileGeneratorMain);
  mapBuilderMapInputError.classList.add(styles.error);
  mapBuilderToolbar.classList.add(styles.toolbar);
  mapBuilderCanvasLoading.classList.add(styles.mapBuilderCanvasLoading, styles.hidden);
  mapBuilderCanvasLoadingText.classList.add(styles.mapBuilderCanvasLoadingText);
  mapBuilderCanvasProgressBar.classList.add(styles.mapBuilderCanvasProgressBar);
  mapBuilderCanvasProgressBarFill.classList.add(styles.mapBuilderCanvasProgressBarFill);
  mapBuilderCanvasContainer.classList.add(styles.mapBuilderCanvasContainer);
  mapBuilderToolbarFiltersForm.classList.add(styles.mapBuilderToolbarFiltersForm);
  version.classList.add(styles.version);

  addTooltip("mapBuilderHexCountXLabel", "The number of hexes the map has horizontally", "up");
  addTooltip("mapBuilderHexCountYLabel", "The number of hexes the map has vertically", "up");

  window.pages.switchPage(startingPage);
}

function addTooltip(elementID: string, tooltipText: string, position: "right" | "up"): HTMLDivElement{
  const element = document.getElementById(elementID);
  if(element === null) throw new Error("Could not find element with id " + elementID);
  element.classList.add(styles.tooltip);
  const tooltipElement = document.createElement("div");
  tooltipElement.classList.add(styles.tooltiptext, styles[`tooltiptext_${position}`]);
  tooltipElement.textContent = tooltipText;
  element.appendChild(tooltipElement);
  return tooltipElement;
}

function initialiseToolbar(): void{
  const TOOLBAR_ITEMS = [
    {
      name: "General",
      id: "General",
    },
    {
      name: "Map Meta Data",
      id: "MetaData",
    },
    {
      name: "Filters",
      id: "Filters",
    }
  ]
  
  const toolbarElements: Record<string, HTMLElement> = {};
  const toolbar = document.getElementById("mapBuilderToolbar");
  const toolbarChildren = [...toolbar.children];
  const mapBuilderCanvasContainer = document.getElementById("mapBuilderCanvasContainer");
  for(let i = 0; i < toolbarChildren.length; i++){
    const child = toolbarChildren[i];
    const toolbarItem = TOOLBAR_ITEMS.find(item => item.id === child.id.slice(17));
    if(!toolbarItem) throw new Error(`Could not create toolbar item. Toolbar item with id "${child.id}Form" not found`);

    child.classList.add(styles.toolbaritem);
    if(child.id) addTooltip(child.id, toolbarItem.name, "right");

    const formElement = document.getElementById(`${child.id}Form`) as HTMLDivElement;
    if(formElement === null) throw new Error(`Error while creating Map Builder Toolbar: Element with ID "${child.id}" not found`);
    
    formElement.classList.add(styles.mapBuilderForm);

    const formElementChildren = [...formElement.children];

    // simplebar seems to collapse the width to like 2px, so i need to set it back to normal
    function resizeFormElement(){
      let maximumChildWidth = -Infinity;
  
      (formElementChildren as HTMLElement[]).forEach(child => {
        if(child.offsetWidth > maximumChildWidth) maximumChildWidth = child.offsetWidth;
      });
      
      formElement.style.width = maximumChildWidth + "px";
    }
    
    // moveable seems to remove click functionality from inputs
    for(const child of [...formElement.children] as HTMLElement[])
    if(child.tagName === "INPUT") child.addEventListener("click", () => child.focus());

    new SimpleBar(formElement, {
      autoHide: true,
    })

    resizeFormElement();

    formElement.classList.add(styles.hidden);
    
    child.addEventListener("click", () => {
      const element = toolbarElements[child.id];
      element.classList.toggle(styles.hidden);
      resizeFormElement();
    });

    const moveableForm = new Moveable(mapBuilderCanvasContainer, {
      target: formElement,
      draggable: true,
      hideDefaultLines: true,
      hideChildMoveableDefaultLines: true,
      hideThrottleDragRotateLine: true,
      origin: false,
      preventClickEventOnDrag: false,
    })
    
    moveableForm.on("drag", ({ left: _left, top: _top, right, bottom, target }) => {
      let left = _left;
      let top = _top;
      if(_left < 0) left = 0;
      if(right < 0) left = _left + right;
      if(_top < 0) top = 0;
      if(bottom < 0) top = _top + bottom;
      target.style.left = `${left}px`;
      target.style.top = `${top}px`;
    })

    toolbarElements[child.id] = formElement;
  }
}

init();
})();