import { CreateColourSet } from "~/components/CreateColourSet/CreateColourSet.client";
import type { Route } from "./+types/create";
import { useLoaderData } from "react-router";
import { isValidHexColor } from "~/utilities/utilities";

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
  const swatchesFromUrlAsArrayOfObjects =
    swatchesFromUrlAsArrayOfStrings?.flatMap((hexString) => {
      // Only return a value if it is a valid Hex Colour String
      return isValidHexColor(hexString) ? { hex: hexString } : [];
    });

  return (
    <CreateColourSet
      swatchesFromUrl={swatchesFromUrlAsArrayOfObjects}
      swatchesNameFromUrl={swatchName ?? undefined}
    />
  );
}
