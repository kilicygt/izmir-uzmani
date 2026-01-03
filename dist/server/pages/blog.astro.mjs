/* empty css                                     */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_BmgwVtGw.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DQDs7h2h.mjs';
import { d as db } from '../chunks/db_BWDFEkDL.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Blog - \u0130zmir Uzman\u0131" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bg-primary/5 py-16 text-center"> <h1 class="text-4xl font-bold text-dark mb-4">Blog</h1> <p class="text-gray-600 max-w-2xl mx-auto">İzmir hakkında her şey. Gezi rehberi, mekan önerileri ve güncel etkinlikler.</p> </div> <div class="container mx-auto px-4 py-12"> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> ${posts.map((post) => renderTemplate`<article class="bg-white rounded-card overflow-hidden shadow-lg hover:shadow-xl transition group flex flex-col h-full"> <div class="h-48 bg-gray-200 relative overflow-hidden shrink-0"> <img${addAttribute(post.image || `https://picsum.photos/seed/${post.id}/800/600`, "src")}${addAttribute(post.title, "alt")} class="w-full h-full object-cover group-hover:scale-105 transition duration-500"> </div> <div class="p-6 flex flex-col flex-grow"> <div class="flex items-center gap-2 mb-3"> <span class="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">${post.category}</span> <span class="text-xs text-gray-400">${new Date(post.created_at).toLocaleDateString("tr-TR")}</span> </div> <h3 class="text-xl font-bold text-dark mb-3 group-hover:text-primary transition line-clamp-2">${post.title}</h3> <p class="text-gray-500 line-clamp-2 mb-4 flex-grow">${post.excerpt}</p> <a${addAttribute(`/blog/${post.slug}`, "href")} class="inline-block px-4 py-2 bg-gray-100 text-dark rounded-btn text-sm font-semibold hover:bg-primary hover:text-white transition w-fit">Devamını Oku</a> </div> </article>`)} ${posts.length === 0 && renderTemplate`<div class="col-span-full py-12 text-center text-gray-500">
Henüz yazı bulunmuyor.
</div>`} </div> </div> ` })}`;
}, "C:/Users/Yi\u011Fit/Desktop/\u0130zmir Uzman\u0131 Website/src/pages/blog/index.astro", void 0);

const $$file = "C:/Users/Yiğit/Desktop/İzmir Uzmanı Website/src/pages/blog/index.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
