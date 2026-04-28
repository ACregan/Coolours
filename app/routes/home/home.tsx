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
  return (
    <HomePage />
    // <>
    //   <h1>Home Page</h1>
    //   <h2>Home Page</h2>
    //   <h3>Home Page</h3>
    //   <h4>Home Page</h4>
    //   <h5>Home Page</h5>
    //   <h6>Home Page</h6>
    //   <p>Home Page</p>
    // </>
  );
}
