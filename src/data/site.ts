import type { Bi, Category, Product } from "./catalog";

/**
 * Editable business data. In this static Vite app it is stored in the browser's
 * localStorage by StoreProvider, which makes the admin area useful without a
 * backend while keeping the source catalogue as a safe default.
 */
export type SiteInfo = {
  interfaceTitle: Bi;
  brandName: Bi;
  tagline: Bi;
  about: Bi;
  address: Bi;
  hours: Bi;
  phone: string;
  whatsapp: string;
  email: string;
  mapUrl: string;
  facebook: string;
  instagram: string;
  tiktok: string;
};

export const DEFAULT_SITE_INFO: SiteInfo = {
  interfaceTitle: { ar: "تولين للبضائع الأروبية | أهلاً بك — طرابلس، ليبيا", en: "TOLIN European Goods | Welcome — Tripoli, Libya" },
  brandName: { ar: "تولين للبضائع الأروبية", en: "TOLIN European Goods" },
  tagline: { ar: "بيتك أوروبي… من طرابلس", en: "A European home, from Tripoli" },
  about: {
    ar: "تولين للبضائع الأروبية — محل ليبي متخصص في منتجات المنزل، الأجهزة الكهربائية الأوروبية المستوردة، وعدّة البريكولاج. نخدمو من طرابلس لكل ليبيا.",
    en: "TOLIN European Goods — a Libyan store specialised in home products, imported European appliances and DIY tools. Serving all of Libya from Tripoli.",
  },
  address: { ar: "شارع الجمهورية، وسط المدينة — طرابلس، ليبيا", en: "Jumhuriya Street, City Centre — Tripoli, Libya" },
  hours: { ar: "السبت – الخميس: 9:00 صباحاً – 9:00 مساءً · الجمعة: 4:00 – 9:00 مساءً", en: "Sat – Thu: 9:00 AM – 9:00 PM · Fri: 4:00 – 9:00 PM" },
  phone: "+218 91 344 2640",
  whatsapp: "218913442640",
  email: "info@tolin-goods.ly",
  mapUrl: "https://www.google.com/maps/dir/?api=1&destination=Jumhuriya%20Street%2C%20Tripoli%2C%20Libya",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
};

export type EditableContent = {
  products: Product[];
  categories: Category[];
  site: SiteInfo;
};

export const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Converts a user-entered phone number to the format expected by wa.me. */
export function whatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}
