/* empty css                                        */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, u as unescapeHTML } from '../../chunks/astro/server_oNzcvkI7.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_CaEXNdZn.mjs';
import { c as client } from '../../chunks/db_CQPV1YBr.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://izmiruzmani.com");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const result = await client.execute({
    sql: "SELECT * FROM posts WHERE slug = ?",
    args: [slug]
  });
  const post = result.rows[0];
  if (!post) {
    return Astro2.redirect("/404");
  }
  const relatedResult = await client.execute({
    sql: "SELECT * FROM posts WHERE category = ? AND id != ? LIMIT 3",
    args: [post.category, post.id]
  });
  const relatedPosts = relatedResult.rows;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${post.title} - \u0130zmir Uzman\u0131`, "seoTitle": post.seo_title, "seoDescription": post.seo_description, "description": post.excerpt }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="h-[40vh] md:h-[60vh] relative"> <img${addAttribute(post.image || `https://picsum.photos/seed/${post.id}/1200/600`, "src")}${addAttribute(post.title, "alt")} class="w-full h-full object-cover"> <div class="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-4"> <div class="text-white max-w-4xl"> <span class="inline-block px-4 py-1 bg-primary text-white rounded-full text-sm font-semibold mb-4">${post.category}</span> <h1 class="text-3xl md:text-5xl font-bold mb-4">${post.title}</h1> <p class="text-lg opacity-90">${new Date(post.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</p> </div> </div> </div> <div class="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12"> <main class="lg:col-span-8"> <article class="prose prose-lg max-w-none prose-headings:text-dark prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-card"> <p class="lead font-medium text-xl text-gray-700 mb-8">${post.excerpt}</p> <div>${unescapeHTML(post.content)}</div> </article> <div class="mt-12 pt-8 border-t border-gray-100"> <h3 class="font-bold text-dark mb-4">Paylaş</h3> <div class="flex gap-4"> <button class="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition">
F
</button> <button class="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition">
T
</button> <button class="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition">
W
</button> </div> </div> </main> <aside class="lg:col-span-4 space-y-8"> <div class="bg-white p-6 rounded-card border border-gray-100 shadow-sm sticky top-24"> <h3 class="text-xl font-bold text-dark mb-4">İlgili Yazılar</h3> <div class="space-y-4"> ${relatedPosts.map((rp) => renderTemplate`<a${addAttribute(`/blog/${rp.slug}`, "href")} class="flex gap-4 group"> <div class="w-20 h-20 shrink-0 bg-gray-200 rounded-lg overflow-hidden"> <img${addAttribute(rp.image || `https://picsum.photos/seed/${rp.id}/200/200`, "src")} class="w-full h-full object-cover group-hover:scale-105 transition"> </div> <div> <h4 class="font-bold text-dark group-hover:text-primary transition line-clamp-2 text-sm mb-1">${rp.title}</h4> <span class="text-xs text-gray-400">${new Date(rp.created_at).toLocaleDateString("tr-TR")}</span> </div> </a>`)} </div> </div> </aside> </div> ` })}`;
}, "C:/Users/Yi\u011Fit/Desktop/\u0130zmir Uzman\u0131 Website/src/pages/blog/[slug].astro", void 0);

const $$file = "C:/Users/Yiğit/Desktop/İzmir Uzmanı Website/src/pages/blog/[slug].astro";
const $$url = "/blog/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
