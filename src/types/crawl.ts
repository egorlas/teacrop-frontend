export interface CrawlRequest {
  url: string;
  titleSelector?: string;
  descriptionSelector?: string;
  imageSelector?: string;
  contentSelector?: string;
  cookies?: string; // Cookie string (e.g., "session=abc123; lang=en")
  authToken?: string; // Authorization Bearer token (e.g., "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
}

export interface CrawlResponse {
  ok: boolean;
  data?: CrawlData;
  error?: string;
}

export interface CrawlData {
  sourceUrl: string;
  title: string | null;
  description: string | null;
  image: string | null;
  contentHtml: string | null;
  plainText: string;
  fetchedAt: string;
}

