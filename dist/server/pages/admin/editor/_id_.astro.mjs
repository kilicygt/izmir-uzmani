/* empty css                                           */
import { e as createAstro, f as createComponent, r as renderTemplate, k as renderComponent, m as maybeRenderHead, h as addAttribute, u as unescapeHTML } from '../../../chunks/astro/server_oNzcvkI7.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../../chunks/Layout_CaEXNdZn.mjs';
import { c as client } from '../../../chunks/db_CQPV1YBr.mjs';
import { put } from '@vercel/blob';
/* empty css                                      */
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://izmiruzmani.com");
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
    content: "",
    seo_title: "",
    seo_description: ""
  };
  if (!isNew && id) {
    const result = await client.execute({
      sql: "SELECT * FROM posts WHERE id = ?",
      args: [id]
    });
    if (result.rows.length > 0) {
      post = result.rows[0];
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
      const excerpt = formData.get("excerpt");
      const content = formData.get("content");
      const seo_title = formData.get("seo_title");
      const seo_description = formData.get("seo_description");
      const imageFile = formData.get("image_file");
      const imageUri = formData.get("image_uri");
      let imagePath = post.image;
      if (imageFile && imageFile.size > 0) {
        const blob = await put(imageFile.name, imageFile, {
          access: "public",
          token: undefined                                     
        });
        imagePath = blob.url;
      } else if (imageUri) {
        imagePath = imageUri;
      }
      if (!slug) {
        slug = title.toLowerCase().trim().replace(/İ/g, "i").replace(/I/g, "i").replace(/Ğ/g, "g").replace(/ğ/g, "g").replace(/Ü/g, "u").replace(/ü/g, "u").replace(/Ş/g, "s").replace(/ş/g, "s").replace(/Ö/g, "o").replace(/ö/g, "o").replace(/Ç/g, "c").replace(/ç/g, "c").replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
      }
      if (isNew) {
        await client.execute({
          sql: "INSERT INTO posts (title, slug, category, image, excerpt, content, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [title, slug, category, imagePath, excerpt, content, seo_title, seo_description]
        });
      } else {
        await client.execute({
          sql: "UPDATE posts SET title = ?, slug = ?, category = ?, image = ?, excerpt = ?, content = ?, seo_title = ?, seo_description = ? WHERE id = ?",
          args: [title, slug, category, imagePath, excerpt, content, seo_title, seo_description, id]
        });
      }
      return Astro2.redirect("/admin/dashboard");
    } catch (e) {
      error = "Hata: " + e.message;
    }
  }
  const categories = ["Yeme-İçme", "Etkinlikler", "Gezi", "Sanat", "Gece Hayatı", "Diğer"];
  return renderTemplate(_a || (_a = __template(["", ` <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script> <script>
    // Quill Toolbar Settings
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
    ];

    // Initialize Quill
    const quill = new Quill('#editor', {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    });

    // Handle Form Submission
    const form = document.querySelector('#post-form');
    const contentInput = document.querySelector('#content-input');

    form.addEventListener('submit', (e) => {
        // Get HTML content from Quill
        const html = quill.root.innerHTML;
        contentInput.value = html;
        
        // Final sanity check before submitting
        if (quill.getText().trim().length === 0) {
            alert('Lütfen içerik giriniz.');
            e.preventDefault();
            return;
        }
    });
</script> `])), renderComponent($$result, "Layout", $$Layout, { "title": isNew ? "Yeni Yazı Ekle" : "Yazıyı Düzenle" }, { "default": async ($$result2) => renderTemplate` <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet"> ${maybeRenderHead()}<div class="container mx-auto px-4 py-8 max-w-5xl"> <div class="flex items-center justify-between mb-8"> <h1 class="text-3xl font-bold text-dark">${isNew ? "Yeni Yazı Ekle" : "Yazıyı Düzenle"}</h1> <a href="/admin/dashboard" class="flex items-center gap-2 text-gray-500 hover:text-primary transition font-bold uppercase text-xs tracking-widest"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
Geri Dön
</a> </div> ${error && renderTemplate`<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm"> ${error} </div>`} <form method="POST" id="post-form" class="space-y-8" enctype="multipart/form-data"> <!-- Main Content Card --> <div class="bg-white p-8 rounded-card shadow-xl border border-gray-100"> <h2 class="text-lg font-bold text-dark mb-6 flex items-center gap-2"> <span class="w-1.5 h-6 bg-primary rounded-full"></span>
Genel Bilgiler
</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div class="col-span-2"> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Başlık</label> <input type="text" name="title"${addAttribute(post.title, "value")} required class="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-xl font-bold" placeholder="Yazı başlığı..."> </div> <div class="col-span-2"> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">URL Uzantısı (Slug)</label> <div class="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-1 border border-gray-100 italic text-sm text-gray-400"> <span>/blog/</span> <input type="text" name="slug"${addAttribute(post.slug, "value")} class="bg-transparent border-none outline-none focus:ring-0 flex-grow py-2 text-dark font-medium" placeholder="yazi-basligi (Opsiyonel)"> </div> </div> <div class="col-span-1"> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Kategori</label> <select name="category" required class="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"> <option value="">Seçiniz</option> ${categories.map((c) => renderTemplate`<option${addAttribute(c, "value")}${addAttribute(post.category === c, "selected")}>${c}</option>`)} </select> </div> <div class="col-span-1"> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Kapak Görseli</label> <div class="flex flex-col gap-3"> <div class="flex items-center gap-4"> <input type="file" name="image_file" accept="image/*" class="flex-grow text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"> ${post.image && renderTemplate`<div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 shrink-0"> <img${addAttribute(post.image, "src")} class="w-full h-full object-cover"> </div>`} </div> <div class="relative"> <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div> <div class="relative flex justify-center text-[10px] uppercase font-bold"><span class="bg-white px-2 text-gray-300 tracking-widest">veya URL kullan</span></div> </div> <input type="text" name="image_uri"${addAttribute(post.image?.startsWith("http") ? post.image : "", "value")} placeholder="https://..." class="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-xs"> </div> </div> <div class="col-span-2"> <label class="block text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">İçerik</label> <div id="editor-container" class="bg-gray-50 rounded-xl overflow-hidden min-h-[400px]"> <div id="editor">${unescapeHTML(post.content)}</div> </div> <input type="hidden" name="content" id="content-input"> </div> </div> </div> <!-- SEO Settings Card --> <div class="bg-white p-8 rounded-card shadow-xl border border-gray-100"> <h2 class="text-lg font-bold text-dark mb-6 flex items-center gap-2"> <span class="w-1.5 h-6 bg-secondary rounded-full"></span>
SEO & Özet Ayarları
</h2> <div class="space-y-6"> <div> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">SEO Başlığı (Meta Title)</label> <input type="text" name="seo_title"${addAttribute(post.seo_title, "value")} class="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all" placeholder="Google'da görünecek başlık..."> <p class="text-[10px] text-gray-400 mt-1 italic font-medium">Boş bırakılırsa normal başlık kullanılır.</p> </div> <div> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">SEO Açıklaması (Meta Description)</label> <textarea name="seo_description" rows="2" class="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all resize-none" placeholder="Google arama sonuçlarında çıkacak kısa açıklama...">${post.seo_description}</textarea> </div> <div> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Kısa Açıklama (Özet - Liste Sayfaları İçin)</label> <textarea name="excerpt" rows="3" required class="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all resize-none" placeholder="Sitede listelenirken görünecek kısa açıklama...">${post.excerpt}</textarea> </div> </div> </div> <div class="flex justify-end pt-4"> <button type="submit" class="px-12 py-4 bg-primary text-white font-black uppercase text-sm tracking-widest rounded-btn hover:bg-secondary transition-all shadow-xl transform active:scale-95 duration-300"> ${isNew ? "Hemen Yayınla" : "Değişiklikleri Kaydet"} </button> </div> </form> </div> ` }));
}, "C:/Users/Yiğit/Desktop/İzmir Uzmanı Website/src/pages/admin/editor/[id].astro", void 0);
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
