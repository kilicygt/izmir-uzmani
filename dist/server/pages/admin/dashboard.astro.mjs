/* empty css                                        */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_BmgwVtGw.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_DQDs7h2h.mjs';
import { d as db } from '../../chunks/db_BWDFEkDL.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  if (!Astro2.cookies.has("admin_session")) {
    return Astro2.redirect("/admin/login");
  }
  if (Astro2.request.method === "POST") {
    const data = await Astro2.request.formData();
    const id = data.get("delete_id");
    if (id) {
      db.prepare("DELETE FROM posts WHERE id = ?").run(id);
    }
  }
  const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dashboard - \u0130zmir Uzman\u0131" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <div class="flex justify-between items-center mb-8"> <h1 class="text-3xl font-bold text-dark">Yönetim Paneli</h1> <div class="flex gap-4"> <a href="/" target="_blank" class="px-4 py-2 bg-gray-100 text-dark rounded-btn font-medium hover:bg-gray-200">Siteyi Gör</a> <a href="/admin/editor/new" class="px-4 py-2 bg-primary text-white rounded-btn font-bold hover:opacity-90 shadow-md flex items-center gap-2"> <span>+</span> Yeni Yazı
</a> </div> </div> <div class="bg-white rounded-card shadow-sm border border-gray-100 overflow-hidden"> <table class="w-full text-left"> <thead class="bg-gray-50 border-b border-gray-100"> <tr> <th class="p-4 font-semibold text-gray-600">Başlık</th> <th class="p-4 font-semibold text-gray-600">Kategori</th> <th class="p-4 font-semibold text-gray-600">Tarih</th> <th class="p-4 font-semibold text-gray-600 text-right">İşlemler</th> </tr> </thead> <tbody> ${posts.map((post) => renderTemplate`<tr class="border-b border-gray-50 hover:bg-gray-50/50 transition"> <td class="p-4 font-medium text-dark">${post.title}</td> <td class="p-4 text-gray-600"> <span class="px-2 py-1 bg-gray-100 rounded text-xs">${post.category}</span> </td> <td class="p-4 text-gray-500 text-sm">${new Date(post.created_at).toLocaleDateString("tr-TR")}</td> <td class="p-4 text-right flex justify-end gap-2 text-sm"> <a${addAttribute(`/admin/editor/${post.id}`, "href")} class="text-blue-600 hover:underline font-medium">Düzenle</a> <form method="POST" onsubmit="return confirm('Bu yazıyı silmek istediğinize emin misiniz?');"> <input type="hidden" name="delete_id"${addAttribute(post.id, "value")}> <button type="submit" class="text-red-500 hover:underline font-medium ml-2">Sil</button> </form> </td> </tr>`)} ${posts.length === 0 && renderTemplate`<tr> <td colspan="4" class="p-8 text-center text-gray-400">Henüz hiç yazı yok.</td> </tr>`} </tbody> </table> </div> </div> ` })}`;
}, "C:/Users/Yi\u011Fit/Desktop/\u0130zmir Uzman\u0131 Website/src/pages/admin/dashboard.astro", void 0);

const $$file = "C:/Users/Yiğit/Desktop/İzmir Uzmanı Website/src/pages/admin/dashboard.astro";
const $$url = "/admin/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
