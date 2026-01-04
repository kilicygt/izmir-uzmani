/* empty css                                        */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_oNzcvkI7.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_Ds4gT47M.mjs';
import { c as client } from '../../chunks/db_CQPV1YBr.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://izmiruzmani.com");
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  let error = "";
  if (Astro2.request.method === "POST") {
    try {
      const formData = await Astro2.request.formData();
      const username = formData.get("username");
      const password = formData.get("password");
      const result = await client.execute({
        sql: "SELECT * FROM users WHERE username = ? AND password = ?",
        args: [username, password]
      });
      if (result.rows.length > 0) {
        Astro2.cookies.set("admin_session", "active", { path: "/", httpOnly: true });
        return Astro2.redirect("/admin/dashboard");
      } else {
        error = "Ge\xE7ersiz kullan\u0131c\u0131 ad\u0131 veya \u015Fifre";
      }
    } catch (e) {
      error = "Bir hata olu\u015Ftu: " + e.message;
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin Giri\u015Fi" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[80vh] flex items-center justify-center bg-gray-50"> <div class="max-w-md w-full bg-white p-8 rounded-card shadow-xl border border-gray-100"> <div class="text-center mb-8"> <h1 class="text-3xl font-bold text-dark">Giriş Yap</h1> <p class="text-gray-500 text-sm mt-2">İzmir Uzmanı Yönetim Paneli</p> </div> ${error && renderTemplate`<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm"> ${error} </div>`} <form method="POST" class="space-y-6"> <div> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Kullanıcı Adı</label> <input type="text" name="username" required class="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"> </div> <div> <label class="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Şifre</label> <input type="password" name="password" required class="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"> </div> <button type="submit" class="w-full py-4 bg-primary text-white font-black uppercase text-sm tracking-widest rounded-btn hover:bg-secondary transition-all shadow-lg transform active:scale-95 duration-300">
Giriş Yap
</button> </form> </div> </div> ` })}`;
}, "C:/Users/Yi\u011Fit/Desktop/\u0130zmir Uzman\u0131 Website/src/pages/admin/login.astro", void 0);

const $$file = "C:/Users/Yiğit/Desktop/İzmir Uzmanı Website/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
