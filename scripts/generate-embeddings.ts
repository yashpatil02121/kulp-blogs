import 'dotenv/config';
import { db } from '../lib/db';
import { posts } from '../lib/schema';
import { generateEmbedding } from '../lib/embeddings';
import { eq } from 'drizzle-orm';

async function generateAllEmbeddings() {
  try {
    console.log('Fetching all posts...');
    const allPosts = await db.select().from(posts);
    console.log(`Found ${allPosts.length} posts`);
    
    let updated = 0;
    
    for (const post of allPosts) {
      try {
        console.log(`Processing: ${post.title}`);
        const textToEmbed = `${post.title} ${post.content} ${post.author || ''}`;
        const embedding = await generateEmbedding(textToEmbed);
        
        await db
          .update(posts)
          .set({ embedding: JSON.stringify(embedding) })
          .where(eq(posts.id, post.id));
        
        updated++;
        console.log(`✓ Updated embeddings for: ${post.title}`);
      } catch (error) {
        console.error(`✗ Error generating embedding for post ${post.id}:`, error);
      }
    }
    
    console.log(`\n✨ Successfully generated embeddings for ${updated}/${allPosts.length} posts`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

generateAllEmbeddings();

