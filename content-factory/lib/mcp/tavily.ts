type TavilyResponse = {
  summary?: string;
  results?: Array<{ url?: string }>;
};

export async function tavilySearch(query: string) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return { summary: "未配置 Tavily API Key", links: [] };
  }
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ query, max_results: 3 }),
  });
  if (!res.ok) {
    return { summary: "Tavily 请求失败", links: [] };
  }
  const data = (await res.json()) as TavilyResponse;
  const links =
    data.results
      ?.map((item) => item.url)
      .filter((url): url is string => typeof url === "string" && url.length > 0) ?? [];
  return {
    summary: data.summary ?? "",
    links,
  };
}
