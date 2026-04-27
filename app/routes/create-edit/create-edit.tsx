import type { Route } from "./+types/CreateEdit";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coolours" },
    {
      name: "description",
      content:
        "A Colour Swatch Tool that doesnt badger you for your card details after every click. 100% Enshittification-Free Guaranteed.",
    },
  ];
}

export default function CreateEdit() {
  return <h1>Create-Edit Page</h1>;
}