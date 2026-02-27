'use client';

import DOMPurify from 'dompurify';

export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

interface NodeTreeProps {
  node: TreeNode;
  depth?: number;
}

export default function NodeTree({ node, depth = 0 }: NodeTreeProps) {
  const indent = '\u00A0\u00A0'.repeat(depth * 2);
  
  // Sanitize HTML to prevent XSS attacks while allowing safe formatting tags
  const sanitizedName = DOMPurify.sanitize(node.name);
  
  return (
    <>
      <div>
        {indent}• <span dangerouslySetInnerHTML={{ __html: sanitizedName }} />
      </div>
      {node.children.map((child) => (
        <NodeTree key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  );
}
