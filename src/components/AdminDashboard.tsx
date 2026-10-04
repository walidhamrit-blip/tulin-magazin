import { useMemo, useState, type ReactNode } from "react";
import { px, type Bi, type Category, type Product } from "../data/catalog";
import { copy, type SiteInfo } from "../data/site";
import { useStore } from "../store";

type Tab = "overview" | "products" | "categories" | "company";

const tabs: { id: Tab; label: string; icon: string; hint: string }[] = [
  { id: "overview", label: "Vue d’ensemble", icon: "◈", hint: "Résumé" },
  { id: "products", label: "Articles", icon: "▦", hint: "Catalogue" },
  { id: "categories", label: "Catégories", icon: "◫", hint: "Rayons" },
  { id: "company", label: "Entreprise & interface", icon: "⚙", hint: "Identité" },
];

const blankBi = (): Bi => ({ ar: "", en: "" });

function newProduct(categoryId: string): Product {
  return {
    id: `TL-${String(Date.now()).slice(-6)}`,
    cat: categoryId,
    name: blankBi(),
    desc: blankBi(),
    price: 0,
    img: 7587779,
    origin: blankBi(),
    rating: 4.5,
    reviews: 0,
    stock: 0,
    dim: "",
    mat: blankBi(),
    warranty: 12,
    badge: undefined,
  };
}

function newCategory(): Category {
  return { id: "", name: blankBi(), tagline: blankBi(), img: 7587779, accent: "#0058a3" };
}

