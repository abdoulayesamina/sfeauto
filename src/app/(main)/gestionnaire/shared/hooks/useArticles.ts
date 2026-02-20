"use client";

import { ArticleRow } from "@/src/utils/devisPricing";
import { useEffect, useState } from "react";

export function useArticles(open: boolean) {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;

    (async () => {
      setFetching(true);
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        if (!alive) return;
        setArticles(Array.isArray(data?.articles) ? data.articles : []);
      } catch {
        if (!alive) return;
        setArticles([]);
      } finally {
        if (!alive) return;
        setFetching(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open]);

  return { articles, fetching };
}
