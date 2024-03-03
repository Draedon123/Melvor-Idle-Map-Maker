import styles from "./style.css";
import SimpleBar from "simplebar";

export function initaliseHelpPage(): void{
  new SimpleBar(window.pages["Help"]);

  const helpContainers = [
    "helpContainerFileGeneration",
    "helpContainerMapBuilder",
  ]

  for(const id of helpContainers){
    const headerElement = document.getElementById(`${id}Header`);

    if(headerElement === null) throw new Error(`Element with id ${id}Header does not exist`);

    headerElement.classList.add(styles.helpContainerHeader);

    const iconContainer = headerElement.firstElementChild as HTMLDivElement;

    iconContainer.classList.add(styles.helpContainerHeaderIconContainer);

    (iconContainer.firstElementChild)?.classList.add(styles.helpContainerHeaderIcon);
    (headerElement.lastElementChild)?.classList.add(styles.helpContainerHeaderText);

    const contentElement = document.getElementById(`${id}Content`);

    if(contentElement === null) throw new Error(`Element with id ${id}Content doest not exist`);

    contentElement.classList.add(styles.helpContainerContent);
    
    iconContainer.addEventListener("click", () => {
      contentElement.classList.toggle(styles.hidden);
      iconContainer.querySelector("img")!.src = `./assets/${contentElement.classList.contains(styles.hidden) ? "expand" : "collapse"}.png`;

      const parsedLocalStorage = JSON.parse(localStorage.getItem("collapsed")!) as string[];

      if(!parsedLocalStorage.includes(id)) parsedLocalStorage.push(id);
      else parsedLocalStorage.splice(parsedLocalStorage.indexOf(id), 1);

      localStorage.setItem("collapsed", JSON.stringify(parsedLocalStorage));
      
    })
  }

  console.log(localStorage.getItem("collapsed"));
  if(localStorage.getItem("collapsed") === null) localStorage.setItem("collapsed", "[]");

  const collapsedSections = JSON.parse(localStorage.getItem("collapsed")!) as string[];

  for(const sectionID of collapsedSections){
    const element = document.getElementById(sectionID);
    if(element === null){
      console.warn(`Section with id ${sectionID} does not exist`);
      continue;
    };
    
    const headerElement = document.getElementById(`${sectionID}Header`);
    if(headerElement === null){
      console.warn(`Header with id ${sectionID}Header does not exist`);
      continue;
    }

    const contentElement = document.getElementById(`${sectionID}Content`);
    if(contentElement === null){
      console.warn(`Content with id ${sectionID}Content does not exist`);
      continue;
    }

    const iconContainer = headerElement.firstElementChild as HTMLDivElement;

    contentElement.classList.add(styles.hidden);
    iconContainer.querySelector("img")!.src = `./assets/${contentElement.classList.contains(styles.hidden) ? "expand" : "collapse"}.png`;
  }
}