import Link from "next/link"
import { db } from "@/lib/db"
import { posts } from "@/lib/schema"

export default async function BlogIndexPage() {
  const allPosts = await db.select().from(posts)

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <ul className="space-y-4">
        {allPosts.map((post) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`} className="text-blue-500 hover:underline text-lg">
              {post.title}
            </Link>
            <p className="text-sm text-gray-500">{post.author}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
