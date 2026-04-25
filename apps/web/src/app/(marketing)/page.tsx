import { getHomePageData } from "@/components/home/home-data";
import { HomePage } from "@/components/home/home-page";

export default async function WebHomePage() {
  const data = await getHomePageData();
  return <HomePage {...data} />;
}
