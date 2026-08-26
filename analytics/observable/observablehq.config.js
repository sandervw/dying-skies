// Observable Framework config: minimal black dashboard at /analytics/.
import { readFileSync } from "node:fs";

const favicon = readFileSync("./logo.png").toString("base64");

export default {
  title: "Dying Skies",
  root: "src",
  output: "dist/analytics", // nested so /analytics/* serves cleanly
  base: "/analytics/",
  theme: "dark",
  sidebar: false,
  toc: false,
  pager: false,
  header: "",
  footer: "",
  // Pure black to match the frontend; starfield sits behind content.
  head: `<link rel="icon" type="image/png" href="data:image/png;base64,${favicon}">
<style>
:root { --theme-background: #000000; --theme-background-alt: #000000; }
html, body { background: transparent; }
</style>`,
};
