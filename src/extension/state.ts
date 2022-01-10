import { updateAllDecorations } from "./decorations";
import { RegexStateData } from "./RegexViewProvider";
import { GLOBAL_STATE } from "./extension";

export function updateState(newState: RegexStateData) {
  Object.assign(GLOBAL_STATE, newState);

  updateAllDecorations();
}
