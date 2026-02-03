import { NextRequest, NextResponse } from 'next/server';

// Workflowy API types
interface WorkflowyNode {
  id: string;
  name: string;
  note: string | null;
  priority: number;
  data: {
    layoutMode: string;
  };
  createdAt: number;
  modifiedAt: number;
  completedAt: number | null;
}

interface WorkflowyListResponse {
  nodes: WorkflowyNode[];
}

// Our tree structure for the response
interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

// Fetch children of a node from Workflowy API
async function fetchChildren(nodeId: string, apiKey: string): Promise<WorkflowyNode[]> {
  const url = `https://workflowy.com/api/v1/nodes?parent_id=${encodeURIComponent(nodeId)}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Workflowy API error: ${response.status}`);
  }

  const data: WorkflowyListResponse = await response.json();
  return data.nodes;
}

// Recursively build tree of incomplete children
async function buildIncompleteTree(nodeId: string, apiKey: string): Promise<TreeNode[]> {
  const children = await fetchChildren(nodeId, apiKey);
  
  // Filter for incomplete children only
  const incompleteChildren = children.filter(child => child.completedAt === null);
  
  // Recursively fetch children for each incomplete child
  const treeNodes: TreeNode[] = [];
  
  for (const child of incompleteChildren) {
    const childTree = await buildIncompleteTree(child.id, apiKey);
    treeNodes.push({
      id: child.id,
      name: child.name,
      children: childTree,
    });
  }
  
  return treeNodes;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, nodeId } = body;

    // Validate parameters
    if (!apiKey || !nodeId) {
      return NextResponse.json(
        { error: 'Both apiKey and nodeId are required' },
        { status: 400 }
      );
    }

    // Fetch direct children of the provided node
    const directChildren = await fetchChildren(nodeId, apiKey);
    
    // Filter for incomplete children
    const incompleteChildren = directChildren.filter(child => child.completedAt === null);
    
    // If no incomplete children, return empty result
    if (incompleteChildren.length === 0) {
      return NextResponse.json({ node: null });
    }
    
    // Randomly select one incomplete child
    const randomIndex = Math.floor(Math.random() * incompleteChildren.length);
    const selectedChild = incompleteChildren[randomIndex];
    
    // Recursively fetch all incomplete descendants of the selected child
    const childrenTree = await buildIncompleteTree(selectedChild.id, apiKey);
    
    // Build the result tree
    const resultTree: TreeNode = {
      id: selectedChild.id,
      name: selectedChild.name,
      children: childrenTree,
    };

    return NextResponse.json({ node: resultTree });
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
