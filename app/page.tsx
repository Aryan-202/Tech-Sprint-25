import Link from 'next/link'
import { ArrowRight, Sparkles, FileText, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'AI-Powered Generation',
      description: 'Get professionally crafted resumes using advanced AI algorithms'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Multiple Templates',
      description: 'Choose from various professional resume templates'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Fast & Efficient',
      description: 'Generate a complete resume in under 2 minutes'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Privacy Focused',
      description: 'Your data is never stored or shared with third parties'
    }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Create Your Perfect Resume with{' '}
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                V Place
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Transform your career profile into a professional resume that stands out. 
              Powered by advanced AI to highlight your strengths and achievements.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={session ? "/dashboard" : "/api/auth/signin"}>
                  {session ? "Go to Dashboard" : "Start Building Free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Why Choose Our AI Resume Builder</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to create a professional resume
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to land your dream job?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of successful job seekers who used our AI Resume Builder
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-blue-600 hover:bg-gray-100"
            asChild
          >
            <Link href={session ? "/dashboard" : "/api/auth/signin"}>
              {session ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}