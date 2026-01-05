/* empty css                                        */
import { e as createAstro, f as createComponent, r as renderTemplate, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_oNzcvkI7.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_CaEXNdZn.mjs';
import { c as client } from '../../chunks/db_CQPV1YBr.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://izmiruzmani.com");
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  if (!Astro2.cookies.has("admin_session")) {
    return Astro2.redirect("/admin/login");
  }
  if (Astro2.request.method === "POST") {
    try {
      const formData = await Astro2.request.formData();
      const action = formData.get("action");
      const id = formData.get("id");
      if (action === "delete" && id) {
        await client.execute({
          sql: "DELETE FROM posts WHERE id = ?",
          args: [id]
        });
        return Astro2.redirect("/admin/dashboard?deleted=true");
      }
    } catch (e) {
      console.error("Silme hatas\u0131:", e.message);
    }
  }
  const result = await client.execute("SELECT * FROM posts ORDER BY created_at DESC");
  const posts = result.rows;
  const categories = ["Yeme-\u0130\xE7me", "Etkinlikler", "Gezi", "Sanat", "Gece Hayat\u0131", "Di\u011Fer"];
  return renderTemplate(_a || (_a = __template(["", " <script>\n  document.querySelectorAll('.delete-post-btn').forEach(btn => {\n    btn.addEventListener('click', () => {\n      const id = btn.getAttribute('data-id');\n      const title = btn.getAttribute('data-title');\n      \n      if (confirm(`\"${title}\" ba\u015Fl\u0131kl\u0131 yaz\u0131y\u0131 silmek istedi\u011Finize emin misiniz?`)) {\n        document.getElementById('delete-id').value = id;\n        document.getElementById('delete-form').submit();\n      }\n    });\n  });\n<\/script>"], ["", " <script>\n  document.querySelectorAll('.delete-post-btn').forEach(btn => {\n    btn.addEventListener('click', () => {\n      const id = btn.getAttribute('data-id');\n      const title = btn.getAttribute('data-title');\n      \n      if (confirm(\\`\"\\${title}\" ba\u015Fl\u0131kl\u0131 yaz\u0131y\u0131 silmek istedi\u011Finize emin misiniz?\\`)) {\n        document.getElementById('delete-id').value = id;\n        document.getElementById('delete-form').submit();\n      }\n    });\n  });\n<\/script>"])), renderComponent($$result, "Layout", $$Layout, { "title": "Admin Panel" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-12 max-w-6xl"> <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"> <div> <h1 class="text-4xl font-black text-dark tracking-tight">İçerik Yönetimi</h1> <p class="text-gray-500 mt-2 font-medium">Toplam ${posts.length} yazı bulunmaktadır.</p> </div> <div class="flex gap-4"> <a href="/admin/editor/new" class="px-8 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-btn hover:bg-secondary transition-all shadow-xl hover:shadow-primary/20 flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
Yeni Yazı Ekle
</a> <button onclick="document.cookie='admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'; location.href='/admin/login';" class="px-6 py-4 bg-gray-100 text-gray-500 font-bold uppercase text-[10px] tracking-widest rounded-btn hover:bg-red-50 hover:text-red-500 transition-all">Sistemden Çık</button> </div> </div> <!-- Stats Row --> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"> ${categories.slice(0, 4).map((cat) => renderTemplate`<div class="bg-white p-6 rounded-card shadow-lg border border-gray-100"> <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">${cat}</span> <p class="text-3xl font-black text-dark mt-1">${posts.filter((p) => p.category === cat).length}</p> </div>`)} </div> <div class="bg-white rounded-card shadow-2xl border border-gray-100 overflow-hidden"> <div class="overflow-x-auto"> <table class="w-full text-left"> <thead> <tr class="bg-gray-50 border-b border-gray-100"> <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Yazı</th> <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</th> <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th> </tr> </thead> <tbody class="divide-y divide-gray-50"> ${posts.map((post) => renderTemplate`<tr class="hover:bg-gray-50/50 transition-colors group"> <td class="px-6 py-5"> <div class="flex items-center gap-4"> <div class="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100"> <img${addAttribute(post.image || `https://picsum.photos/seed/${post.id}/100/100`, "src")} class="w-full h-full object-cover"> </div> <div> <h3 class="font-bold text-dark group-hover:text-primary transition line-clamp-1">${post.title}</h3> <p class="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight">Kalıcı Bağlantı: /blog/${post.slug}</p> </div> </div> </td> <td class="px-6 py-5"> <span class="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase rounded-full tracking-wider"> ${post.category} </span> </td> <td class="px-6 py-5 text-right"> <div class="flex justify-end gap-2"> <a${addAttribute(`/admin/editor/${post.id}`, "href")} class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> </a> <button class="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all delete-post-btn"${addAttribute(post.id, "data-id")}${addAttribute(post.title, "data-title")}> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4h.01"></path></svg> </button> </div> </td> </tr>`)} </tbody> </table> </div> </div> </div> <form id="delete-form" method="POST" style="display: none;"> <input type="hidden" name="action" value="delete"> <input type="hidden" name="id" id="delete-id"> </form> ` }));
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
