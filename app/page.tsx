import GenerateAddress from "@/components/GenerateAddress";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <GenerateAddress />
    </div>
  );
}
