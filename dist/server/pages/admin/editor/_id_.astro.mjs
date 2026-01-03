/* empty css                                           */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../../chunks/astro/server_BmgwVtGw.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../../chunks/Layout_DQDs7h2h.mjs';
import { d as db } from '../../../chunks/db_BWDFEkDL.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  if (!Astro2.cookies.has("admin_session")) {
    return Astro2.redirect("/admin/login");
  }
  const { id } = Astro2.params;
  const isNew = id === "new";
  let post = {
    title: "",
    slug: "",
    category: "",
    image: "",
    excerpt: "",
    content: ""
  };
  if (!isNew && id) {
    const existing = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
    if (existing) {
      post = existing;
    } else {
      return Astro2.redirect("/admin/dashboard");
    }
  }
  let error = "";
  if (Astro2.request.method === "POST") {
    try {
      const formData = await Astro2.request.formData();
      const title = formData.get("title");
      let slug = formData.get("slug");
      const category = formData.get("category");
      const image = formData.get("image");
      const excerpt = formData.get("excerpt");
      const content = formData.get("content");
      if (!slug) {
        slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      }
      if (isNew) {
        db.prepare("INSERT INTO posts (title, slug, category, image, excerpt, content) VALUES (?, ?, ?, ?, ?, ?)").run(title, slug, category, image, excerpt, content);
      } else {
        db.prepare("UPDATE posts SET title = ?, slug = ?, category = ?, image = ?, excerpt = ?, content = ? WHERE id = ?").run(title, slug, category, image, excerpt, content, id);
      }
      return Astro2.redirect("/admin/dashboard");
    } catch (e) {
      error = "Hata: " + e.message;
    }
  }
  const categories = ["Yeme-\u0130\xE7me", "Etkinlik", "Gezi", "Sanat", "Gece Hayat\u0131", "Di\u011Fer"];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": isNew ? "Yeni Yaz\u0131 Ekle" : "Yaz\u0131y\u0131 D\xFCzenle" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8 max-w-4xl"> <div class="flex items-center justify-between mb-8"> <h1 class="text-3xl font-bold text-dark">${isNew ? "Yeni Yaz\u0131 Ekle" : "Yaz\u0131y\u0131 D\xFCzenle"}</h1> <a href="/admin/dashboard" class="text-gray-500 hover:text-dark">Geri Dön</a> </div> ${error && renderTemplate`<div class="bg-red-100 text-red-700 p-4 rounded-lg mb-6"> ${error} </div>`} <form method="POST" class="bg-white p-8 rounded-card shadow-lg space-y-6"> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div class="col-span-1"> <label class="block text-sm font-semibold text-gray-700 mb-2">Başlık</label> <input type="text" name="title"${addAttribute(post.title, "value")} required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" placeholder="Yazı başlığı..."> </div> <div class="col-span-1"> <label class="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label> <input type="text" name="slug"${addAttribute(post.slug, "value")} class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" placeholder="yazi-basligi (Otomatik oluşturulur)"> </div> <div class="col-span-1"> <label class="block text-sm font-semibold text-gray-700 mb-2">Kategori</label> <select name="category" required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"> <option value="">Seçiniz</option> ${categories.map((c) => renderTemplate`<option${addAttribute(c, "value")}${addAttribute(post.category === c, "selected")}>${c}</option>`)} </select> </div> <div class="col-span-1"> <label class="block text-sm font-semibold text-gray-700 mb-2">Görsel URL</label> <input type="url" name="image"${addAttribute(post.image, "value")} required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" placeholder="https://example.com/image.jpg"> </div> <div class="col-span-2"> <label class="block text-sm font-semibold text-gray-700 mb-2">Kısa Özet</label> <textarea name="excerpt" rows="3" required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none" placeholder="Yazının kısa bir özeti...">${post.excerpt}</textarea> </div> <div class="col-span-2"> <label class="block text-sm font-semibold text-gray-700 mb-2">İçerik (HTML veya Düz Metin)</label> <textarea name="content" rows="15" required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-mono text-sm leading-relaxed" placeholder="İçeriğinizi buraya yazın...">${post.content}</textarea> </div> </div> <div class="pt-4 border-t border-gray-100 flex justify-end"> <button type="submit" class="px-8 py-3 bg-primary text-white font-bold rounded-btn hover:opacity-90 transition shadow-lg transform active:scale-95"> ${isNew ? "Yay\u0131nla" : "G\xFCncelle"} </button> </div> </form> </div> ` })}`;
}, "C:/Users/Yi\u011Fit/Desktop/\u0130zmir Uzman\u0131 Website/src/pages/admin/editor/[id].astro", void 0);

const $$file = "C:/Users/Yiğit/Desktop/İzmir Uzmanı Website/src/pages/admin/editor/[id].astro";
const $$url = "/admin/editor/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
