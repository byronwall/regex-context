import * as vscode from "vscode";
import * as ejs from "ejs";
import { getNonce } from "./helpers";
import { updateState } from "./state";
import { doExtractCtx, doExtractFind, doReplace } from "./regex";
import { GLOBAL_STATE } from "./extension";

export type Messages =
  | {
      type: "stateUpdate";
      value: RegexStateData;
    }
  | {
      type: "doReplace";
    }
  | {
      type: "doExtractCtx";
    }
  | {
      type: "doExtractFinds";
    };

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
          break;
        }

        case "doExtractCtx": {
          doExtractCtx();
          break;
        }

        case "doExtractFinds": {
          doExtractFind();
          break;
        }
      }
    });
  }

  public toggleActive() {
    if (this._view) {
      // showing the view seems required in order to get code to run in webview?
      this._view.show?.(true);

      // this message will be processed by the webview (which sends it back via another message)
      // this madness is all about keeping the state synchronized
      this._view.webview.postMessage({ type: "toggleActive" });
    }
  }

  public updateState() {
    if (this._view) {
      // this message will be processed by the webview (which sends it back via another message)
      // this madness is all about keeping the state synchronized
      this._view.webview.postMessage({
        type: "updateStateFromExt",
        data: GLOBAL_STATE,
      });
    }
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
