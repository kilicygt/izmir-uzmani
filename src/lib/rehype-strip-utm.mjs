function clean(href) {
  try {
    const url = new URL(href);
    const keys = [...url.searchParams.keys()].filter((k) => k.toLowerCase().startsWith('utm_'));
    if (keys.length === 0) return href;
    keys.forEach((k) => url.searchParams.delete(k));
    return url.toString();
  } catch {
    return href;
  }
}

function walk(node) {
  if (node.type === 'element' && node.tagName === 'a' && typeof node.properties?.href === 'string') {
    node.properties.href = clean(node.properties.href);
  }
  node.children?.forEach(walk);
}

export default function rehypeStripUtm() {
  return (tree) => walk(tree);
}
