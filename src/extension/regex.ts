import * as vscode from "vscode";
import { activeEditor, GLOBAL_STATE } from "./extension";

export function getContextPosRanges(activeEditor: vscode.TextEditor) {
  const text = activeEditor.document.getText();

  const pattern = new RegExp(GLOBAL_STATE.pattern, "gms");
  const posRanges: vscode.Range[] = [];

  let count = 0;
  let match;
  while ((match = pattern.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );

    posRanges.push(new vscode.Range(startPos, endPos));

    if (count++ > text.length) {
      console.error("stopped an infinite loop");
      break;
    }
  }

  return posRanges;
}

export function getFindPosRanges(
  activeEditor: vscode.TextEditor,
  contextRange: vscode.Range
) {
  const text = activeEditor.document.getText(contextRange);

  // need to add the start in since we are only looking at a subset of text
  const startIndex = activeEditor.document.offsetAt(contextRange.start);

  const pattern = new RegExp(GLOBAL_STATE.find, "gms");
  const posRanges: vscode.Range[] = [];

  let count = 0;
  let match;
  while ((match = pattern.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index + startIndex);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length + startIndex
    );

    posRanges.push(new vscode.Range(startPos, endPos));

    if (count++ > text.length) {
      console.error("stopped an infinite loop in find");
      break;
    }
  }

  return posRanges;
}

export function getReplacedTextForContext(
  activeEditor: vscode.TextEditor,
  contextRange: vscode.Range
) {
  const text = activeEditor.document.getText(contextRange);

  // need to add the start in since we are only looking at a subset of text
  const pattern = new RegExp(GLOBAL_STATE.find, "gms");

  const newText = text.replaceAll(pattern, GLOBAL_STATE.replace);

  return newText;
}

export function doReplace() {
  if (!activeEditor || !activeEditor.document || !vscode.window) {
    return;
  }

  if (GLOBAL_STATE.find === "" || GLOBAL_STATE.replace === "") {
    return;
  }

  // determine the context ranges
  const posRanges = getContextPosRanges(activeEditor);

  // process those ranges doing the replacement as a single edit
  activeEditor.edit((editBuilder) => {
    for (const ctxRange of posRanges) {
      const newText = getReplacedTextForContext(activeEditor!, ctxRange);
      editBuilder.replace(ctxRange, newText);
    }
  });
}
