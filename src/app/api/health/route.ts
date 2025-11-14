import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Extract tgWebAppData from hash if present
  const url = new URL(req.url);
  
  // Return a simple redirect
  return NextResponse.json({
    ok: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    url: 'https://eitaa-masjed.netlify.app'
  });
}
