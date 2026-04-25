import { createApiClient, type ApiHttpClient } from "../client";

export const createBannerApi = (client: ApiHttpClient) => ({
  listBanners: () => client.post("/index/banner/list"),
});

const defaultBannerApi = createBannerApi(createApiClient());

export function getBannerList() {
  return defaultBannerApi.listBanners();
}
