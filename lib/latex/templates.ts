import "./templates/default";
import "./templates/harvard";

// Public API
export {
  generateLatexForTemplate,
  getAllTemplates,
  getTemplate,
  registerTemplate,
} from "./registry";
export type { LatexTemplate } from "./types";
