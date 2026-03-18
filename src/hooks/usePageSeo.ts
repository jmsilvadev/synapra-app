import { useEffect } from "react";

type SeoConfig = {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  imagePath?: string;
  type?: "website" | "article";
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
};

function upsertMetaByName(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function upsertJsonLd(id: string, data: Record<string, unknown> | Array<Record<string, unknown>>) {
  let script = document.querySelector(`script[data-seo-id="${id}"]`) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-seo-id", id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function usePageSeo(config: SeoConfig) {
  useEffect(() => {
    const base = window.location.origin;
    const path = config.path || window.location.pathname;
    const canonicalUrl = new URL(path, base).toString();
    const imageUrl = new URL(config.imagePath || "/synapra_og_image.svg", base).toString();
    const htmlLang = (document.documentElement.lang || "en-US").replace("-", "_");

    document.title = config.title;

    upsertMetaByName("description", config.description);
    upsertMetaByName(
      "keywords",
      config.keywords ||
        "agentes de IA, IA para empresas, AI agents, enterprise AI, contexto para LLM, developer productivity, engenharia de software com IA"
    );
    upsertMetaByName("robots", "index, follow");
    upsertMetaByName("author", "Synapra");
    upsertMetaByName("twitter:site", "@synapra");
    upsertMetaByName("twitter:creator", "@synapra");
    upsertMetaByName("twitter:url", canonicalUrl);
    upsertMetaByName("twitter:image", imageUrl);
    upsertMetaByName("twitter:image:alt", "Synapra");

    upsertMetaByProperty("og:type", config.type || "website");
    upsertMetaByProperty("og:site_name", "Synapra");
    upsertMetaByProperty("og:locale", htmlLang);
    upsertMetaByProperty("og:title", config.title);
    upsertMetaByProperty("og:description", config.description);
    upsertMetaByProperty("og:url", canonicalUrl);
    upsertMetaByProperty("og:image", imageUrl);
    upsertMetaByProperty("og:image:alt", "Synapra");
    upsertMetaByProperty("og:image:type", "image/svg+xml");
    upsertMetaByProperty("og:image:width", "1200");
    upsertMetaByProperty("og:image:height", "630");

    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", config.title);
    upsertMetaByName("twitter:description", config.description);

    upsertCanonical(canonicalUrl);

    if (config.structuredData) {
      upsertJsonLd("page-seo", config.structuredData);
    }
  }, [config.description, config.imagePath, config.keywords, config.path, config.structuredData, config.title, config.type]);
}
