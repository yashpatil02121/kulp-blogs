import { db } from "@/lib/db"
import { posts } from "@/lib/schema"
import { eq } from "drizzle-orm"

interface Props {
  params: { slug: string }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await db.select().from(posts).where(eq(posts.slug, params.slug)).limit(1)
  const data = post[0]

  if (!data) {
    return <div className="p-8 text-center text-gray-500">Post not found.</div>
  }

  return (
    <article className="max-w-2xl mx-auto p-4 prose prose-invert">
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
      <p className="text-sm text-gray-400 mb-6">
        {data.author} • {new Date(data.createdAt!).toLocaleDateString()}
      </p>
      <div>{data.content}</div>
    </article>
  )
}
