import PrivacyPolicy from "~/components/PrivacyPolicy/PrivacyPolicy";
import type { Route } from "./+types/privacy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coolours - Privacy Policy" },
    {
      name: "description",
      content:
        "How Coolours handles your data: what stays on your device, what we collect, and your rights.",
    },
  ];
}

export default function Privacy() {
  return <PrivacyPolicy />;
}
