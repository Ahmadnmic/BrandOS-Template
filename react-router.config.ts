import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  buildDirectory: "output",
  ssr: false,
  // Explicit list: /theme is a dev-only QA surface and stays out of the
  // shipped output. Brand builds with a component registry derive their
  // detail routes here (import the registry, never maintain a list by
  // hand).
  prerender: ["/", "/komponenter/knap"],
} satisfies Config;
