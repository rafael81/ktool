import type { ToolInfo } from "@/data/tools";

export type FaqEntry = [question: string, answer: string];

const siteUrl = "https://k-document-tool.pages.dev";
const brandName = "K문서툴";

export function absoluteUrl(path: string): string {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  const normalizedPath = withSlash === "/" ? "/" : `${withSlash.replace(/\/+$/, "")}/`;
  return new URL(normalizedPath, siteUrl).toString();
}

export function softwareApplicationSchema(tool: ToolInfo, featureList: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    alternateName: tool.primaryQuery,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    url: absoluteUrl(tool.path),
    description: tool.description,
    inLanguage: "ko-KR",
    isAccessibleForFree: true,
    keywords: [tool.primaryQuery, ...tool.secondaryQueries].join(", "),
    featureList,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW"
    },
    publisher: {
      "@type": "Organization",
      name: brandName,
      url: siteUrl
    }
  };
}

export function faqPageSchema(faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer
      }
    }))
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brandName,
    alternateName: "KDocTool",
    url: siteUrl,
    inLanguage: "ko-KR",
    description: "로그인 없이 브라우저에서 사용하는 한국형 무료 업무 문서 도구입니다.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function webPageSchema({
  name,
  description,
  path,
  keywords
}: {
  name: string;
  description: string;
  path: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "ko-KR",
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
    isPartOf: {
      "@type": "WebSite",
      name: brandName,
      url: siteUrl
    },
    publisher: {
      "@type": "Organization",
      name: brandName,
      url: siteUrl
    }
  };
}

export function toolItemListSchema(tools: ToolInfo[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "K문서툴 무료 업무 문서 도구",
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.title,
      url: absoluteUrl(tool.path)
    }))
  };
}

export function collectionPageSchema({
  name,
  description,
  path,
  tools
}: {
  name: string;
  description: string;
  path: string;
  tools: ToolInfo[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "ko-KR",
    mainEntity: toolItemListSchema(tools)
  };
}
