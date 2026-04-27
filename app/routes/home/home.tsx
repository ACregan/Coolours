import type { Route } from "./+types/Home";

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

export default function Home() {
  return <h1>Home Page</h1>;
}