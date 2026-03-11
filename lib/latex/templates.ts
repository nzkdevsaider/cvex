import { registerTemplate } from "./registry";
import defaultTemplate from "./builtin/default.json";
import northeasternTemplate from "./builtin/northeastern.json";

// Register all built-in templates
registerTemplate(defaultTemplate);
registerTemplate(northeasternTemplate);

// Public API
export {
  getAllTemplates,
  getTemplate,
  registerTemplate,
} from "./registry";
export type { LatexTemplate } from "./types";
