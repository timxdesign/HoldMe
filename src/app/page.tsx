import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Users, Target, Bell } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-bold text-brand">HoldMe</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            You don&apos;t have to stay
            <br />
            <span className="text-brand">consistent alone.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            HoldMe is a modern accountability platform where you create private
            spaces, track goals, and invite trusted people to hold you
            accountable through encouragement, reminders, and support.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Start for free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn more</Link>
            </Button>
          </div>
        </section>

        <section
          id="features"
          className="max-w-5xl mx-auto px-4 py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-brand" />
            </div>
            <h3 className="font-semibold">Track Goals</h3>
            <p className="text-sm text-muted-foreground">
              Create goals, habits, and commitments in private accountability
              spaces.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-brand" />
            </div>
            <h3 className="font-semibold">Invite Partners</h3>
            <p className="text-sm text-muted-foreground">
              Invite friends, mentors, or coaches to hold you accountable.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-strength/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-strength" />
            </div>
            <h3 className="font-semibold">Send Strength</h3>
            <p className="text-sm text-muted-foreground">
              Encourage each other with emotional support, not gamification.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-brand" />
            </div>
            <h3 className="font-semibold">Stay Reminded</h3>
            <p className="text-sm text-muted-foreground">
              Get gentle reminders and check-in prompts to maintain consistency.
            </p>
          </div>
        </section>

        <section className="bg-muted/50 py-20">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Built for real accountability.
            </h2>
            <p className="text-muted-foreground">
              Not another productivity tool. HoldMe is a relationship-driven
              platform that combines emotional support, consistency tracking, and
              social accountability in a calm, mobile-first experience.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/signup">Join HoldMe</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HoldMe. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              About
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
