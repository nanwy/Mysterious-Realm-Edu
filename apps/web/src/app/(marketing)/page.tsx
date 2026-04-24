import { HomePage } from "@/components/home/home-page";
import { getHomePageData } from "@/components/home/home-data";

export default async function WebHomePage() {
  const data = await getHomePageData();
  return <HomePage {...data} />;
}
