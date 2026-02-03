'use client';

import { useState, FormEvent } from 'react';
import DOMPurify from 'dompurify';

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

interface NodeTreeProps {
  node: TreeNode;
  depth?: number;
}

function NodeTree({ node, depth = 0 }: NodeTreeProps) {
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

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TreeNode | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const missing: string[] = [];
    if (!apiKey) missing.push('API Key');
    if (!nodeId) missing.push('Node ID');

    if (missing.length > 0) {
      alert(`Please provide: ${missing.join(', ')}`);
      return;
    }

    // Reset state and start loading
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/workflowy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey, nodeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setResult(data.node);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            API Key:
            <br />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Node ID:
            <br />
            <input
              type="text"
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
            />
          </label>
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>

      {loading && <div>Loading...</div>}

      {!loading && result && (
        <div>
          <NodeTree node={result} />
        </div>
      )}
    </>
  );
}
