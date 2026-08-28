import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/forside.tsx"),
  route("komponenter/knap", "routes/knap.tsx"),
  route("theme", "routes/theme.tsx"),
] satisfies RouteConfig;
