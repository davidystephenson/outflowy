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
  const [sourceNodeId, setSourceNodeId] = useState('');
  const [rejectedNodeId, setRejectedNodeId] = useState('');
  const [concernedNodeId, setConcernedNodeId] = useState('');
  const [acceptedNodeId, setAcceptedNodeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [result, setResult] = useState<TreeNode | null>(null);

  const fetchRandomNode = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/workflowy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey, nodeId: sourceNodeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      if (data.node === null) {
        setResult(null);
        alert('No more incomplete items');
      } else {
        setResult(data.node);
      }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const missing: string[] = [];
    if (!apiKey) missing.push('API Key');
    if (!sourceNodeId) missing.push('Source Node ID');
    if (!rejectedNodeId) missing.push('Rejected Node ID');
    if (!concernedNodeId) missing.push('Concerned Node ID');
    if (!acceptedNodeId) missing.push('Accepted Node ID');

    if (missing.length > 0) {
      alert(`Please provide: ${missing.join(', ')}`);
      return;
    }

    await fetchRandomNode();
  };

  const handleMove = async (targetNodeId: string) => {
    if (!result) return;

    setIsMoving(true);

    try {
      const response = await fetch('/api/workflowy/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          nodeId: result.id,
          targetParentId: targetNodeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to move node');
      }

      // Successfully moved, now fetch a new random node
      await fetchRandomNode();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setIsMoving(false);
    }
  };

  const isDisabled = loading || isMoving;

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
              disabled={isDisabled}
            />
          </label>
        </div>
        <div>
          <label>
            Source Node ID:
            <br />
            <input
              type="text"
              value={sourceNodeId}
              onChange={(e) => setSourceNodeId(e.target.value)}
              disabled={isDisabled}
            />
          </label>
        </div>
        <div>
          <label>
            Rejected Node ID:
            <br />
            <input
              type="text"
              value={rejectedNodeId}
              onChange={(e) => setRejectedNodeId(e.target.value)}
              disabled={isDisabled}
            />
          </label>
        </div>
        <div>
          <label>
            Concerned Node ID:
            <br />
            <input
              type="text"
              value={concernedNodeId}
              onChange={(e) => setConcernedNodeId(e.target.value)}
              disabled={isDisabled}
            />
          </label>
        </div>
        <div>
          <label>
            Accepted Node ID:
            <br />
            <input
              type="text"
              value={acceptedNodeId}
              onChange={(e) => setAcceptedNodeId(e.target.value)}
              disabled={isDisabled}
            />
          </label>
        </div>
        <div>
          <button type="submit" disabled={isDisabled}>Submit</button>
        </div>
      </form>

      {loading && <div>Loading...</div>}

      {!loading && result && (
        <div>
          <NodeTree node={result} />
          <div>
            <button onClick={() => handleMove(rejectedNodeId)} disabled={isDisabled}>
              Reject
            </button>
            <button onClick={() => handleMove(concernedNodeId)} disabled={isDisabled}>
              Concern
            </button>
            <button onClick={() => handleMove(acceptedNodeId)} disabled={isDisabled}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
