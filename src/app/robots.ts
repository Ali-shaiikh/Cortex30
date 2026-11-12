import type { MetadataRoute } from "next";

// Only the public landing pages may be indexed; everything personal stays out of search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/login", "/signup"], disallow: ["/", "/api/", "/day/", "/progress", "/profile", "/setup"] },
  };
}
