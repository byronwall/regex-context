import { RegexStateData, Messages } from "../extension/RegexViewProvider";

declare const acquireVsCodeApi: <T>() => {
  setState(data: T): void;
  getState(): T | undefined;
  postMessage(obj: { type: Messages["type"]; value: any }): void;
};

console.log("running the main.ts code ");

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi<RegexStateData>();

  const oldState: RegexStateData = vscode.getState() || {
    isActive: true,
    pattern: "",
  };

  function updateState<K extends keyof RegexStateData>(
    key: K,
    value: RegexStateData[K]
  ) {
    oldState[key] = value;

    console.log("new state ", oldState);

    vscode.setState(oldState);

    vscode.postMessage({ type: "stateUpdate", value: oldState });
  }

  window.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");

    document
      .getElementById("btnPattern")
      ?.addEventListener("change", (event: any) => {
        const newCheckedState = (event.target as any).checked;
        console.log("check tick xxx", newCheckedState);

        updateState("isActive", newCheckedState);
      });
    document
      .getElementById("txtPattern")
      ?.addEventListener("change", (event: any) => {
        // @ts-ignore
        const newValue = event.target.value;

        updateState("pattern", newValue);
      });
  });

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "XXX":
        break;
    }
  });
})();
