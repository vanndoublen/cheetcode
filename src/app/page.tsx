import { ComponentExample } from "@/components/component-example";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full w-full">
      <ComponentExample />
      <div className="h-200">
        random
      </div>
    </div>
  );
}
