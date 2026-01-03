import { e as createComponent, f as createAstro, h as addAttribute, l as renderHead, n as renderSlot, r as renderTemplate } from './astro/server_BmgwVtGw.mjs';
import 'piccolore';
import 'clsx';
/* empty css                             */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="tr"> <head><meta charset="UTF-8"><meta name="description" content="İzmir Uzmanı - İzmir Şehir Rehberi"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body class="min-h-screen flex flex-col"> <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"> <div class="container mx-auto px-4 py-4 flex flex-col items-center gap-4"> <!-- Logo Centered --> <a href="/" class="text-3xl font-bold text-primary tracking-tight hover:opacity-80 transition transform hover:scale-105">İzmir Uzmanı</a> <!-- Navigation Centered --> <nav class="hidden md:flex gap-8 items-center"> ${["Anasayfa", "Yeme-\u0130\xE7me", "Etkinlikler", "Gezi", "\u0130leti\u015Fim"].map((item) => {
    const href = item === "Anasayfa" ? "/" : item === "\u0130leti\u015Fim" ? "/iletisim" : `/blog?cat=${item}`;
    return renderTemplate`<a${addAttribute(href, "href")} class="text-sm font-semibold text-gray-600 hover:text-primary uppercase tracking-wide transition relative group"> ${item} <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span> </a>`;
  })} </nav> <!-- Mobile Hamburger (Absolute Right) --> <button class="md:hidden absolute right-4 top-4 p-2 text-dark"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> </div> </header> <main class="flex-grow"> ${renderSlot($$result, $$slots["default"])} </main> <footer class="bg-white border-t border-gray-100 py-8 mt-12"> <div class="container mx-auto px-4 text-center"> <p class="text-gray-500">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} İzmir Uzmanı. Tüm hakları saklıdır.</p> </div> </footer> </body></html>`;
}, "C:/Users/Yi\u011Fit/Desktop/\u0130zmir Uzman\u0131 Website/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
