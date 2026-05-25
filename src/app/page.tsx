import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Users,
  Target,
  Bell,
  ArrowRight,
  Zap,
  Shield,
  Sparkles,
  CheckCircle2,
  Star,
  Quote,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-foreground/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-bold text-brand">HoldMe</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button size="sm" className="rounded-full px-4" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14">
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-brand/5 blur-3xl" />
            <div className="absolute top-20 -left-40 h-[400px] w-[400px] rounded-full bg-pink-500/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/5 blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-28 md:pt-32 md:pb-36 text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-xs font-medium text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              Accountability, reimagined
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              You don&apos;t have to stay
              <br />
              <span className="bg-gradient-to-r from-brand via-blue-400 to-brand bg-clip-text text-transparent">
                consistent alone.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create private spaces, set meaningful goals, and invite people you trust
              to cheer you on. Not a productivity tool — a support system.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button size="lg" className="rounded-full px-8 h-12 text-base gap-2 shadow-lg shadow-brand/20" asChild>
                <Link href="/auth/signup">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-brand" />
                Private by default
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-orange-500" />
                Push notifications
              </span>
            </div>
          </div>

          {/* Mock UI Preview */}
          <div className="relative max-w-4xl mx-auto px-4 -mt-8 mb-20">
            <div className="relative rounded-2xl bg-gradient-to-b from-card to-muted/50 ring-1 ring-foreground/10 shadow-2xl shadow-black/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 via-transparent to-pink-500/5" />
              <div className="relative p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Goal Card Mock */}
                  <div className="rounded-xl bg-card ring-1 ring-foreground/8 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-brand/10 p-1.5">
                        <Target className="h-3.5 w-3.5 text-brand" />
                      </div>
                      <span className="text-sm font-semibold">Meditate daily</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[72%] rounded-full bg-brand" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">72%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] text-green-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Active
                      </span>
                      <span className="text-[10px] text-muted-foreground">5-day streak</span>
                    </div>
                  </div>

                  {/* Strength Card Mock */}
                  <div className="rounded-xl bg-card ring-1 ring-pink-500/20 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-pink-500/10 p-1.5">
                        <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
                      </div>
                      <span className="text-sm font-semibold">Strength received!</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      &ldquo;You&apos;re crushing it! Keep going with the morning runs.&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
                      <span className="text-xs font-medium">Sarah M.</span>
                    </div>
                  </div>

                  {/* Reminder Card Mock */}
                  <div className="rounded-xl bg-card ring-1 ring-foreground/8 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-orange-500/10 p-1.5">
                        <Bell className="h-3.5 w-3.5 text-orange-500" />
                      </div>
                      <span className="text-sm font-semibold">Reminder</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Time to check in on your evening reading goal.
                    </p>
                    <Button size="sm" className="w-full h-7 text-xs rounded-lg">
                      Check in now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="border-y bg-muted/30 py-8">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-xs text-muted-foreground">Active users</p>
              </div>
              <div className="hidden sm:block h-8 w-px bg-border" />
              <div>
                <p className="text-2xl font-bold">2,400+</p>
                <p className="text-xs text-muted-foreground">Goals tracked</p>
              </div>
              <div className="hidden sm:block h-8 w-px bg-border" />
              <div>
                <p className="text-2xl font-bold">12,000+</p>
                <p className="text-xs text-muted-foreground">Strengths sent</p>
              </div>
              <div className="hidden sm:block h-8 w-px bg-border" />
              <div>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-xs text-muted-foreground">Consistency rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                How it works
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Three simple steps to build a support system that keeps you consistent.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-brand/50 to-transparent" />
                </div>
                <h3 className="text-lg font-semibold">Create a space</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up a private space for yourself. Add your goals, habits,
                  or commitments — whatever you want to stay consistent with.
                </p>
              </div>

              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-brand/50 to-transparent" />
                </div>
                <h3 className="text-lg font-semibold">Invite your people</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Share a link with a trusted friend, partner, coach, or mentor.
                  They can see your goals and cheer you on.
                </p>
              </div>

              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white font-bold text-sm shrink-0">
                    3
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Stay consistent together</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Check in on your goals, receive strength from partners, and get
                  gentle reminders. Consistency through connection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything you need to stay on track
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Built around human connection, not streaks or gamification.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Target className="h-5 w-5" />}
                iconBg="bg-brand/10"
                iconColor="text-brand"
                title="Goals & Habits"
                description="Track daily habits, weekly goals, one-time tasks, or long-term commitments in one place."
              />
              <FeatureCard
                icon={<Users className="h-5 w-5" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-500"
                title="Private Spaces"
                description="Create invite-only spaces for different areas of life. Full control over who sees what."
              />
              <FeatureCard
                icon={<Heart className="h-5 w-5" />}
                iconBg="bg-pink-500/10"
                iconColor="text-pink-500"
                title="Send Strength"
                description="Encourage your partners with a tap. They get a real-time lightning effect and push notification."
              />
              <FeatureCard
                icon={<Bell className="h-5 w-5" />}
                iconBg="bg-orange-500/10"
                iconColor="text-orange-500"
                title="Smart Reminders"
                description="Set custom reminder schedules per goal. Morning, evening, weekdays only — your call."
              />
              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                iconBg="bg-yellow-500/10"
                iconColor="text-yellow-600"
                title="Push Notifications"
                description="Get notified even when the app is closed. Never miss a check-in or encouragement."
              />
              <FeatureCard
                icon={<Shield className="h-5 w-5" />}
                iconBg="bg-green-500/10"
                iconColor="text-green-600"
                title="Privacy First"
                description="No public profiles. No leaderboards. Just you, your goals, and the people who care."
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                People love HoldMe
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Here&apos;s what our community has to say about staying consistent together.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <TestimonialCard
                quote="I've tried every habit tracker out there. HoldMe is the first one that actually works because it's about people, not points."
                name="Alex R."
                role="Software Engineer"
                stars={5}
              />
              <TestimonialCard
                quote="My workout buddy and I use this daily. Getting a strength notification right before the gym hits different."
                name="Priya K."
                role="Fitness Coach"
                stars={5}
              />
              <TestimonialCard
                quote="As a therapist, I recommend HoldMe to clients building new routines. The accountability without judgment is exactly right."
                name="Dr. James L."
                role="Licensed Therapist"
                stars={5}
              />
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Not just another habit app
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                We built something different. Here&apos;s how HoldMe compares.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-card ring-1 ring-foreground/8 p-6 space-y-4">
                <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                  Other apps
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px]">x</span>
                    Streaks that cause anxiety when broken
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px]">x</span>
                    Public leaderboards and social pressure
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px]">x</span>
                    Gamification that fades after 2 weeks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px]">x</span>
                    Solo experience with no support system
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-card ring-1 ring-brand/20 p-6 space-y-4 shadow-lg shadow-brand/5">
                <h3 className="font-semibold text-brand text-sm uppercase tracking-wide">
                  HoldMe
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="shrink-0 mt-0.5 h-4 w-4 text-brand" />
                    Encouragement-first — no punishment for off days
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="shrink-0 mt-0.5 h-4 w-4 text-brand" />
                    Private spaces with people who actually know you
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="shrink-0 mt-0.5 h-4 w-4 text-brand" />
                    Real human support that keeps you coming back
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="shrink-0 mt-0.5 h-4 w-4 text-brand" />
                    Built for long-term consistency, not dopamine hits
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-24 md:py-32">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-brand/5 blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to stay consistent?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Join hundreds of people who are building better habits with the support of people they trust.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="rounded-full px-8 h-12 text-base gap-2 shadow-lg shadow-brand/20" asChild>
                <Link href="/auth/signup">
                  Create your free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              No credit card required. Free forever for personal use.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2">
              <span className="text-lg font-bold text-brand">HoldMe</span>
              <p className="text-sm text-muted-foreground">
                Stay consistent together.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <Link href="#how-it-works" className="hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center">
            <span className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} HoldMe. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  description: string
}) {
  return (
    <div className="group rounded-2xl bg-card ring-1 ring-foreground/8 p-6 space-y-4 transition-all duration-300 hover:ring-foreground/15 hover:shadow-lg hover:-translate-y-0.5">
      <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function TestimonialCard({
  quote,
  name,
  role,
  stars,
}: {
  quote: string
  name: string
  role: string
  stars: number
}) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-foreground/8 p-6 space-y-4 flex flex-col">
      <div className="flex items-center gap-0.5">
        {[...Array(stars)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
        ))}
      </div>
      <div className="flex-1">
        <Quote className="h-4 w-4 text-muted-foreground/40 mb-2" />
        <p className="text-sm leading-relaxed">{quote}</p>
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-foreground/5">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand/60 to-purple-500/60" />
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-[11px] text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  )
}
