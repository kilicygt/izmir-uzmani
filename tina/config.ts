import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "images/uploads",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog Yazıları",
        path: "src/content/blog",
        format: "md",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              return values?.title
                ? values.title
                    .toLowerCase()
                    .replace(/ğ/g, "g")
                    .replace(/ü/g, "u")
                    .replace(/ş/g, "s")
                    .replace(/ı/g, "i")
                    .replace(/ö/g, "o")
                    .replace(/ç/g, "c")
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")
                    .trim()
                : "";
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Başlık",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Açıklama",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Yayın Tarihi",
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Kategori",
            required: true,
            options: [
              "Kafeler",
              "Semtler",
              "Yeme & İçme",
              "Gezi",
              "Kültür & Sanat",
              "Etkinlik",
              "Spor",
              "Alışveriş",
              "Konaklama",
              "Rehber",
            ],
          },
          {
            type: "string",
            name: "readTime",
            label: "Okuma Süresi",
            required: true,
            ui: {
              description: 'Örn: "5 dk"',
            },
          },
          {
            type: "string",
            name: "tags",
            label: "Etiketler",
            list: true,
            ui: {
              description: "Virgülsüz, tek tek etiket ekleyin",
            },
          },
          {
            type: "boolean",
            name: "featured",
            label: "Öne Çıkan Yazı",
          },
          {
            type: "image",
            name: "image",
            label: "Kapak Görseli",
          },
          {
            type: "rich-text",
            name: "body",
            label: "İçerik",
            isBody: true,
          },
        ],
      },
      {
        name: "sayfalar",
        label: "Sayfa Metinleri",
        path: "src/content/sayfalar",
        format: "md",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Sayfa Başlığı",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Meta Açıklama (SEO)",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "İçerik",
            isBody: true,
          },
        ],
      },
    ],
  },
});
