import { RegexStateData, Messages } from "../extension/RegexViewProvider";

declare const acquireVsCodeApi: <T>() => {
  setState(data: T): void;
  getState(): T | undefined;
  postMessage(obj: { type: Messages["type"]; value: any }): void;
};

console.log("running the main.ts code ");

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

const vscode = acquireVsCodeApi<RegexStateData>();

const oldState: RegexStateData = vscode.getState() || {
  shouldShowFind: true,
  isActive: true,
  patterns: [""],
  find: "",
  replace: "",
};

// stop gap to handle transition to new data
if (oldState.patterns === undefined) {
  oldState.patterns = [""];
}

function updateState<K extends keyof RegexStateData>(
  key: K,
  value: RegexStateData[K]
) {
  oldState[key] = value;

  vscode.setState(oldState);

  vscode.postMessage({ type: "stateUpdate", value: oldState });

  updateDomFromState(oldState);
}

function handleReplaceClick() {
  vscode.postMessage({ type: "doReplace", value: oldState });
}

window.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  document
    .getElementById("btnPattern")
    ?.addEventListener("change", (event: any) => {
      const newCheckedState = (event.target as any).checked;

      updateState("isActive", newCheckedState);
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

  document.getElementById("btnAddContext")?.addEventListener("click", () => {
    handleAddBlankContext();
  });

  updateDomFromState(oldState);
});

// Handle messages sent from the extension to the webview
window.addEventListener("message", (event) => {
  const message = event.data; // The json data that the extension sent
  switch (message.type) {
    case "XXX":
      break;
  }
});

function handleAddBlankContext() {
  console.log("new context");
  const newPatterns = oldState.patterns.concat("");

  updateState("patterns", newPatterns);
}

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

  createContextDom(oldState);
}

function createContextDom(oldState: RegexStateData) {
  console.log("create context DOM");
  const parent = document.getElementById("contextCtr");

  // clear children
  parent.innerHTML = "";

  // <div class="flex">
  //     <input type="text" id="txtPattern" placeholder="pattern" />
  //   </div>

  oldState.patterns.forEach((pattern, idx) => {
    const divFlex = document.createElement("div");
    divFlex.className = "flex";

    const inputPattern = document.createElement("input");
    inputPattern.type = "text";
    inputPattern.placeholder = "pattern";
    inputPattern.value = pattern;

    inputPattern.addEventListener("change", (event: any) => {
      const newValue = event.target.value;

      updatePatternText(newValue, idx);
    });
    divFlex.appendChild(inputPattern);

    if (idx > 0) {
      const removeButton = document.createElement("button");
      removeButton.textContent = "-";
      removeButton.addEventListener("click", () => {
        removePatternItem(idx);
      });
      divFlex.appendChild(removeButton);
    }

    parent.appendChild(divFlex);
  });
}

function updatePatternText(newValue: string, idxToChange: number) {
  console.log("update text", newValue, idxToChange);

  const newPatterns = oldState.patterns.map((pattern, idx) =>
    idx === idxToChange ? newValue : pattern
  );

  updateState("patterns", newPatterns);
}

function removePatternItem(idxToRemove: number) {
  if (idxToRemove <= 0) {
    return;
  }

  // keep the good ones
  const newPatterns = oldState.patterns.filter(
    (pattern, idx) => idx !== idxToRemove
  );

  updateState("patterns", newPatterns);
}
