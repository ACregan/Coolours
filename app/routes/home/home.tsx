import HomePage from "~/components/HomePage";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coolours - Home" },
    {
      name: "description",
      content:
        "A Colour Swatch Tool that doesn't badger you for your card details after every click. 100% Enshittification-Free Guaranteed.",
    },
  ];
}

export default function Home() {
  return <HomePage />;
}
