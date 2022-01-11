import * as vscode from "vscode";
import * as ejs from "ejs";
import { getNonce } from "./helpers";
import { updateState } from "./state";
import { doReplace } from "./regex";

interface MessageStateUpdate {
  type: "stateUpdate";
  value: RegexStateData;
}
interface MessageStateDoReplace {
  type: "doReplace";
}

export type Messages = MessageStateUpdate | MessageStateDoReplace;

export interface RegexStateData {
  patterns: string[];

  find: string;
  replace: string;

  isActive: boolean;
  shouldShowFind: boolean;
}

export class RegexViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "regex-context.colorsView";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    console.log("running the webview code");

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data: Messages) => {
      switch (data.type) {
        case "stateUpdate": {
          updateState(data.value);

          break;
        }

        case "doReplace": {
          doReplace();
        }
      }
    });
  }

  private async getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = this.getSpecialUri("main.js");

    const styleResetUri = this.getUri("reset.css");
    const styleVSCodeUri = this.getUri("vscode.css");
    const styleMainUri = this.getUri("main.css");
    const htmlPath = this.getUri("index.ejs")?.fsPath;

    if (htmlPath === undefined) {
      throw new Error("Did not load files?");
    }

    const nonce = getNonce();

    const data = {
      nonce,
      styleResetUri,
      styleVSCodeUri,
      styleMainUri,
      scriptUri,
      cspSource: webview.cspSource,
    };

    const html = await ejs.renderFile(htmlPath, data);

    webview.html = html;
  }
  private getUri(mediaFileName: string, folderName = "media") {
    return this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, folderName, mediaFileName)
    );
  }
  private getSpecialUri(mediaFileName: string) {
    return this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "webview", mediaFileName)
    );
  }
}
