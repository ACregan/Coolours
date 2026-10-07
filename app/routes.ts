import {
  type RouteConfig,
  layout,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./layouts/core/core-layout.tsx", [
    index("./routes/home/home.tsx"),
    route("create/:swatches?", "./routes/create/create.tsx"),
  ]),
] satisfies RouteConfig;
