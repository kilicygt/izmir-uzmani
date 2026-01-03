import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // Sitenin gerçek adresi
  site: 'https://izmiruzmani.com',
  
  // GitHub Pages sunucu çalıştıramadığı için server modunu kaldırdık.
  // Varsayılan olarak "static" moda dönecektir, bu da tam istediğimiz şey.
  integrations: [tailwind()],
});
