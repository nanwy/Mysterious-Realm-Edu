import { HomePage } from "@/components/home/home-page";
import { getHomePageData } from "@/lib/data";

export default async function WebHomePage() {
  const data = await getHomePageData();
  return <HomePage {...data} />;
}
