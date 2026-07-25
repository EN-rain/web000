import { NewsDetail } from "@/components/silver-palace/NewsDetail";

export default async function SilverPalaceNewsDetailPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ id?: string }> }>) {
  const { id = "93" } = await searchParams;
  return <NewsDetail id={id} />;
}

