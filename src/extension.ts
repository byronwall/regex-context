import * as vscode from "vscode";

let activeEditor: vscode.TextEditor | undefined;

let window = vscode.window;
let workspace = vscode.workspace;

let pattern: RegExp = /bat.*?cat/gms;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "regex-context" is now active!');

  let disposable = vscode.commands.registerCommand(
    "regex-context.helloWorld",
    async () => {
      const result = await window.showInputBox({
        prompt: "Enter the regex",
        value: pattern.source,
      });

      console.log("result", result);

      if (result === undefined) {
        return;
      }

      pattern = new RegExp(result, "gms");

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

  context.subscriptions.push(disposable);
}

// need to use a single decorator type so that updates work
const decorationType = window.createTextEditorDecorationType({
  border: "1px solid red",
});

// this method is called when your extension is deactivated
export function deactivate() {}

function findContext() {
  console.log("find context", pattern.source);

  if (!activeEditor || !activeEditor.document || !window) {
    return;
  }

  console.log("matching");

  var text = activeEditor.document.getText();
  var matches: vscode.DecorationOptions[] = [];
  var match;

  let count = 0;

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