function NavButton({ active, onClick, icon, label, hint }: { active: boolean; onClick: () => void; icon: string; label: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition-all ${
        active ? "bg-white text-ikea shadow-[0_10px_24px_-16px_rgba(0,88,163,.7)]" : "text-white/65 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={`grid h-8 w-8 place-items-center rounded-lg text-[17px] ${active ? "bg-ikea-soft text-ikea" : "bg-white/10 text-sun"}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold leading-tight">{label}</span>
        <span className={`mt-0.5 block text-[10px] ${active ? "text-ink-soft/65" : "text-white/35"}`}>{hint}</span>
      </span>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-sun" : "bg-transparent group-hover:bg-white/30"}`} />
    </button>
  );
}

function Field({ label, children, note }: { label: string; children: ReactNode; note?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">
        {label}
        {note && <span className="text-[10px] font-medium normal-case tracking-normal text-ink-soft/60">{note}</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none transition focus:border-ikea focus:ring-3 focus:ring-ikea/10";

function BiFields({ label, value, onChange, multiline = false }: { label: string; value: Bi; onChange: (value: Bi) => void; multiline?: boolean }) {
  const Input = multiline ? "textarea" : "input";
  return (
    <div className="rounded-xl border border-line bg-mist/70 p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-[10px] font-semibold text-ink-soft/70">العربية</span>
          <Input
            {...(multiline ? { rows: 3 } : { type: "text" })}
            dir="rtl"
            value={value.ar}
            onChange={(e) => onChange({ ...value, ar: e.target.value })}
            className={`${inputClass} ${multiline ? "resize-y" : ""}`}
          />
        </label>
        <label>
          <span className="mb-1 block text-[10px] font-semibold text-ink-soft/70">English</span>
          <Input
            {...(multiline ? { rows: 3 } : { type: "text" })}
            dir="ltr"
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            className={`${inputClass} ${multiline ? "resize-y" : ""}`}
          />
        </label>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-white shadow-[0_12px_30px_-26px_rgba(17,17,20,.6)] ${className}`}>{children}</div>;
}

function Modal({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-5">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-ink/65 backdrop-blur-sm" />
      <div className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-mist shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <h2 className="font-display text-[18px] font-black text-ink">{title}</h2>
            <p className="mt-1 text-[12px] text-ink-soft">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-mist text-[18px] text-ink-soft transition hover:bg-brick hover:text-white" aria-label="Fermer">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProductForm({ product, categories, existing, onSave, onClose }: { product: Product; categories: Category[]; existing: boolean; onSave: (product: Product) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Product>(() => copy(product));
  const set = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.id.trim() || !draft.name.ar.trim() || !draft.name.en.trim() || !draft.cat) return;
    onSave({ ...draft, id: draft.id.trim(), price: Math.max(0, Number(draft.price) || 0), img: Math.max(1, Math.round(Number(draft.img) || 1)) });
  };

  return (
    <Modal title={existing ? "Modifier l’article" : "Ajouter un article"} subtitle="Les deux langues sont utilisées sur la vitrine client." onClose={onClose}>
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Référence / SKU">
            <input required disabled={existing} value={draft.id} onChange={(e) => set("id", e.target.value)} className={`${inputClass} disabled:cursor-not-allowed disabled:bg-mist disabled:text-ink-soft`} />
          </Field>
          <Field label="Catégorie">
            <select required value={draft.cat} onChange={(e) => set("cat", e.target.value)} className={inputClass}>
              <option value="">Choisir une catégorie</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name.en || category.name.ar} ({category.id})</option>)}
            </select>
          </Field>
          <Field label="Badge">
            <select value={draft.badge ?? ""} onChange={(e) => set("badge", (e.target.value || undefined) as Product["badge"])} className={inputClass}>
              <option value="">Aucun badge</option>
              <option value="new">Nouveau</option>
              <option value="offer">Offre</option>
              <option value="best">Meilleure vente</option>
              <option value="import">Import spécial</option>
            </select>
          </Field>
        </div>

        <BiFields label="Nom de l’article" value={draft.name} onChange={(value) => set("name", value)} />
        <BiFields label="Description" value={draft.desc} onChange={(value) => set("desc", value)} multiline />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Prix (LYD)"><input required min="0" type="number" value={draft.price} onChange={(e) => set("price", Number(e.target.value))} className={inputClass} /></Field>
          <Field label="Ancien prix" note="optionnel"><input min="0" type="number" value={draft.old ?? ""} onChange={(e) => set("old", e.target.value === "" ? undefined : Number(e.target.value))} className={inputClass} /></Field>
          <Field label="Stock"><input min="0" type="number" value={draft.stock} onChange={(e) => set("stock", Math.max(0, Number(e.target.value)))} className={inputClass} /></Field>
          <Field label="Image Pexels ID"><input required min="1" type="number" value={draft.img} onChange={(e) => set("img", Number(e.target.value))} className={inputClass} /></Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Note / 5"><input min="0" max="5" step="0.1" type="number" value={draft.rating} onChange={(e) => set("rating", Math.min(5, Math.max(0, Number(e.target.value))))} className={inputClass} /></Field>
          <Field label="Nombre d’avis"><input min="0" type="number" value={draft.reviews} onChange={(e) => set("reviews", Math.max(0, Number(e.target.value)))} className={inputClass} /></Field>
          <Field label="Garantie (mois)"><input min="0" type="number" value={draft.warranty} onChange={(e) => set("warranty", Math.max(0, Number(e.target.value)))} className={inputClass} /></Field>
          <Field label="Dimensions"><input value={draft.dim} onChange={(e) => set("dim", e.target.value)} placeholder="ex. 60×40×20 cm" className={inputClass} /></Field>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BiFields label="Pays d’origine" value={draft.origin} onChange={(value) => set("origin", value)} />
          <BiFields label="Matière" value={draft.mat} onChange={(value) => set("mat", value)} />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-[13px] font-bold text-ink-soft transition hover:bg-white">Annuler</button>
          <button type="submit" className="rounded-full bg-ikea px-6 py-3 font-display text-[13px] font-bold text-white transition hover:bg-ikea-deep">Enregistrer l’article</button>
        </div>
      </form>
    </Modal>
  );
}

function CategoryForm({ category, existing, onSave, onClose }: { category: Category; existing: boolean; onSave: (category: Category) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Category>(() => copy(category));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.id.trim() || !draft.name.ar.trim() || !draft.name.en.trim()) return;
    onSave({ ...draft, id: draft.id.trim().toLowerCase().replace(/\s+/g, "-"), img: Math.max(1, Math.round(Number(draft.img) || 1)) });
  };
  return (
    <Modal title={existing ? "Modifier la catégorie" : "Ajouter une catégorie"} subtitle="La couleur et l’image sont immédiatement visibles sur les cartes de rayons." onClose={onClose}>
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Identifiant">
            <input required disabled={existing} value={draft.id} onChange={(e) => setDraft((p) => ({ ...p, id: e.target.value }))} placeholder="ex. outdoor" className={`${inputClass} disabled:cursor-not-allowed disabled:bg-mist`} />
          </Field>
          <Field label="Image Pexels ID"><input required min="1" type="number" value={draft.img} onChange={(e) => setDraft((p) => ({ ...p, img: Number(e.target.value) }))} className={inputClass} /></Field>
          <Field label="Couleur d’accent"><input required type="color" value={draft.accent} onChange={(e) => setDraft((p) => ({ ...p, accent: e.target.value }))} className="h-[42px] w-full cursor-pointer rounded-xl border border-line bg-white p-1.5" /></Field>
        </div>
        <BiFields label="Nom de la catégorie" value={draft.name} onChange={(value) => setDraft((p) => ({ ...p, name: value }))} />
        <BiFields label="Accroche" value={draft.tagline} onChange={(value) => setDraft((p) => ({ ...p, tagline: value }))} multiline />
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-[13px] font-bold text-ink-soft transition hover:bg-white">Annuler</button>
          <button type="submit" className="rounded-full bg-ikea px-6 py-3 font-display text-[13px] font-bold text-white transition hover:bg-ikea-deep">Enregistrer la catégorie</button>
        </div>
      </form>
    </Modal>
  );
}

function Overview({ onTab }: { onTab: (tab: Tab) => void }) {
  const { products, categories, site } = useStore();
  const offers = products.filter((product) => product.old && product.old > product.price).length;
  const lowStock = products.filter((product) => product.stock <= 5).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const stats = [
    { label: "Articles", value: products.length, icon: "▦", tone: "bg-ikea-soft text-ikea", tab: "products" as Tab },
    { label: "Catégories", value: categories.length, icon: "◫", tone: "bg-sun/30 text-ink", tab: "categories" as Tab },
    { label: "En promotion", value: offers, icon: "%", tone: "bg-brick/10 text-brick", tab: "products" as Tab },
    { label: "Stock total", value: totalStock, icon: "◈", tone: "bg-leaf/10 text-leaf", tab: "products" as Tab },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <button key={stat.label} type="button" onClick={() => onTab(stat.tab)} className="group text-start">
            <Panel className="p-4 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-ikea/40 group-hover:shadow-[0_18px_35px_-26px_rgba(0,88,163,.75)]">
              <div className="flex items-start justify-between gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl text-[17px] font-black ${stat.tone}`}>{stat.icon}</span><span className="text-[10px] font-bold uppercase tracking-[.13em] text-ink-soft/50">Gérer →</span></div>
              <p className="mt-5 font-display text-[29px] font-black leading-none text-ink tabular">{stat.value}</p>
              <p className="mt-1.5 text-[12px] font-medium text-ink-soft">{stat.label}</p>
            </Panel>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div><h2 className="font-display text-[15px] font-black text-ink">Stock à surveiller</h2><p className="mt-1 text-[11.5px] text-ink-soft">Articles avec cinq unités ou moins.</p></div>
            <button type="button" onClick={() => onTab("products")} className="text-[12px] font-bold text-ikea hover:underline">Voir les articles</button>
          </div>
          {lowStock ? (
            <div className="divide-y divide-line">
              {products.filter((product) => product.stock <= 5).slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <img src={px(product.img, 80, 80)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold text-ink">{product.name.en || product.name.ar}</p><p className="mt-0.5 text-[10.5px] text-ink-soft">{product.id}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold tabular ${product.stock === 0 ? "bg-brick/10 text-brick" : "bg-sun/30 text-ink"}`}>{product.stock} u.</span>
                </div>
              ))}
            </div>
          ) : <p className="px-5 py-10 text-center text-[13px] text-ink-soft">Tout le stock est supérieur à cinq unités.</p>}
        </Panel>
        <Panel className="p-5">
          <span className="inline-flex rounded-full bg-ikea-soft px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-ikea">Vitrine actuelle</span>
          <h2 className="mt-4 font-display text-[19px] font-black leading-tight text-ink">{site.brandName.en}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{site.tagline.en}</p>
          <div className="mt-5 rounded-xl bg-mist p-3"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-ink-soft/60">Titre de l’interface</p><p className="mt-1 text-[12.5px] font-semibold text-ink">{site.interfaceTitle.en}</p></div>
          <button type="button" onClick={() => onTab("company")} className="mt-4 w-full rounded-full border border-ikea/25 px-4 py-2.5 text-[12px] font-bold text-ikea transition hover:bg-ikea hover:text-white">Modifier l’identité</button>
        </Panel>
      </div>
    </div>
  );
}

function ProductsTab() {
  const { products, categories, saveProduct, deleteProduct, notify } = useStore();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{ product: Product; existing: boolean } | null>(null);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => !term || `${product.id} ${product.name.ar} ${product.name.en} ${product.cat}`.toLowerCase().includes(term));
  }, [products, search]);
  const categoryName = (id: string) => categories.find((category) => category.id === id)?.name.en ?? id;

  const remove = (product: Product) => {
    if (!window.confirm(`Supprimer « ${product.name.en || product.name.ar} » ?`)) return;
    deleteProduct(product.id);
    notify("Article supprimé du catalogue.");
  };
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="font-display text-[20px] font-black text-ink">Articles</h2><p className="mt-1 text-[12.5px] text-ink-soft">Ajoutez, corrigez les prix et gérez le stock du catalogue.</p></div>
        <button type="button" disabled={!categories.length} onClick={() => setForm({ product: newProduct(categories[0]?.id ?? ""), existing: false })} className="rounded-full bg-ikea px-5 py-3 text-[13px] font-bold text-white transition hover:bg-ikea-deep disabled:cursor-not-allowed disabled:bg-ink-soft">+ Nouvel article</button>
      </div>
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block max-w-md flex-1"><span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-soft">⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom, SKU ou catégorie…" className={`${inputClass} ps-8`} /></label>
          <p className="text-[12px] text-ink-soft"><b className="text-ink">{filtered.length}</b> article{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-start">
            <thead className="bg-mist/80 text-[10px] font-black uppercase tracking-[.12em] text-ink-soft"><tr><th className="px-5 py-3">Article</th><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3">Prix</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Statut</th><th className="px-5 py-3 text-end">Actions</th></tr></thead>
            <tbody className="divide-y divide-line">
              {filtered.map((product) => <tr key={product.id} className="transition hover:bg-ikea-soft/30"><td className="px-5 py-3"><div className="flex items-center gap-3"><img src={px(product.img, 100, 100)} alt="" className="h-11 w-11 rounded-lg object-cover" /><div className="min-w-0"><p className="max-w-[220px] truncate text-[13px] font-bold text-ink">{product.name.en || product.name.ar}</p><p className="mt-0.5 text-[10.5px] text-ink-soft">{product.id}</p></div></div></td><td className="px-4 py-3 text-[12px] text-ink-soft">{categoryName(product.cat)}</td><td className="px-4 py-3 text-[12.5px] font-bold tabular text-ink">{product.price.toLocaleString("en-US")} LYD{product.old && <span className="ms-1.5 text-[10.5px] font-medium text-ink-soft line-through">{product.old.toLocaleString("en-US")}</span>}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold tabular ${product.stock <= 5 ? "bg-brick/10 text-brick" : "bg-leaf/10 text-leaf"}`}>{product.stock} u.</span></td><td className="px-4 py-3">{product.badge ? <span className="rounded-full bg-ikea-soft px-2.5 py-1 text-[10px] font-bold capitalize text-ikea">{product.badge}</span> : <span className="text-[11px] text-ink-soft/55">Standard</span>}</td><td className="px-5 py-3 text-end"><div className="inline-flex gap-2"><button type="button" onClick={() => setForm({ product, existing: true })} className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-ikea transition hover:border-ikea hover:bg-ikea hover:text-white">Modifier</button><button type="button" onClick={() => remove(product)} className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-brick transition hover:bg-brick/10">Supprimer</button></div></td></tr>)}
              {!filtered.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-[13px] text-ink-soft">Aucun article ne correspond à cette recherche.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
      {form && <ProductForm product={form.product} categories={categories} existing={form.existing} onClose={() => setForm(null)} onSave={(product) => { saveProduct(product); notify(form.existing ? "Article mis à jour." : "Article ajouté au catalogue."); setForm(null); }} />}
    </>
  );
}

function CategoriesTab() {
  const { categories, products, saveCategory, deleteCategory, notify } = useStore();
  const [form, setForm] = useState<{ category: Category; existing: boolean } | null>(null);
  const remove = (category: Category) => {
    const count = products.filter((product) => product.cat === category.id).length;
    if (count) { notify(`Impossible : ${count} article${count > 1 ? "s" : ""} utilise${count > 1 ? "nt" : ""} cette catégorie.`); return; }
    if (!window.confirm(`Supprimer la catégorie « ${category.name.en || category.name.ar} » ?`)) return;
    deleteCategory(category.id); notify("Catégorie supprimée.");
  };
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-[20px] font-black text-ink">Catégories</h2><p className="mt-1 text-[12.5px] text-ink-soft">Organisez les rayons affichés dans le menu et le catalogue.</p></div><button type="button" onClick={() => setForm({ category: newCategory(), existing: false })} className="rounded-full bg-ikea px-5 py-3 text-[13px] font-bold text-white transition hover:bg-ikea-deep">+ Nouvelle catégorie</button></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => { const count = products.filter((product) => product.cat === category.id).length; return <Panel key={category.id} className="group overflow-hidden"><div className="relative h-28 overflow-hidden bg-ink"><img src={px(category.img, 700, 360)} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"/><span className="absolute inset-x-0 bottom-0 h-1" style={{ background: category.accent }} /></div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-display text-[15px] font-black text-ink">{category.name.en || category.name.ar}</p><p className="mt-1 text-[10.5px] text-ink-soft">/{category.id}</p></div><span className="rounded-full bg-mist px-2.5 py-1 text-[10.5px] font-bold text-ink-soft">{count} article{count !== 1 ? "s" : ""}</span></div><p className="mt-3 min-h-9 text-[12px] leading-relaxed text-ink-soft">{category.tagline.en || category.tagline.ar}</p><div className="mt-4 flex gap-2 border-t border-line pt-3"><button type="button" onClick={() => setForm({ category, existing: true })} className="flex-1 rounded-lg border border-line py-2 text-[11px] font-bold text-ikea transition hover:border-ikea hover:bg-ikea hover:text-white">Modifier</button><button type="button" onClick={() => remove(category)} className="rounded-lg px-3 text-[11px] font-bold text-brick transition hover:bg-brick/10">Supprimer</button></div></div></Panel>; })}
      </div>
      {!categories.length && <Panel className="p-12 text-center text-[13px] text-ink-soft">Aucune catégorie. Créez-en une avant d’ajouter des articles.</Panel>}
      {form && <CategoryForm category={form.category} existing={form.existing} onClose={() => setForm(null)} onSave={(category) => { saveCategory(category); notify(form.existing ? "Catégorie mise à jour." : "Catégorie ajoutée."); setForm(null); }} />}
    </>
  );
}

function CompanyTab() {
  const { site, updateSite, notify } = useStore();
  const [draft, setDraft] = useState<SiteInfo>(() => copy(site));
  const set = <K extends keyof SiteInfo>(key: K, value: SiteInfo[K]) => setDraft((prev) => ({ ...prev, [key]: value }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); updateSite(draft); notify("Informations de l’entreprise enregistrées."); };
  return (
    <form onSubmit={submit} className="space-y-5">
      <div><h2 className="font-display text-[20px] font-black text-ink">Entreprise & interface</h2><p className="mt-1 text-[12.5px] text-ink-soft">Ces informations alimentent le logo, le titre de l’onglet, les liens de contact et le pied de page.</p></div>
      <Panel className="p-4 sm:p-5"><div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ikea-soft text-ikea">Aa</span><div><h3 className="font-display text-[14px] font-black text-ink">Identité de la vitrine</h3><p className="text-[11px] text-ink-soft">Le titre est affiché dans l’onglet du navigateur.</p></div></div><div className="grid gap-4 lg:grid-cols-2"><BiFields label="Titre de l’interface" value={draft.interfaceTitle} onChange={(value) => set("interfaceTitle", value)} /><BiFields label="Nom de la marque" value={draft.brandName} onChange={(value) => set("brandName", value)} /><BiFields label="Slogan" value={draft.tagline} onChange={(value) => set("tagline", value)} /><BiFields label="Présentation de l’entreprise" value={draft.about} onChange={(value) => set("about", value)} multiline /></div></Panel>
      <Panel className="p-4 sm:p-5"><div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sun/35 text-ink">⌖</span><div><h3 className="font-display text-[14px] font-black text-ink">Coordonnées</h3><p className="text-[11px] text-ink-soft">Utilisées dans le showroom et le footer.</p></div></div><div className="grid gap-4 lg:grid-cols-2"><BiFields label="Adresse" value={draft.address} onChange={(value) => set("address", value)} multiline /><BiFields label="Horaires" value={draft.hours} onChange={(value) => set("hours", value)} multiline /><Field label="Téléphone affiché"><input required value={draft.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} placeholder="+218 …" /></Field><Field label="Numéro WhatsApp" note="chiffres seulement"><input required value={draft.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputClass} placeholder="218…" /></Field><Field label="E-mail"><input required type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} className={inputClass} /></Field><Field label="Lien Google Maps"><input type="url" value={draft.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} className={inputClass} placeholder="https://…" /></Field></div></Panel>
      <Panel className="p-4 sm:p-5"><div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf/10 text-leaf">↗</span><div><h3 className="font-display text-[14px] font-black text-ink">Réseaux sociaux</h3><p className="text-[11px] text-ink-soft">Les boutons du pied de page ouvrent ces liens.</p></div></div><div className="grid gap-3 sm:grid-cols-3"><Field label="Facebook"><input type="url" value={draft.facebook} onChange={(e) => set("facebook", e.target.value)} className={inputClass} /></Field><Field label="Instagram"><input type="url" value={draft.instagram} onChange={(e) => set("instagram", e.target.value)} className={inputClass} /></Field><Field label="TikTok"><input type="url" value={draft.tiktok} onChange={(e) => set("tiktok", e.target.value)} className={inputClass} /></Field></div></Panel>
      <div className="sticky bottom-4 z-20 flex justify-end"><button type="submit" className="rounded-full bg-ikea px-6 py-3 font-display text-[13px] font-bold text-white shadow-[0_14px_28px_-14px_rgba(0,88,163,.9)] transition hover:bg-ikea-deep">Enregistrer les informations</button></div>
    </form>
  );
}

export default function AdminDashboard() {
  const { products, categories, site, resetContent, notify, toast } = useStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const current = tabs.find((item) => item.id === tab)!;
  const goSite = () => { window.location.hash = ""; };
  const reset = () => { if (!window.confirm("Restaurer tous les articles, catégories et informations d’origine ? Cette action ne peut pas être annulée.")) return; resetContent(); notify("Les données d’origine ont été restaurées."); setTab("overview"); };
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-ink" dir="ltr">
      <div className="fixed inset-x-0 top-0 z-[90] h-1 bg-gradient-to-r from-ikea via-sun to-ikea" />
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink px-4 py-6 lg:flex">
          <button type="button" onClick={() => setTab("overview")} className="mb-8 flex items-center gap-3 px-2 text-start"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sun font-display text-[16px] font-black text-ikea-deep">T</span><span><span className="block font-display text-[15px] font-black text-white">TOLIN Admin</span><span className="mt-0.5 block text-[10px] tracking-[.14em] text-white/45">CENTRE DE GESTION</span></span></button>
          <nav className="space-y-1">{tabs.map((item) => <NavButton key={item.id} {...item} active={tab === item.id} onClick={() => setTab(item.id)} />)}</nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.045] p-3"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-sun">Données locales</p><p className="mt-2 text-[11px] leading-relaxed text-white/55">Les modifications sont sauvegardées dans ce navigateur et s’affichent immédiatement sur la vitrine.</p><button type="button" onClick={reset} className="mt-3 text-[11px] font-bold text-white/65 transition hover:text-sun">↺ Restaurer les données d’origine</button></div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur"><div className="flex min-h-18 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8"><button type="button" onClick={() => setMobileNav((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-lg text-white lg:hidden" aria-label="Menu administration">☰</button><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-ikea">Administration</p><h1 className="truncate font-display text-[17px] font-black text-ink">{current.label}</h1></div><div className="hidden items-center gap-2 sm:flex"><span className="rounded-full bg-leaf/10 px-3 py-1.5 text-[11px] font-bold text-leaf">● Brouillon enregistré</span><span className="text-[12px] text-ink-soft">{site.brandName.en}</span></div><button type="button" onClick={goSite} className="rounded-full border border-ikea/25 px-3.5 py-2.5 text-[12px] font-bold text-ikea transition hover:bg-ikea hover:text-white sm:px-4">↗ Voir le site</button></div>{mobileNav && <div className="border-t border-line bg-ink p-3 lg:hidden"><nav className="grid gap-1 sm:grid-cols-2">{tabs.map((item) => <NavButton key={item.id} {...item} active={tab === item.id} onClick={() => { setTab(item.id); setMobileNav(false); }} />)}</nav><button type="button" onClick={reset} className="mt-2 px-3 py-2 text-[11px] font-bold text-white/60">↺ Restaurer les données d’origine</button></div>}</header>
          <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ikea/15 bg-ikea-soft/55 p-3.5 text-[12px] text-ink-soft sm:flex-row sm:items-center sm:justify-between"><span><b className="text-ikea">Mode gestion :</b> {products.length} articles · {categories.length} catégories · publication instantanée dans ce navigateur.</span><button type="button" onClick={goSite} className="font-bold text-ikea hover:underline">Ouvrir la vitrine →</button></div>{tab === "overview" && <Overview onTab={setTab} />}{tab === "products" && <ProductsTab />}{tab === "categories" && <CategoriesTab />}{tab === "company" && <CompanyTab />}</div>
        </main>
      </div>
      {toast && (
        <div className="fixed bottom-5 start-1/2 z-[110] -translate-x-1/2 rounded-full bg-ink px-4 py-3 text-[12.5px] font-semibold text-white shadow-xl">
          <span className="me-2 text-sun">✓</span>{toast}
        </div>
      )}
    </div>
  );
}
