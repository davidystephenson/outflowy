import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, nodeId, targetParentId } = body;

    // Validate parameters
    if (!apiKey || !nodeId || !targetParentId) {
      return NextResponse.json(
        { error: 'apiKey, nodeId, and targetParentId are all required' },
        { status: 400 }
      );
    }

    // Call Workflowy API to move the node
    const url = `https://workflowy.com/api/v1/nodes/${encodeURIComponent(nodeId)}/move`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent_id: targetParentId,
        position: 'bottom',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Workflowy API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({ status: 'ok', data });
    
  } catch (error) {
    console.error('Move API Error:', error);
    
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
