import { NextResponse } from 'next/server';

const DATA_DIR = process.cwd() + '/data';
const MESSAGES_FILE = DATA_DIR + '/eita_messages.json';

async function ensureDataFile() {
  // Disabled: Netlify has read-only filesystem
  // This function is kept for backward compatibility but does nothing
}

export async function POST(req: Request) {
  // Token is optional - check if provided and if it matches environment variable
  const envToken = process.env.EITA_TOKEN || process.env.NEXT_PUBLIC_EITA_TOKEN;
  const providedToken = req.headers.get('x-eita-token') || new URL(req.url).searchParams.get('token');
  
  // If environment token is set, verify it
  if (envToken && providedToken && providedToken !== envToken) {
    return new NextResponse(JSON.stringify({ ok: false, error: 'invalid_token' }), { status: 401 });
  }
  // If no token in environment, accept requests without token

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return new NextResponse(JSON.stringify({ ok: false, error: 'invalid_json' }), { status: 400 });
  }

  // Log to console (visible in Netlify logs)
  console.log('[EITA Webhook] Received:', {
    timestamp: new Date().toISOString(),
    payload: body,
    hasToken: !!providedToken
  });

  // Note: File storage disabled on Netlify (read-only filesystem)
  // Use external service (MongoDB, Firebase, etc.) for persistence
  
  // Respond successfully to EITA
  return NextResponse.json({ 
    ok: true,
    message: 'Webhook received successfully',
    timestamp: new Date().toISOString()
  });
}

export async function GET(req: Request) {
  // Token is optional for GET as well
  const envToken = process.env.EITA_ADMIN_TOKEN || process.env.EITA_TOKEN || process.env.NEXT_PUBLIC_EITA_TOKEN;
  const providedToken = req.headers.get('x-eita-token') || new URL(req.url).searchParams.get('token');
  
  // If environment token is set, verify it
  if (envToken && providedToken && providedToken !== envToken) {
    return new NextResponse(JSON.stringify({ ok: false, error: 'invalid_token' }), { status: 401 });
  }
  // If no token in environment, accept requests without token

  // Return empty array (filesystem storage disabled on Netlify)
  return new NextResponse(JSON.stringify({ 
    ok: true, 
    messages: [],
    note: 'Webhook endpoint is working. Use external database for message persistence.'
  }), { status: 200 });
}

export async function OPTIONS(req: Request) {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-eita-token',
      'Access-Control-Max-Age': '86400',
      'X-Frame-Options': 'ALLOWALL',
    },
  });
}
