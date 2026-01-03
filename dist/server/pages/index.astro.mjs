/* empty css                                     */
import { e as createComponent, r as renderTemplate } from '../chunks/astro/server_BmgwVtGw.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`const featuredPosts = posts.slice(0, 3);
const latestPosts = posts.slice(0, 8); // Display more on home now that it's a list 
<Layout title="İzmir Uzmanı - Şehri Keşfet">
	<!-- Hero Slider -->
    <section class="max-w-[1400px] mx-auto pt-8 pb-12 px-4">
        <div class="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 no-scrollbar">
            {featuredPosts.length > 0 ? featuredPosts.map((post) => (
                <div class="snap-center shrink-0 w-[90vw] md:w-[80vw] lg:w-[70vw] h-[50vh] relative rounded-card overflow-hidden shadow-xl group">
                    <img src={post.image || \`https://picsum.photos/seed/\${post.id}/1200/800\`} alt={post.title} class="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 md:p-12 text-white">
                        <span class="inline-block px-4 py-1.5 bg-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg">{post.category}</span>
                        <h2 class="text-2xl md:text-4xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
                        <p class="text-white/80 line-clamp-2 md:text-lg mb-6 max-w-2xl">{post.excerpt}</p>
                         <a href={\`/blog/\${post.slug}\`} class="inline-block px-8 py-3 bg-white text-dark rounded-btn font-bold hover:bg-primary hover:text-white transition shadow-lg transform active:scale-95">Devamını Oku</a>
                    </div>
                </div>
            )) : (
                 <div class="w-full h-[50vh] bg-gray-100 rounded-card flex items-center justify-center text-gray-400">
                    Öne çıkan içerik yok.
                 </div>
            )}
        </div>
    </section>

    <!-- Latest Posts (Vertical List View) -->
    <section class="py-4 px-4 max-w-5xl mx-auto">
        <h2 class="text-center text-3xl font-bold text-dark mb-12 relative inline-block left-1/2 -translate-x-1/2">
            Son Yazılar
            <span class="absolute -bottom-3 left-1/4 w-1/2 h-1 bg-primary rounded-full"></span>
        </h2>
        
        <div class="flex flex-col gap-12">
            {latestPosts.length > 0 ? latestPosts.map((post) => (
                <article class="bg-white rounded-card overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 group flex flex-col md:flex-row h-auto min-h-[300px] border border-gray-50">
                    <!-- Image Side (Left on Desktop) -->
                    <div class="md:w-5/12 relative overflow-hidden h-64 md:h-auto">
                         <img src={post.image || \`https://picsum.photos/seed/\${post.id}/800/600\`} alt={post.title} class="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                         <div class="absolute top-4 left-4">
                             <span class="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary shadow-sm uppercase">{post.category}</span>
                         </div>
                    </div>
                    
                    <!-- Content Side (Right on Desktop) -->
                    <div class="p-8 md:w-7/12 flex flex-col justify-center">
                        <div class="flex items-center gap-2 mb-4 text-xs text-gray-400 uppercase tracking-widest font-semibold">
                             <span>{new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <h3 class="text-2xl md:text-3xl font-bold text-dark mb-4 leading-tight group-hover:text-primary transition">{post.title}</h3>
                        <p class="text-gray-500 line-clamp-3 mb-6 leading-relaxed">{post.excerpt}</p>
                        <div class="mt-auto">
                            <a href={\`/blog/\${post.slug}\`} class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-dark rounded-btn text-sm font-bold hover:bg-primary hover:text-white transition shadow-sm border border-gray-100 group-hover:border-primary">
                                Devamını Oku
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div>
                    </div>
                </article>
            )) : (
                <div class="py-12 text-center text-gray-500">
                    Henüz yazı bulunmuyor.
                </div>
            )}
        </div>
    </section>

    <!-- Instagram Feed Placeholder -->
    <section class="py-12 bg-[#F0F8FF] mt-12 border-t border-blue-100">
        <div class="container mx-auto px-4 text-center">
            <h3 class="text-2xl font-bold text-dark mb-2">Instagram'da Bizi Takip Edin</h3>
            <p class="text-gray-500 mb-8">@izmiruzmani</p>
            
            <div class="flex gap-4 overflow-x-auto pb-4 snap-x">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div class="snap-center shrink-0 w-64 h-64 bg-white rounded-card shadow-md overflow-hidden relative">
                         <img src={\`https://picsum.photos/seed/insta\${i}/400/400\`} alt="Instagram" class="w-full h-full object-cover" />
                    </div>
                ))}
            </div>

            <div class="mt-8">
                <a href="https://www.instagram.com/izmiruzmani/" target="_blank" class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-btn font-bold shadow-lg hover:opacity-90 transition transform hover:-translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    Instagram'da Takip Et
                </a>
            </div>
        </div>
    </section>
</Layout>`;
}, "C:/Users/Yi\u011Fit/Desktop/\u0130zmir Uzman\u0131 Website/src/pages/index.astro", void 0);

const $$file = "C:/Users/Yiğit/Desktop/İzmir Uzmanı Website/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
