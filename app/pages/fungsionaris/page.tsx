
import HeroViewFungsionaris from "@/components/guestView/fungsionaris/HeroViewFungsionaris";
import ExecutiveViewHome from "@/components/guestView/home/ExecutiveViewHome";
import StrukturViewHome from "@/components/guestView/home/StrukturViewHome";

export default function page() {
  return (
    <div>
      <HeroViewFungsionaris />

      <ExecutiveViewHome />
      <StrukturViewHome />
    </div>
  );
}
