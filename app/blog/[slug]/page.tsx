import { db } from "@/lib/db"
import { posts } from "@/lib/schema"
import { eq } from "drizzle-orm"

interface BlogPostPageProps {
  params: { slug: string }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, params.slug),
  })

  if (!post) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-red-500">404 — Post Not Found</h1>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 mb-6">
        By {post.author} • {new Date(post.createdAt!).toLocaleDateString()}
      </p>
      <article className="prose prose-invert">{post.content}</article>
    </main>
  )
}
