// The page template already renders the post title as the only <h1>.
function walk(node) {
  if (node.type === 'element' && node.tagName === 'h1') node.tagName = 'h2';
  node.children?.forEach(walk);
}

export default function rehypeDemoteH1() {
  return (tree) => walk(tree);
}
