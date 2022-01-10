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
    shouldShowFind: true,
    isActive: true,
    pattern: "",
    find: "",
    replace: "",
  };

  function updateState<K extends keyof RegexStateData>(
    key: K,
    value: RegexStateData[K]
  ) {
    oldState[key] = value;

    vscode.setState(oldState);

    vscode.postMessage({ type: "stateUpdate", value: oldState });
  }

  function handleReplaceClick() {
    vscode.postMessage({ type: "doReplace", value: oldState });
  }

  updateDomFromState(oldState);

  window.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");

    document
      .getElementById("btnPattern")
      ?.addEventListener("change", (event: any) => {
        const newCheckedState = (event.target as any).checked;

        updateState("isActive", newCheckedState);
      });

    document
      .getElementById("txtPattern")
      ?.addEventListener("change", (event: any) => {
        // @ts-ignore
        const newValue = event.target.value;

        updateState("pattern", newValue);
      });
    document
      .getElementById("txtFind")
      ?.addEventListener("change", (event: any) => {
        // @ts-ignore
        const newValue = event.target.value;

        updateState("find", newValue);
      });

    document
      .getElementById("checkShowFind")
      ?.addEventListener("change", (event: any) => {
        const newCheckedState = (event.target as any).checked;

        updateState("shouldShowFind", newCheckedState);
      });

    document
      .getElementById("txtReplace")
      ?.addEventListener("change", (event: any) => {
        // @ts-ignore
        const newValue = event.target.value;

        updateState("replace", newValue);
      });

    document.getElementById("btnReplace")?.addEventListener("click", () => {
      handleReplaceClick();
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

function updateDomFromState(oldState: RegexStateData) {
  console.log("XXX update dom from state", oldState);

  document
    .getElementById("btnPattern")
    .setAttribute("checked", "" + oldState.isActive);

  document.getElementById("txtFind").setAttribute("value", oldState.find);

  document
    .getElementById("checkShowFind")
    .setAttribute("checked", "" + oldState.shouldShowFind);

  document.getElementById("txtReplace").setAttribute("value", oldState.replace);
  document.getElementById("txtPattern").setAttribute("value", oldState.pattern);
}
