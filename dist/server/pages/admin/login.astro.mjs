/* empty css                                        */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_BmgwVtGw.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_DQDs7h2h.mjs';
import { d as db } from '../../chunks/db_BWDFEkDL.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  let error = "";
  if (Astro2.request.method === "POST") {
    try {
      const data = await Astro2.request.formData();
      const username = data.get("username");
      const password = data.get("password");
      const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
      if (user) {
        Astro2.cookies.set("admin_session", "true", {
          path: "/",
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 * 24
          // 1 day
        });
        return Astro2.redirect("/admin/dashboard");
      } else {
        error = "Kullanıcı adı veya şifre hatalı.";
      }
    } catch (e) {
      error = "Bir hata oluştu.";
      console.error(e);
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin Giriş - İzmir Uzmanı" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[60vh] flex items-center justify-center px-4"> <div class="bg-white p-8 rounded-card shadow-lg max-w-md w-full"> <h1 class="text-2xl font-bold text-dark mb-6 text-center">Yönetici Girişi</h1> ${error && renderTemplate`<div class="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium"> ${error} </div>`} <form method="POST" class="space-y-4"> <div> <label class="block text-sm font-semibold text-gray-700 mb-1">Kullanıcı Adı</label> <input type="text" name="username" required class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"> </div> <div> <label class="block text-sm font-semibold text-gray-700 mb-1">Şifre</label> <input type="password" name="password" required class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"> </div> <button type="submit" class="w-full bg-primary text-white font-bold py-3 rounded-btn hover:opacity-90 transition shadow-md">
Giriş Yap
</button> </form> </div> </div> ` })}`;
}, "C:/Users/Yiğit/Desktop/İzmir Uzmanı Website/src/pages/admin/login.astro", void 0);
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
