import { CreateColourSet } from "~/components/CreateColourSet/CreateColourSet";
import type { Route } from "./+types/create";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coolours - Create" },
    {
      name: "description",
      content:
        "A Colour Swatch Tool that doesn't badger you for your card details after every click. 100% Enshittification-Free Guaranteed.",
    },
  ];
}

export default function CreateEdit() {
  return <CreateColourSet />;
}
