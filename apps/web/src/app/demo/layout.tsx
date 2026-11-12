import type { Metadata } from "next";
import { DemoProvider } from "@/components/demo/DemoContext";
import { Shell } from "@/components/demo/Shell";

export const metadata: Metadata = { title: "Demo interaktif – DistribuCore" };

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <Shell>{children}</Shell>
    </DemoProvider>
  );
}
