import type { CollectionEntry } from 'astro:content';

// The automation writes many near-duplicate categories; group them into a few themes for browsing.
export const THEMES = [
  { key: 'gezi', label: 'Gezi Rotaları', icon: 'harita', color: '#062f96', desc: 'Gezilecek yerler, ilçeler ve günübirlik kaçamaklar', cats: ['Gezi Rehberi', 'Gezi', 'Rehber'] },
  { key: 'tarih', label: 'Tarih ve Kültür', icon: 'saatkulesi', color: '#b45309', desc: 'Antik kentler, tarihi yapılar ve müzeler', cats: ['Tarih ve Kültür', 'Kültür', 'Tarih'] },
  { key: 'sehir', label: 'Şehir Hayatı', icon: 'asansor', color: '#d6336c', desc: 'Semtler, sahil, kafeler ve şehirde gündelik hayat', cats: ['Şehir Rehberi', 'Semtler', 'Kafeler', 'Gece Hayatı'] },
  { key: 'doga', label: 'Doğa ve Aile', icon: 'palmiye', color: '#0b7a5c', desc: 'Yürüyüş rotaları, piknik alanları ve çocuklarla gezi', cats: ['Doğa Rehberi', 'Aile Rehberi'] },
  { key: 'ulasim', label: 'Ulaşım', icon: 'vapur', color: '#0e7490', desc: 'Nereye, nasıl gidilir?', cats: ['Ulaşım'] },
] as const;

export type Theme = (typeof THEMES)[number];

export const themeOf = (cat: string): Theme =>
  THEMES.find((t) => (t.cats as readonly string[]).includes(cat.trim())) ?? THEMES[0];

export const postImage = (p: CollectionEntry<'blog'>) => p.data.image ?? `/images/blog/${p.slug}.webp`;

export const shortDate = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
