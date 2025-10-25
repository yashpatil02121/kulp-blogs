import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

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

export async function POST(request: NextRequest) {
  try {
    const { title, content, author } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    // Check if slug already exists and make it unique
    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const existingPost = await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.slug, uniqueSlug))
        .limit(1);

      if (existingPost.length === 0) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const result = await db
      .insert(posts)
      .values({
        title,
        slug: uniqueSlug,
        content,
        author: author || null,
      })
      .returning({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        author: posts.author,
        createdAt: posts.createdAt,
      });

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}