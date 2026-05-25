import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Heart,
  UsersGroupTwoRounded,
  Target,
  Bell,
  ArrowRight,
  Bolt,
  Shield,
  Stars,
  CheckCircle,
  Star,
  ChatRoundDots,
  CloseSquare,
} from "@solar-icons/react"
import {
  FadeIn,
  StaggerChildren,
  CountUp,
  FloatingElement,
  TextReveal,
} from "@/components/landing/animations"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-foreground/[0.04]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xl font-bold text-brand">
            <img src="/brand-asset/logo-mark.svg" alt="" className="h-6 w-6" />
            HoldMe
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button size="sm" className="rounded-full px-5" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14">
        {/* ============================================ */}
        {/* HERO                                         */}
        {/* ============================================ */}
        <section className="relative min-h-[90vh] flex items-center">
          {/* Ambient blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 h-[700px] w-[700px] rounded-full bg-brand/[0.06] blur-[120px] animate-breathe" />
            <div className="absolute top-40 -left-48 h-[500px] w-[500px] rounded-full bg-pink-500/[0.06] blur-[100px] animate-breathe" style={{ animationDelay: "2s" }} />
            <div className="absolute bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-orange-400/[0.05] blur-[100px] animate-breathe" style={{ animationDelay: "4s" }} />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-24 md:pt-20 md:pb-32 text-center space-y-10">
            <FadeIn delay={100} direction="none" duration={800}>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand/8 border border-brand/10 px-4 py-1.5 text-xs font-medium text-brand backdrop-blur-sm">
                <Stars className="h-3.5 w-3.5" />
                Accountability, reimagined
              </div>
            </FadeIn>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.08]">
                <FadeIn delay={200} duration={900}>
                  <span className="block font-light text-foreground/90">
                    You don&apos;t have to stay
                  </span>
                </FadeIn>
                <FadeIn delay={400} duration={900}>
                  <span className="block font-normal bg-gradient-to-r from-brand via-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient-shift leading-tight pb-1">
                    consistent alone.
                  </span>
                </FadeIn>
              </h1>

              <FadeIn delay={700} duration={800}>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-light">
                  Create intimate spaces for your goals. Invite the people who believe in you.
                  <span className="text-foreground/60 font-normal"> Let their support carry you forward.</span>
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={900} duration={700}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-base gap-2 shadow-xl shadow-brand/25 hover:shadow-brand/40 transition-shadow duration-500"
                  asChild
                >
                  <Link href="/auth/signup">
                    Start your journey
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full px-6 h-12 text-base text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="#how-it-works">How it works</Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={1100} duration={600}>
              <div className="flex items-center justify-center gap-5 sm:gap-8 pt-4 text-[13px] text-muted-foreground/60">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500/70" />
                  Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-brand/60" />
                  Private by default
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-pink-500/60" />
                  Built on care
                </span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ============================================ */}
        {/* MOCK UI PREVIEW                              */}
        {/* ============================================ */}
        <section className="relative -mt-10 mb-24 md:mb-32">
          <div className="max-w-4xl mx-auto px-4">
            <FadeIn duration={1000}>
              <div className="relative rounded-3xl bg-gradient-to-b from-card to-muted/40 ring-1 ring-foreground/[0.06] shadow-2xl shadow-black/8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand/[0.03] via-transparent to-pink-500/[0.03]" />
                <div className="relative p-5 md:p-10">
                  <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-4" staggerMs={150}>
                    {/* Goal Card */}
                    <FloatingElement amplitude={6} duration={7} delay={0}>
                      <div className="rounded-2xl bg-card ring-1 ring-foreground/[0.06] p-5 space-y-3 hover:ring-brand/20 transition-all duration-500 hover:shadow-lg hover:shadow-brand/5">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-xl bg-brand/10 p-2">
                            <Target className="h-4 w-4 text-brand" />
                          </div>
                          <span className="text-sm font-semibold">Meditate daily</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-brand to-blue-400 transition-all duration-1000" />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">72%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] text-green-600 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Active
                          </span>
                          <span className="text-[10px] text-muted-foreground">5-day streak</span>
                        </div>
                      </div>
                    </FloatingElement>

                    {/* Strength Card */}
                    <FloatingElement amplitude={8} duration={8} delay={0.5}>
                      <div className="rounded-2xl bg-card ring-1 ring-pink-500/15 p-5 space-y-3 hover:ring-pink-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-pink-500/5">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-xl bg-pink-500/10 p-2">
                            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                          </div>
                          <span className="text-sm font-semibold">Strength received!</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          &ldquo;You&apos;re crushing it! Keep going with the morning runs.&rdquo;
                        </p>
                        <div className="flex items-center gap-2.5">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 shadow-sm shadow-pink-500/20" />
                          <span className="text-xs font-medium">Sarah M.</span>
                        </div>
                      </div>
                    </FloatingElement>

                    {/* Reminder Card */}
                    <FloatingElement amplitude={6} duration={7.5} delay={1}>
                      <div className="rounded-2xl bg-card ring-1 ring-foreground/[0.06] p-5 space-y-3 hover:ring-orange-500/20 transition-all duration-500 hover:shadow-lg hover:shadow-orange-500/5">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-xl bg-orange-500/10 p-2">
                            <Bell className="h-4 w-4 text-orange-500" />
                          </div>
                          <span className="text-sm font-semibold">Gentle reminder</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Time to check in on your evening reading goal.
                        </p>
                        <Button size="sm" className="w-full h-8 text-xs rounded-xl">
                          Check in now
                        </Button>
                      </div>
                    </FloatingElement>
                  </StaggerChildren>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ============================================ */}
        {/* SOCIAL PROOF                                 */}
        {/* ============================================ */}
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4">
            <FadeIn>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 text-center">
                <div>
                  <p className="text-3xl md:text-4xl font-light tracking-tight">
                    <CountUp end={500} suffix="+" />
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">People growing together</p>
                </div>
                <div className="hidden sm:block h-10 w-px bg-foreground/[0.06]" />
                <div>
                  <p className="text-3xl md:text-4xl font-light tracking-tight">
                    <CountUp end={2400} suffix="+" />
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Goals being pursued</p>
                </div>
                <div className="hidden sm:block h-10 w-px bg-foreground/[0.06]" />
                <div>
                  <p className="text-3xl md:text-4xl font-light tracking-tight">
                    <CountUp end={12000} suffix="+" />
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Moments of encouragement</p>
                </div>
                <div className="hidden sm:block h-10 w-px bg-foreground/[0.06]" />
                <div>
                  <p className="text-3xl md:text-4xl font-light tracking-tight">
                    <CountUp end={89} suffix="%" />
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Stick with it rate</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ============================================ */}
        {/* EMOTIONAL INTERLUDE                          */}
        {/* ============================================ */}
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <FadeIn duration={1000}>
              <blockquote className="space-y-6">
                <p className="text-2xl sm:text-3xl md:text-4xl font-light leading-snug tracking-tight text-foreground/80">
                  &ldquo;Most times, the difference between giving up and holding on
                  <span className="italic font-normal text-foreground"> is having one person who refuses to let you quit.&rdquo;</span>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-8 bg-foreground/10" />
                  <span className="text-sm text-muted-foreground/60">The truth behind HoldMe</span>
                  <div className="h-px w-8 bg-foreground/10" />
                </div>
              </blockquote>
            </FadeIn>
          </div>
        </section>

        {/* ============================================ */}
        {/* HOW IT WORKS                                 */}
        {/* ============================================ */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-4 space-y-20">
            <div className="text-center space-y-5">
              <FadeIn>
                <h2 className="text-3xl md:text-5xl tracking-tight">
                  Simple by design.
                  <span className="block text-muted-foreground/50 font-light italic">Powerful by nature.</span>
                </h2>
              </FadeIn>
              <FadeIn delay={200}>
                <p className="text-muted-foreground/70 max-w-md mx-auto">
                  Three steps. No learning curve. Just honest support from people who care.
                </p>
              </FadeIn>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-6">
              <FadeIn delay={0} direction="up">
                <div className="relative group">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-brand/8 text-brand font-light text-lg transition-all duration-500 group-hover:bg-brand group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand/25">
                        1
                      </div>
                      <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-brand/20 to-transparent" />
                    </div>
                    <h3 className="text-xl">Create your space</h3>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">
                      A quiet corner for your goals, habits, or commitments.
                      Name it, describe it, make it yours.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={200} direction="up">
                <div className="relative group">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-500/8 text-purple-500 font-light text-lg transition-all duration-500 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-500/25">
                        2
                      </div>
                      <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent" />
                    </div>
                    <h3 className="text-xl">Invite someone you trust</h3>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">
                      A friend, partner, therapist, or coach. Someone who
                      genuinely wants to see you succeed.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={400} direction="up">
                <div className="relative group">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-pink-500/8 text-pink-500 font-light text-lg transition-all duration-500 group-hover:bg-pink-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-pink-500/25">
                        3
                      </div>
                    </div>
                    <h3 className="text-xl">Grow together</h3>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">
                      Check in, receive encouragement, and feel the difference
                      of having someone in your corner.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FEATURES                                     */}
        {/* ============================================ */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand/[0.03] blur-[100px]" />

          <div className="relative max-w-5xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-5">
              <FadeIn>
                <h2 className="text-3xl md:text-5xl tracking-tight">
                  Built around
                  <span className="italic font-normal"> what actually works</span>
                </h2>
              </FadeIn>
              <FadeIn delay={150}>
                <p className="text-muted-foreground/70 max-w-lg mx-auto">
                  Not gamification. Not social pressure. Just the features that
                  help real people stay consistent with real goals.
                </p>
              </FadeIn>
            </div>

            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerMs={100}>
              <FeatureCard
                icon={<Target className="h-5 w-5" />}
                gradient="from-brand/10 to-blue-400/10"
                iconColor="text-brand"
                title="Goals & Habits"
                description="Track daily rituals, weekly targets, or life-changing commitments. Your pace, your way."
              />
              <FeatureCard
                icon={<UsersGroupTwoRounded className="h-5 w-5" />}
                gradient="from-purple-500/10 to-indigo-500/10"
                iconColor="text-purple-500"
                title="Private Spaces"
                description="Invite-only spaces for different parts of your life. Only the people who matter can see your journey."
              />
              <FeatureCard
                icon={<Heart className="h-5 w-5" />}
                gradient="from-pink-500/10 to-rose-400/10"
                iconColor="text-pink-500"
                title="Send Strength"
                description="One tap sends real encouragement. Your partner sees it light up in real-time. It means something."
              />
              <FeatureCard
                icon={<Bell className="h-5 w-5" />}
                gradient="from-orange-500/10 to-amber-400/10"
                iconColor="text-orange-500"
                title="Gentle Reminders"
                description="Morning, evening, weekdays — you choose when. Nudges, not nagging."
              />
              <FeatureCard
                icon={<Bolt className="h-5 w-5" />}
                gradient="from-yellow-500/10 to-orange-400/10"
                iconColor="text-yellow-600"
                title="Push Notifications"
                description="Real-time alerts even when the app is closed. Never miss encouragement or a check-in."
              />
              <FeatureCard
                icon={<Shield className="h-5 w-5" />}
                gradient="from-green-500/10 to-emerald-400/10"
                iconColor="text-green-600"
                title="Privacy First"
                description="No public profiles. No leaderboards. No data selling. Just you and the people who care."
              />
            </StaggerChildren>
          </div>
        </section>

        {/* ============================================ */}
        {/* TESTIMONIALS                                 */}
        {/* ============================================ */}
        <section className="py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-5">
              <FadeIn>
                <h2 className="text-3xl md:text-5xl tracking-tight">
                  Real people,
                  <span className="italic font-normal"> real consistency</span>
                </h2>
              </FadeIn>
              <FadeIn delay={150}>
                <p className="text-muted-foreground/70 max-w-md mx-auto">
                  Here&apos;s what happens when accountability becomes about care instead of pressure.
                </p>
              </FadeIn>
            </div>

            <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerMs={150}>
              <TestimonialCard
                quote="I've tried every habit tracker. HoldMe is different — knowing Sarah can see my goals makes me actually do them. Not out of guilt, out of love."
                name="Alex R."
                role="Software Engineer"
                gradient="from-brand to-blue-400"
              />
              <TestimonialCard
                quote="My training partner sends me strength before every morning session. That little heart notification is genuinely the reason I get out of bed at 5am."
                name="Priya K."
                role="Fitness Coach"
                gradient="from-orange-400 to-pink-500"
              />
              <TestimonialCard
                quote="I recommend HoldMe to clients building new routines. Accountability without judgment — that's what healing looks like in practice."
                name="Dr. James L."
                role="Licensed Therapist"
                gradient="from-purple-500 to-indigo-500"
              />
            </StaggerChildren>
          </div>
        </section>

        {/* ============================================ */}
        {/* COMPARISON                                   */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-5">
              <FadeIn>
                <h2 className="text-3xl md:text-5xl tracking-tight">
                  We chose a
                  <span className="italic font-normal"> different path</span>
                </h2>
              </FadeIn>
              <FadeIn delay={150}>
                <p className="text-muted-foreground/70 max-w-md mx-auto">
                  Most apps optimize for engagement. We optimize for the moment
                  you actually follow through.
                </p>
              </FadeIn>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <FadeIn delay={0} direction="left">
                <div className="rounded-2xl bg-card ring-1 ring-foreground/[0.06] p-7 space-y-5 h-full">
                  <h3 className="font-semibold text-muted-foreground/50 text-xs uppercase tracking-widest">
                    Other apps
                  </h3>
                  <ul className="space-y-4 text-sm text-muted-foreground/70">
                    <li className="flex items-start gap-3">
                      <CloseSquare className="shrink-0 mt-0.5 h-4 w-4 text-foreground/20" />
                      Streaks that cause anxiety when broken
                    </li>
                    <li className="flex items-start gap-3">
                      <CloseSquare className="shrink-0 mt-0.5 h-4 w-4 text-foreground/20" />
                      Public leaderboards and social pressure
                    </li>
                    <li className="flex items-start gap-3">
                      <CloseSquare className="shrink-0 mt-0.5 h-4 w-4 text-foreground/20" />
                      Gamification that fades after two weeks
                    </li>
                    <li className="flex items-start gap-3">
                      <CloseSquare className="shrink-0 mt-0.5 h-4 w-4 text-foreground/20" />
                      Solo experience with no real support
                    </li>
                  </ul>
                </div>
              </FadeIn>

              <FadeIn delay={200} direction="right">
                <div className="rounded-2xl bg-card ring-1 ring-brand/15 p-7 space-y-5 shadow-xl shadow-brand/[0.04] h-full">
                  <h3 className="font-semibold text-brand text-xs uppercase tracking-widest">
                    HoldMe
                  </h3>
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="shrink-0 mt-0.5 h-4 w-4 text-brand" />
                      Encouragement-first — no punishment for off days
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="shrink-0 mt-0.5 h-4 w-4 text-brand" />
                      Private spaces with people who know your story
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="shrink-0 mt-0.5 h-4 w-4 text-brand" />
                      Human support that compounds over time
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="shrink-0 mt-0.5 h-4 w-4 text-brand" />
                      Built for lasting change, not dopamine hits
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* EMOTIONAL CLOSER                             */}
        {/* ============================================ */}
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4">
            <FadeIn duration={1000}>
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-500/30" />
                  <Heart className="h-5 w-5 text-pink-500/40" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-500/30" />
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-light leading-relaxed text-foreground/70 tracking-tight">
                  Every goal you&apos;ve abandoned wasn&apos;t because you weren&apos;t strong enough.
                  <span className="block mt-2 text-foreground/90 italic font-normal">
                    It was because you were trying alone.
                  </span>
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ============================================ */}
        {/* FINAL CTA                                    */}
        {/* ============================================ */}
        <section className="relative py-24 md:py-36 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-brand/[0.05] blur-[120px] animate-breathe" />
            <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-pink-500/[0.04] blur-[80px] animate-breathe" style={{ animationDelay: "2s" }} />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 text-center space-y-10">
            <FadeIn>
              <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
                Your people are waiting
                <span className="block italic font-normal text-muted-foreground/60">to hold you accountable.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={200}>
              <p className="text-muted-foreground/70 text-lg max-w-xl mx-auto font-light">
                It takes 30 seconds to create a space and invite someone.
                That&apos;s all it takes to change the pattern.
              </p>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="rounded-full px-10 h-14 text-base gap-2 shadow-xl shadow-brand/25 hover:shadow-brand/40 transition-all duration-500 hover:scale-[1.02]"
                  asChild
                >
                  <Link href="/auth/signup">
                    Begin now — it&apos;s free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={600}>
              <p className="text-xs text-muted-foreground/40">
                No credit card. No trial period. Free forever for personal use.
              </p>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* ============================================ */}
      {/* FOOTER                                       */}
      {/* ============================================ */}
      <footer className="border-t border-foreground/[0.04] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2">
              <span className="flex items-center gap-2 text-lg font-bold text-brand">
                <img src="/brand-asset/logo-mark.svg" alt="" className="h-5 w-5" />
                HoldMe
              </span>
              <p className="text-sm text-muted-foreground/50 font-light">
                Stay consistent together.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground/50">
              <Link href="#how-it-works" className="hover:text-foreground/70 transition-colors duration-300">
                How it works
              </Link>
              <Link href="#" className="hover:text-foreground/70 transition-colors duration-300">
                About
              </Link>
              <Link href="#" className="hover:text-foreground/70 transition-colors duration-300">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground/70 transition-colors duration-300">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-foreground/[0.04] text-center">
            <span className="text-xs text-muted-foreground/30">
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
  gradient,
  iconColor,
  title,
  description,
}: {
  icon: React.ReactNode
  gradient: string
  iconColor: string
  title: string
  description: string
}) {
  return (
    <div className="group rounded-2xl bg-card ring-1 ring-foreground/[0.06] p-6 space-y-4 transition-all duration-500 hover:ring-foreground/10 hover:shadow-xl hover:shadow-black/[0.03] hover:-translate-y-1">
      <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h3 className="font-semibold text-[15px]">{title}</h3>
      <p className="text-sm text-muted-foreground/70 leading-relaxed font-light">
        {description}
      </p>
    </div>
  )
}

function TestimonialCard({
  quote,
  name,
  role,
  gradient,
}: {
  quote: string
  name: string
  role: string
  gradient: string
}) {
  return (
    <div className="group rounded-2xl bg-card ring-1 ring-foreground/[0.06] p-6 space-y-5 flex flex-col transition-all duration-500 hover:ring-foreground/10 hover:shadow-xl hover:shadow-black/[0.03] hover:-translate-y-1">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-yellow-500" />
        ))}
      </div>
      <div className="flex-1">
        <ChatRoundDots className="h-4 w-4 text-muted-foreground/20 mb-3" />
        <p className="text-sm leading-relaxed font-light">{quote}</p>
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-foreground/[0.04]">
        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} shadow-sm`} />
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-[11px] text-muted-foreground/50">{role}</p>
        </div>
      </div>
    </div>
  )
}
