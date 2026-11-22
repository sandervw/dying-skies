// Frontend layer rules from .docs/architecture.md section 2.

const SOURCE = "^frontend/src";

// Folders each layer must never import.
const FORBIDDEN_IMPORTS = {
  "types|utils|services": "components|contexts|hooks|labs",
  contexts: "components|hooks|labs",
  hooks: "components|labs",
  components: "contexts|labs",
};

const layerRules = Object.entries(FORBIDDEN_IMPORTS).map(([layers, forbidden]) => ({
  name: "layers-point-inward",
  severity: "error",
  comment: "Imports follow the layer table in .docs/architecture.md section 2.",
  from: { path: `${SOURCE}/(${layers})/` },
  to: { path: `${SOURCE}/(${forbidden})/` },
}));

module.exports = {
  forbidden: [
    ...layerRules,
    {
      name: "labs-are-leaves",
      severity: "error",
      comment: "Nothing outside labs imports a lab page.",
      from: { pathNot: `${SOURCE}/labs/` },
      to: { path: `${SOURCE}/labs/` },
    },
    {
      name: "pieces-share-no-code",
      severity: "error",
      comment: "The frontend imports only its own files and its packages.",
      from: { path: "^frontend/" },
      to: { pathNot: ["^frontend/", "(^|/)node_modules/"], dependencyTypesNot: ["core"] },
    },
    {
      name: "no-circular",
      severity: "error",
      comment: "No import cycles, type-only imports included.",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules|frontend/vendor" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "frontend/tsconfig.app.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      mainFields: ["module", "main", "types", "typings"],
    },
  },
};
