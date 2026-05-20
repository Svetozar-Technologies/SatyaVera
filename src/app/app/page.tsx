import type { Metadata } from "next";
import { SpaShell } from "./_components/SpaShell";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "SPA shell",
  description:
    "Client-only Single Page Application shell that doubles as the basis for web, desktop, and mobile builds.",
};

export default function AppRoot() {
  return <SpaShell />;
}
