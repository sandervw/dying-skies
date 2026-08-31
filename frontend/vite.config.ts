import { defineConfig, loadEnv } from "vite";
import type { HtmlTagDescriptor, Plugin } from "vite";
import react from "@vitejs/plugin-react";

// strict policy: same-origin code only, inline styles, reach the API.
const buildContentSecurityPolicy = (apiBaseUrl: string): string =>
  [
    "default-src 'self'",
    "script-src 'self' https://static.cloudflareinsights.com",
    "worker-src 'self' blob:",
    "media-src 'self' blob:",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${apiBaseUrl} https://cloudflareinsights.com`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

// inject the CSP meta tag first in the production HTML only.
const contentSecurityPolicyPlugin = (apiBaseUrl: string): Plugin => ({
  name: "inject-csp",
  apply: "build",
  transformIndexHtml: (): HtmlTagDescriptor[] => [
    {
      tag: "meta",
      attrs: {
        "http-equiv": "Content-Security-Policy",
        content: buildContentSecurityPolicy(apiBaseUrl),
      },
      injectTo: "head-prepend",
    },
  ],
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), contentSecurityPolicyPlugin(env.VITE_API_BASE_URL ?? "")],
    server: { open: true },
  };
});
