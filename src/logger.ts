import styles from "./style.css";
import SimpleBar from "simplebar";

export class Logger{
  private clearButton: HTMLButtonElement;
  constructor(private readonly logger: HTMLDivElement){
    this.createLogLabel();
    this.clearButton = this.createClearButton();
    new SimpleBar(this.logger);
  }

  public log(...data: string[]): Logger{
    return this.logMessage("log", ...data);
  }

  public error(...data: string[]): Logger{
    return this.logMessage("error", ...data);
  }

  public warn(...data: string[]): Logger{
    return this.logMessage("warn", ...data);
  }

  private logMessage(type: "log" | "warn" | "error", ...data: string[]): Logger{
    for(const value of data){
      const spanElement = document.createElement("span");
      if(type === "warn" || type === "error") spanElement.classList.add(styles[type]);
      spanElement.textContent = `${this.getTime()} | ${value}`;
      this.clearButton.insertAdjacentElement("beforebegin", spanElement);
      this.clearButton.insertAdjacentElement("beforebegin", document.createElement("br"));
    }
    return this;
  }

  public clear(): Logger{
    this.logger.innerHTML = "";
    this.createLogLabel();
    this.clearButton = this.createClearButton();
    return this.log("Log cleared");
  }

  public createClearButton(): HTMLButtonElement{
    const button = document.createElement("button");
    button.textContent = "Clear log";
    button.onclick = () => this.clear();
    this.logger.append(button);
    return button;
  }

  public createLogLabel(): HTMLElement{
    const element = document.createElement("h1");
    element.textContent = "Log:"
    element.style.marginTop = "0";
    element.style.marginBottom = "0.5rem";
    this.logger.append(element);
    return element;
  }

  public getTime(): string{
    const date = new Date();
    const seconds = date.getSeconds();
    return `${date.getHours()}:${date.getMinutes()}:${seconds.toString().length === 1 ? `0${seconds}` : `${seconds}`}`;
  }

  public horizontalLine(): Logger{
    this.clearButton.insertAdjacentElement("beforebegin", document.createElement("hr"));
    return this;
  }
}