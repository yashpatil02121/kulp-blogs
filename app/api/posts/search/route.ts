import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/schema';
import { generateEmbedding, cosineSimilarity } from '@/lib/embeddings';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query) {
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
        .orderBy(desc(posts.createdAt));
      
      return NextResponse.json(result);
    }
    
    const queryEmbedding = await generateEmbedding(query);
    
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        author: posts.author,
        createdAt: posts.createdAt,
        embedding: posts.embedding,
      })
      .from(posts);
    
    const postsWithScores = allPosts
      .filter(post => post.embedding)
      .map(post => {
        const postEmbedding = JSON.parse(post.embedding as string);
        const similarity = cosineSimilarity(queryEmbedding, postEmbedding);
        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          author: post.author,
          createdAt: post.createdAt,
          similarity,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);
    
    const results = postsWithScores.map(({ similarity, ...post }) => post);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    );
  }
}

