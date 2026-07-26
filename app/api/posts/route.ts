import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/wordpress";

// Public, read-only — powers client-side "Load More" pagination.
// This is not an admin route: no auth, no writes, just the same data
// the homepage already fetches server-side, one page at a time.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("perPage") ?? 10);
  const category = searchParams.get("category");

  const posts = await getPosts({
    page,
    perPage,
    category: category ? Number(category) : undefined,
  });

  return NextResponse.json({ posts });
}
