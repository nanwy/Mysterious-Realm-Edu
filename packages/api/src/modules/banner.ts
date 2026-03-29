import { createApiClient } from "../client";

const client = createApiClient();

export function getBannerList() {
  return client.post("/index/banner/list");
}

