import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/forside.tsx"),
  route("farver", "routes/farver.tsx"),
  route("typografi", "routes/typografi.tsx"),
  route("motion", "routes/motion.tsx"),
  route("komponenter", "routes/komponenter.tsx"),
  route("komponenter/knap", "routes/knap.tsx"),
  route("tokens", "routes/tokens.tsx"),
  route("theme", "routes/theme.tsx"),
] satisfies RouteConfig;
