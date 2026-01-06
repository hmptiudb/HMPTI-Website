import ActivityViewHome from "@/components/guestView/home/ActivityViewHome";
import EventViewHome from "@/components/guestView/home/EventViewHome";
import ExecutiveViewHome from "@/components/guestView/home/ExecutiveViewHome";
import HeroViewHome from "@/components/guestView/home/HeroViewHome";
import NewsViewHome from "@/components/guestView/home/NewsViewHome";
import ProductViewHome from "@/components/guestView/home/ProductViewHome";
import StrukturViewHome from "@/components/guestView/home/StrukturViewHome";
import TransitionLayout from "@/components/TransitionLayout";

export default function Home() {
  return (
    <        >
      <TransitionLayout />
      <HeroViewHome />
      <ActivityViewHome />
      <StrukturViewHome />
      <EventViewHome />
      <ProductViewHome />
      <ExecutiveViewHome />
      <NewsViewHome />
    </>
  );
}
