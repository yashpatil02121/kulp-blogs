'use client'
import { ArrowLeft, Clock, User } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import GradientText from "@/components/GradientText"
import AISummarizer from "@/components/AISummarizer"
import { useEffect, useState, useRef } from "react"

interface BlogPostPageProps {
  params: { slug: string }
}

// Function to estimate reading time
interface Post {
  title: string
  content: string
  author?: string
  createdAt?: string
}

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

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [slug, setSlug] = useState<string>('')
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!slug) return
    
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/posts/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setPost(data)
        setLoading(false)
      })
  }, [slug])

  const handleSendEmail = async () => {
    const recipientEmail = emailInputRef.current?.value
    if (!recipientEmail || !post) {
      alert('Please enter a valid email address')
      return
    }

    const profileStr = localStorage.getItem('profile')
    if (!profileStr) {
      alert('Please sign in to send emails')
      return
    }

    const profile = JSON.parse(profileStr)
    if (!profile.access_token && !profile.refresh_token) {
      alert('No authentication token found. Please sign in again.')
      return
    }

    setSending(true)

    try {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">${post.title}</h1>
          <p style="color: #666; font-size: 14px;">
            <strong>Author:</strong> ${post.author || 'Anonymous'}<br/>
            <strong>Date:</strong> ${post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
          </p>
          <hr style="border: 1px solid #eee; margin: 20px 0;"/>
          <div style="color: #333; line-height: 1.6;">
            ${post.content.replace(/\n/g, '<br/>')}
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;"/>
          <p style="color: #999; font-size: 12px;">
            Sent by ${profile.full_name} (${profile.email})
          </p>
        </div>
      `

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail,
          from: profile.email,
          subject: `Blog: ${post.title}`,
          content: emailContent,
          accessToken: profile.access_token,
          refreshToken: profile.refresh_token,
          provider: profile.provider,
          providerId: profile.provider_user_id,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Email sent successfully!')
      } else {
        if (result.error === 'Gmail API not enabled') {
          const shouldEnable = confirm(
            `⚠️ Gmail API is not enabled in your Google Cloud Console.\n\n` +
            `To send emails, you need to:\n` +
            `1. Enable the Gmail API in your Google Cloud project\n` +
            `2. Wait a few minutes for changes to propagate\n\n` +
            `Click OK to open the Gmail API activation page.`
          )
          if (shouldEnable && result.activationUrl) {
            window.open(result.activationUrl, '_blank')
          }
        } else if (result.error?.includes('sign out and sign in again') || result.error?.includes('grant Gmail send permission')) {
          const shouldReauth = confirm(
            `Gmail send permission is required.\n\n` +
            `IMPORTANT: Before signing in again, you must:\n` +
            `1. Go to: https://myaccount.google.com/permissions\n` +
            `2. Find and remove this app's access\n` +
            `3. Then sign in again to grant Gmail permissions\n\n` +
            `Click OK to sign out now, then follow the steps above.`
          )
          if (shouldReauth) {
            localStorage.clear()
            window.open('https://myaccount.google.com/permissions', '_blank')
            setTimeout(() => {
              window.location.href = '/auth/signin'
            }, 1000)
          }
        } else {
          alert(`Failed to send email: ${result.error}`)
        }
      }
    } catch (error) {
      alert('Error sending email. Please try again.')
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading...</div>
      </main>
    )
  }

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
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="hover:bg-muted/50 text-white">
            <Link href="/blogs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-gray-900">
          <CardHeader className="pb-6">
            <div className="mb-6">
              <GradientText
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
                animationSpeed={6}
              >
                {post.title}
              </GradientText>
            </div>

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
      <div className="text-center text-white space-x-4 py-4 text-sm text-gray-500 shadow-[0_-4px_6px_-1px_rgba(255,255,255,0.1)]">
        <input ref={emailInputRef} type="text" defaultValue={"yash.203859107@vcet.edu.in"} placeholder="Enter your email" className="w-full max-w-md mx-auto p-2 rounded-md border border-gray-300 text-white" />
        <button onClick={handleSendEmail} disabled={sending} className="bg-white text-purple-700 px-4 py-2 rounded-md disabled:opacity-50">
          {sending ? 'Sending...' : 'send blog to email'}
        </button>
      </div>
    </main>
  )
}
