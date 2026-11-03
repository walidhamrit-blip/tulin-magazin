/**
 * Official “Website by Nukhba” badge.
 *
 * Snippet officiel : https://nokhba.net.ly/badge
 * Deux variantes existent — `nukhba-badge.svg` (pour un pied de page clair) et
 * `nukhba-badge-light.svg` (pour un pied de page sombre). Le footer du site est
 * sombre (bg-ink), on utilise donc la variante claire.
 *
 * Règles de la charte : lien réel vers nokhba.net.ly, `rel="sponsored nofollow noopener"`,
 * attribut alt bilingue, image non modifiée et non recadrée.
 */
const BADGE_HREF =
  "https://nokhba.net.ly/?utm_source=client_footer&utm_medium=badge&utm_campaign=client_credit";

const BADGE_SRC = "https://nokhba.net.ly/badge/nukhba-badge-light.svg";

export default function NukhbaBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={BADGE_HREF}
      target="_blank"
      rel="sponsored nofollow noopener"
      title="نخبة"
      className={`group inline-flex flex-col items-center gap-1.5 rounded-lg opacity-75 transition-opacity duration-300 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sun ${className}`}
    >
      <img
        src={BADGE_SRC}
        alt="نخبة | Website by Nukhba"
        width={176}
        height={44}
        loading="lazy"
        decoding="async"
        className="block h-auto w-[176px] max-w-full"
      />
      <span dir="ltr" className="text-[12px] leading-snug text-white/45 transition-colors group-hover:text-white/70">
        نخبة · Website by Nukhba
      </span>
    </a>
  );
}
