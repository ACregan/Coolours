import { CreateColourSet } from "~/components/CreateColourSet/CreateColourSet";
import type { Route } from "./+types/create";
import { useLoaderData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coolours - Create New Swatch" },
    {
      name: "description",
      content:
        "A Colour Swatch Tool that doesn't badger you for your card details after every click. 100% Enshittification-Free Guaranteed.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const swatchName = url.searchParams.get("name");
  return {
    swatchName,
  };
}

export default function CreateEdit({ params }: Route.LoaderArgs) {
  const data = useLoaderData<typeof loader>();
  const { swatchName } = data;

  const swatchesFromUrlAsArrayOfStrings = params?.swatches?.split("-");
  const swatchesFromUrlAsArrayOfObjects = swatchesFromUrlAsArrayOfStrings?.map(
    (hexString) => {
      return { hex: hexString };
    },
  );

  return (
    <CreateColourSet
      swatchesFromUrl={swatchesFromUrlAsArrayOfObjects}
      swatchesNameFromUrl={swatchName ?? undefined}
    />
  );
}
