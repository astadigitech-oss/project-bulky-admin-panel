import { redirect } from "next/navigation";

const AuctionPage = () => {
  redirect("/auctions/list");
};

export default AuctionPage;
