import {
  type RouteConfig,
  layout,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  layout("./layouts/core/core-layout.tsx", [
    index("./routes/home/home.tsx"),
    route("create/:swatches?", "./routes/create/create.tsx"),
    route("edit", "./routes/edit/edit.tsx"),
  ]),
] satisfies RouteConfig;

// export default [
//   index("routes/home.tsx")
// ] satisfies RouteConfig;
