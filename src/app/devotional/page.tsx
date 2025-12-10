import DevotionalClient from "./devotional-client";
import { Suspense } from "react";

type RawParams = Record<string, string | string[] | undefined>;

const normalizeParam = (value: string | string[] | undefined, fallback: string | null = null) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value.find(Boolean);
    return first ?? fallback;
  }
  return fallback;
};

type PageProps = {
  searchParams: Promise<RawParams> | RawParams;
};

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#030d14] text-white">
    در حال بارگذاری دعا...
  </div>
);

export default async function DevotionalPage({ searchParams }: PageProps) {
  const params = typeof (searchParams as Promise<RawParams>).then === "function" ? await (searchParams as Promise<RawParams>) : (searchParams as RawParams);

  const initialParams = {
    type: normalizeParam(params?.type, "dua"),
    day: normalizeParam(params?.day),
    inApp: normalizeParam(params?.inApp),
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <DevotionalClient initialParams={initialParams} />
    </Suspense>
  );
}
