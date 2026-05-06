import type { ApiHttpClient } from "../client";
import type { BannerListResponse } from "../types/banner";

export const createBannerApi = (client: ApiHttpClient) => ({
  listBanners: () => client.post<BannerListResponse>("/index/banner/list"),
});
