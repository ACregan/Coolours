import { type RouteConfig, layout, index, route } from "@react-router/dev/routes";

export default [
  layout("./layouts/core/core-layout.tsx", [
    index("./routes/home/home.tsx"),
    route("create", "./routes/create-edit/create-edit.tsx"),
    // route("edit", "./routes/create-edit/create-edit.tsx"),
  ])
] satisfies RouteConfig;

// export default [
//   index("routes/home.tsx")
// ] satisfies RouteConfig;
