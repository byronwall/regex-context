import * as vscode from "vscode";
import { getContextPosRanges, getFindPosRanges } from "./regex";
import { activeEditor, window, GLOBAL_STATE } from "./extension";

let decorationTypeContext: vscode.TextEditorDecorationType;
let decorationTypeFind: vscode.TextEditorDecorationType;

export function createDecorations() {
  decorationTypeContext = window.createTextEditorDecorationType({
    outline: "1px solid red",
  });

  decorationTypeFind = window.createTextEditorDecorationType({
    border: "1px solid orange",
  });
}

function addDecorationToContext() {
  if (!activeEditor || !activeEditor.document || !window) {
    return;
  }

  // short circuit if not active
  if (!GLOBAL_STATE.isActive || GLOBAL_STATE.patterns[0] === "") {
    console.log("not active, remove all");
    activeEditor.setDecorations(decorationTypeContext, []);
    return;
  }

  const posRanges = getContextPosRanges(activeEditor);

  const decorations = posRanges.map<vscode.DecorationOptions>((range) => ({
    range,
  }));

  activeEditor.setDecorations(decorationTypeContext, decorations);
}

function addDecorationToFind() {
  if (!activeEditor || !activeEditor.document || !window) {
    return;
  }

  // short circuit if not active
  if (
    !GLOBAL_STATE.shouldShowFind ||
    GLOBAL_STATE.find === "" ||
    !GLOBAL_STATE.isActive
  ) {
    console.log("not active, remove all");
    activeEditor.setDecorations(decorationTypeFind, []);
    return;
  }

  const posRanges = getContextPosRanges(activeEditor);

  // process those ranges for the find part
  const pattern = new RegExp(GLOBAL_STATE.find, "gms");
  const findRanges = posRanges.flatMap((range) =>
    getFindPosRanges(activeEditor!, range, pattern)
  );

  const decorations = findRanges.map<vscode.DecorationOptions>((range) => ({
    range,
  }));

  activeEditor.setDecorations(decorationTypeFind, decorations);
}

export function updateAllDecorations() {
  addDecorationToContext();
  addDecorationToFind();
}
