import { ArrowLeft, Clock, User } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import GradientText from "@/components/GradientText"
import AISummarizer from "@/components/AISummarizer"

interface BlogPostPageProps {
  params: { slug: string }
}

// Function to estimate reading time
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Function to extract tags from content (simple implementation)
function extractTags(content: string): string[] {
  const tags: string[] = []
  const keywords = [
    // Core technologies
    'React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'HTML', 'CSS', 'Tailwind CSS',
  
    // Frameworks & Libraries
    'Vue', 'Nuxt.js', 'Angular', 'Svelte', 'Redux', 'Zustand', 'React Query', 'Axios',
  
    // Backend & APIs
    'API', 'REST API', 'GraphQL', 'gRPC', 'Database', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Prisma', 'Sequelize', 'Firebase', 'Supabase',
  
    // Frontend
    'Frontend', 'UI', 'UX', 'Responsive Design', 'Component', 'SPA', 'CSR', 'SSR', 'Hydration',
  
    // Backend
    'Backend', 'Server', 'Authentication', 'Authorization', 'JWT', 'OAuth', 'Session', 'Middleware',
  
    // DevOps & Deployment
    'CI/CD', 'Docker', 'Kubernetes', 'AWS', 'Vercel', 'Netlify', 'Cloudflare', 'GitHub Actions',
  
    // Testing
    'Vitest', 'Jest', 'Testing Library', 'Cypress', 'Playwright', 'Unit Test', 'Integration Test', 'E2E Test',
  
    // Tools & Build Systems
    'Vite', 'Webpack', 'Babel', 'ESLint', 'Prettier', 'TSConfig', 'Package.json', 'npm', 'yarn', 'pnpm',
  
    // General Software Concepts
    'Design Patterns', 'Clean Code', 'OOP', 'Functional Programming', 'Refactoring', 'State Management',
  
    // Performance & Optimization
    'Lazy Loading', 'Code Splitting', 'Caching', 'Optimization', 'SEO', 'Core Web Vitals',
  
    // Version Control & Collaboration
    'Git', 'GitHub', 'GitLab', 'Pull Request', 'Merge Conflict', 'Branching Strategy',
  
    // Miscellaneous
    'Full Stack', 'Web Development', 'Software Engineering', 'Microservices', 'Monorepo'
  ];
  

  keywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      tags.push(keyword)
    }
  })

  return tags.slice(0, 4) // Limit to 4 tags
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/posts/${slug}`)
  const post = response.ok ? await response.json() : null

  if (!post) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Card className="max-w-md mx-4 bg-gray-900 border-0">
          <CardContent className="text-center py-12">
            <h1 className="text-3xl font-bold text-red-400 mb-4">404 — Post Not Found</h1>
            <p className="text-gray-200 mb-6">
              The blog post you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              <Link href="/blogs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const readingTime = estimateReadingTime(post.content)
  const tags = extractTags(post.content)

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="hover:bg-muted/50 text-white">
            <Link href="/blogs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Card */}
        <Card className="shadow-xl border-0 bg-gray-900">
          <CardHeader className="pb-6">
            {/* Title with Gradient */}
            <div className="mb-6">
              <GradientText
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
                animationSpeed={6}
              >
                {post.title}
              </GradientText>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-white">{post.author || 'Anonymous'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>

              <div className="text-gray-300">
                {new Date(post.createdAt!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <AISummarizer content={post.content} />
          </CardHeader>

          <CardContent className="pt-0">
            {/* Article Content */}
            <article className="text-white prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-p:text-white prose-p:leading-relaxed
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-semibold
              prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
              prose-blockquote:border-l-blue-400 prose-blockquote:text-white
              prose-ul:text-white prose-ol:text-white
              prose-li:text-white
              first:prose-p:text-lg first:prose-p:font-medium first:prose-p:text-white
            ">
              {post.content}
            </article>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-gray-300">
                  Published on {new Date(post.createdAt!).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href="/blogs">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    More Articles
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
