import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        author: posts.author,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(6);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
