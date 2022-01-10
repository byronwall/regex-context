import * as vscode from "vscode";

import { createDecorations, updateAllDecorations } from "./decorations";
import { RegexStateData, RegexViewProvider } from "./RegexViewProvider";

export let activeEditor: vscode.TextEditor | undefined;

export const window = vscode.window;
const workspace = vscode.workspace;

export const GLOBAL_STATE: RegexStateData = {
  isActive: true,
  shouldShowFind: true,
  pattern: "xxx",
  find: "yyy",
  replace: "zzz",
};

export function activate(context: vscode.ExtensionContext) {
  activeEditor = window.activeTextEditor;

  window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        updateAllDecorations();
      }
    },
    null,
    context.subscriptions
  );

  workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        updateAllDecorations();
      }
    },
    null,
    context.subscriptions
  );

  const provider = new RegexViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      RegexViewProvider.viewType,
      provider
    )
  );

  createDecorations();
}

// this method is called when your extension is deactivated
export function deactivate() {}
