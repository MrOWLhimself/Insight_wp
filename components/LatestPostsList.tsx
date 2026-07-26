"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  WPPost,
  featuredImage,
  primaryCategoryName,
  stripHtml,
  decodeEntities,
} from "@/lib/wordpress";

const PAGE_SIZE = 10;
const MAX_POSTS = 20;

export default function LatestPostsList({ initialPosts }: { initialPosts: WPPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(initialPosts.length < PAGE_SIZE);

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const res = await fetch(`/api/posts?page=${nextPage}&perPage=${PAGE_SIZE}`);
    const data = await res.json();

    setPosts((prev) => [...prev, ...data.posts]);
    setPage(nextPage);
    setLoading(false);

    if (data.posts.length < PAGE_SIZE || posts.length + data.posts.length >= MAX_POSTS) {
      setReachedEnd(true);
    }
  }

  return (
    <div className="flex flex-col">
      {posts.map((post) => {
        const img = featuredImage(post);
        return (
          <Link
            key={post.id}
            href={`/${post.slug}`}
            className="grid grid-cols-[220px_1fr] gap-6 items-start py-7 border-b border-rule story-link"
          >
            <div className="relative w-full aspect-[4/3] bg-ink/5">
              {img && <Image src={img.url} alt={img.alt} fill className="object-cover" />}
            </div>
            <div>
              <span className="eyebrow block mb-2">{primaryCategoryName(post)}</span>
              <h3 className="story-title font-display font-extrabold text-2xl leading-snug text-ink mb-2">
                {decodeEntities(post.title.rendered)}
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed line-clamp-2">
                {stripHtml(post.excerpt.rendered)}
              </p>
            </div>
          </Link>
        );
      })}

      {!reachedEnd && posts.length < MAX_POSTS && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="self-center mt-8 border border-ink px-8 py-3 font-semibold text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load More"}
        </button>
      )}
    </div>
  );
}
