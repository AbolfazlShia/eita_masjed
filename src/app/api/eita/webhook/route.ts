import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'eita_messages.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(MESSAGES_FILE);
  } catch (e) {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify([]), 'utf8');
  }
}

export async function POST(req: Request) {
  // Simple token check: header 'x-eita-token' or query param 'token'
  const token = process.env.EITA_TOKEN || process.env.NEXT_PUBLIC_EITA_TOKEN;
  const provided = req.headers.get('x-eita-token') || new URL(req.url).searchParams.get('token');
  if (!token || !provided || provided !== token) {
    return new NextResponse(JSON.stringify({ ok: false, error: 'invalid_token' }), { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return new NextResponse(JSON.stringify({ ok: false, error: 'invalid_json' }), { status: 400 });
  }

  // store message
  await ensureDataFile();
  try {
    const raw = await fs.readFile(MESSAGES_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    const item = { receivedAt: new Date().toISOString(), payload: body };
    arr.push(item);
    // keep last 200 messages
    if (arr.length > 200) arr.splice(0, arr.length - 200);
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.error('failed saving message', e);
  }

  // Optionally respond to Eita here or enqueue a job to reply using the token
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  // Admin view: allow reading recent messages if token provided
  const token = process.env.EITA_ADMIN_TOKEN || process.env.EITA_TOKEN || process.env.NEXT_PUBLIC_EITA_TOKEN;
  const provided = req.headers.get('x-eita-token') || new URL(req.url).searchParams.get('token');
  if (!token || !provided || provided !== token) {
    return new NextResponse(JSON.stringify({ ok: false, error: 'invalid_token' }), { status: 401 });
  }

  await ensureDataFile();
  try {
    const raw = await fs.readFile(MESSAGES_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    return new NextResponse(JSON.stringify({ ok: true, messages: arr.slice(-100) }), { status: 200 });
  } catch (e) {
    return new NextResponse(JSON.stringify({ ok: false, error: 'read_failed' }), { status: 500 });
  }
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
