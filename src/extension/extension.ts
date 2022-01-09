import * as vscode from "vscode";
import { RegexStateData, RegexViewProvider } from "./RegexViewProvider";

let activeEditor: vscode.TextEditor | undefined;

let window = vscode.window;
let workspace = vscode.workspace;

const GLOBAL_STATE: RegexStateData = { isActive: true, pattern: "xxx" };

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "regex-context" is now active!');

  let disposable = vscode.commands.registerCommand(
    "regex-context.helloWorld",
    async () => {
      const result = await window.showInputBox({
        prompt: "Enter the regex",
        value: GLOBAL_STATE.pattern,
      });

      console.log("result", result);

      if (result === undefined) {
        return;
      }

      GLOBAL_STATE.pattern = result;

      findContext();
    }
  );

  activeEditor = window.activeTextEditor;

  window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        findContext();
      }
    },
    null,
    context.subscriptions
  );

  workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        findContext();
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

  context.subscriptions.push(disposable);
}

// need to use a single decorator type so that updates work
// see: https://github.com/microsoft/vscode-extension-samples/issues/22#issuecomment-321555992
const decorationType = window.createTextEditorDecorationType({
  border: "1px solid red",
});

// this method is called when your extension is deactivated
export function deactivate() {}

export function updateState(newState: RegexStateData) {
  console.log("update state extension", { ...GLOBAL_STATE }, newState);
  Object.assign(GLOBAL_STATE, newState);

  findContext();
}

function findContext() {
  console.log("find context", GLOBAL_STATE.pattern);

  if (!activeEditor || !activeEditor.document || !window) {
    return;
  }

  // short circuit if not active
  if (!GLOBAL_STATE.isActive || GLOBAL_STATE.pattern === "") {
    console.log("not active, remove all");
    activeEditor.setDecorations(decorationType, []);
    return;
  }

  console.log("matching", GLOBAL_STATE);

  var text = activeEditor.document.getText();
  var matches: vscode.DecorationOptions[] = [];
  var match;

  let count = 0;

  const pattern = new RegExp(GLOBAL_STATE.pattern, "gms");

  while ((match = pattern.exec(text))) {
    var startPos = activeEditor.document.positionAt(match.index);
    var endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    var decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos),
    };

    console.log("match", {
      match,
      length: match[0].length,
      startPos,
      endPos,
      decoration,
    });

    var matchedValue = match[0];

    matches.push(decoration);

    if (count++ > text.length) {
      console.error("stopped an infinite loop");
      break;
    }
  }

  // add a box for each one

  console.log("add border", matches);

  activeEditor.setDecorations(decorationType, matches);

  // get text for active file

  // find the matches

  // add a red border to the matches -- this is the context
}
