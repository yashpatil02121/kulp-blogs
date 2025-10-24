import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/schema';
import { generateEmbedding } from '@/lib/embeddings';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const allPosts = await db.select().from(posts);
    
    let updated = 0;
    
    for (const post of allPosts) {
      try {
        const textToEmbed = `${post.title} ${post.content} ${post.author || ''}`;
        const embedding = await generateEmbedding(textToEmbed);
        
        await db
          .update(posts)
          .set({ embedding: JSON.stringify(embedding) })
          .where(eq(posts.id, post.id));
        
        updated++;
        console.log(`Updated embeddings for post: ${post.title}`);
      } catch (error) {
        console.error(`Error generating embedding for post ${post.id}:`, error);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Generated embeddings for ${updated} posts` 
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

