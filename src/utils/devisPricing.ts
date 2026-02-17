export type ArticleRow = {
  art_id: number;
  art_name: string;
  art_price: number;
  remises?: {
    rem_pourcentage?: number | null;
    rem_prixremise?: number | null;
  } | null;
};

export type LineRow = {
  art_id: number;
  quantite: number;
  reference: string;
};

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n));

export const getUnitHT = (art?: ArticleRow) => {
  if (!art) return 0;
  const r = art.remises;
  if (r?.rem_prixremise != null) return Number(r.rem_prixremise);
  if (r?.rem_pourcentage != null) {
    const p = Number(r.rem_pourcentage);
    return Number(art.art_price) * (1 - p / 100);
  }
  return Number(art.art_price);
};

export const getRemiseLabel = (art?: ArticleRow) => {
  const r = art?.remises;
  if (!r) return "—";
  if (r.rem_pourcentage != null) return `${r.rem_pourcentage}%`;
  if (r.rem_prixremise != null) return `${formatMoney(Number(r.rem_prixremise))} F`;
  return "—";
};

export const lineTotalHT = (line: Pick<LineRow, "art_id" | "quantite">, articles: ArticleRow[]) => {
  const art = articles.find((a) => a.art_id === line.art_id);
  return getUnitHT(art) * Number(line.quantite || 0);
};

export const calcTotals = (lines: LineRow[], articles: ArticleRow[], devTva: number) => {
  const totalHT = lines.reduce((sum, l) => sum + lineTotalHT(l, articles), 0);
  const tva = Number(devTva || 0);
  const totalTTC = totalHT * (1 + tva / 100);
  return { totalHT, totalTTC };
};
