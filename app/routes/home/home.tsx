import HomePage from "~/components/HomePage/HomePage";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coolours - Home" },
    {
      name: "description",
      content:
        "Coolours is a Colour Scheme Generator tool to help you chose and export the perfect colour scheme.",
    },
  ];
}

export default function Home() {
  return <HomePage />;
}
