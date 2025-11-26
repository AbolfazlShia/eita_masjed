import BasijScanClient from "./BasijScanClient";

export const dynamic = "force-dynamic";

export default function BasijScanPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const tokenParam = searchParams?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  return <BasijScanClient initialToken={token} />;
}
