# HoldMe — Product & Development Brief

## Project Overview

**Project Name:** HoldMe

HoldMe is a modern accountability platform that allows users to create private accountability spaces, list goals or commitments they want to stay consistent with, and invite trusted people to hold them accountable through encouragement, reminders, check-ins, and social support.

The product is designed to combine emotional support, consistency tracking, and social accountability in a clean, premium, mobile-first experience.

The platform should feel:

* Human
* Encouraging
* Calm
* Motivational
* Lightweight
* Social without becoming noisy

This is not another productivity app.

HoldMe is a relationship-driven accountability platform.

---

# Core Problem

Most people struggle with consistency because:

* They work alone
* Nobody checks on them
* Motivation fades quickly
* Existing productivity apps feel robotic
* Accountability systems feel too rigid or too public

HoldMe solves this by creating:

* Private accountability circles
* Trusted support systems
* Emotional encouragement loops
* Visibility into personal progress
* Gentle social pressure

---

# Core Product Concept

Users create accountability spaces where they:

* Add goals/tasks/habits/commitments
* Define reminders/check-in frequency
* Invite accountability partners
* Receive encouragement ("Send Strength")
* Track progress with frequency-gated check-ins
* Stay consistent through social support and push notifications

Example:
A user creates a space called:
"30 Day Discipline Challenge"

Inside the space:

* Wake up at 5AM (habit, daily)
* Gym 4x weekly (goal, weekly)
* Post content daily (habit, daily)
* Read 10 pages daily (habit, daily)

They invite:

* Friends
* Mentors
* Coaches
* Family
* Accountability partners

Partners can:

* View allowed items
* Send encouragement ("Send Strength") with real-time lightning effects
* Comment/check in
* Monitor consistency

---

# Target Audience

## Primary Users

* Students
* Founders
* Creators
* Fitness enthusiasts
* Professionals
* Faith-based communities
* Accountability groups
* Coaches & mentors

## Secondary Users

* Friends supporting friends
* Couples
* Teams
* Productivity communities

---

# Product Goals

## Business Goals

* Build a highly engaging social accountability platform
* Increase user retention through emotional engagement
* Encourage recurring usage via reminders/check-ins
* Create viral growth through invitations

## User Goals

Users should be able to:

* Stay accountable
* Build consistency
* Feel supported
* Receive motivation
* Track progress
* Share goals privately

---

# Design Direction

## Design Style

* Modern
* Premium
* Soft
* Motivational
* Clean
* Emotionally warm
* Minimal but interactive

The UI should feel:

* Trustworthy
* Social
* Encouraging
* Easy to use

Avoid:

* Overly corporate interfaces
* Clutter and visual noise (gradient bars, colored stat pills, stats grids)
* Heavy dashboards and dense information displays
* Dark productivity aesthetics
* Shadow/lift hover effects on cards — use subtle background tint instead
* Wide layouts — keep content focused and narrow

## Design System (Implemented)

### Current Direction: Minimal & Focused

The design has evolved toward a stripped-back, content-first approach. Every screen should feel calm, scannable, and focused — no visual layer that doesn't earn its place.

**Layout**

* Narrow, focused content column (`max-w-2xl`) for all detail and list pages
* Text-based headers — no gradient cards or bordered header containers
* Flat visual hierarchy: title, metadata line, actions, then content
* Generous vertical spacing between sections for breathing room

**Cards & Containers**

* Subtle ring borders (`ring-foreground/[0.06]`) — nearly invisible at rest
* Hover: gentle background tint (`hover:bg-muted/30`) + slightly stronger ring — no shadows, no translate/lift
* No gradient accent bars on cards
* Stats shown as plain text with small inline icons, not colored pill backgrounds

**Animations**

* Staggered `FadeIn` entrance on page sections (header → actions → content, 0/150/250/350ms)
* Per-card stagger in lists (60ms offset per item)
* Tab content animates on switch via `key={tab}` remount
* Subtle emoji/icon scale on hover (5%)
* Existing interaction animations preserved: check-in circle fill, heart scale on strength send, inline form slide-in

**Tabs & Filtering**

* Pill-style segmented controls (rounded-lg, bg-muted/40 track)
* Text-only tab labels with inline count — no icons in tabs
* Conditional tabs: only rendered when both categories have items; single-category views skip tabs entirely

**Information Density**

* Joined spaces show owner name ("by Name") in stats row instead of member count
* Owned spaces show member count in stats row
* No privacy badges, no "Active support" labels — only information the user acts on
* Strength count shown as a quiet pink number with heart icon, no pulse animation

### Preserved Patterns

* Ambient gradient blobs on landing/hero sections
* Floating dropdown menus for edit/delete actions (owner only)
* Inline edit forms that expand in-place with slide-in animation
* 4-step goal creation wizard with step indicator and directional transitions
* Real-time strength flash notifications on goal cards

---

# Branding

## Primary Color

#1E96FC (brand blue)

## Secondary Color

#FC851D (brand orange, used for strengths)

## Strength Color

#EC4899 (pink-500, used for Send Strength, heart effects)

## Typeface

DM Sans (variable font, loaded locally)

---

# Platform Deliverables

## 1. End User Web App (Implemented)

Responsive web application built as a PWA.

* Landing page with hero, social proof, how-it-works, features, testimonials, comparison, and CTA sections
* Full authentication flow (Email OTP + Google OAuth)
* Dashboard with performance summary, stat cards, spaces list, and activity feed
* Spaces management with My Spaces / Joined tabs
* Space detail pages with goal items, strength banners, and real-time updates
* Profile page with avatar upload, bio, interests, stats grid, and activity summary
* Settings page with push notification management
* Notifications page with real-time alerts
* Admin dashboard with user management, analytics, and reports

## 2. Admin Dashboard (Implemented)

Administrative management dashboard at /admin.

* User management system
* Analytics dashboard
* Reports and moderation

## 3. Push Notification System (Implemented)

Native Web Push notifications for engagement and reminders.

* Works even when the browser tab is closed or phone is locked
* Delivers strength notifications and goal reminders
* Service worker handles push display and click routing

## 4. PWA Install Prompt (Implemented)

Prompts mobile users to install the app.

* Android: intercepts beforeinstallprompt, triggers native Chrome install dialog
* iOS: step-by-step Add to Home Screen guide with Safari share instructions
* Dismisses for 7 days via localStorage
* Explains that push notifications require installation (iOS)

---

# Technical Stack

## Frontend

* Next.js 16 (App Router, server/client components)
* TypeScript (strict mode)
* Tailwind CSS v4 with CSS variables
* shadcn/ui components (built on @base-ui/react primitives)
* tw-animate-css for animations
* DM Sans variable font (loaded locally via next/font)

## Backend

* Supabase

Services include:

* Authentication (Email OTP + Google OAuth)
* PostgreSQL Database
* Realtime (for in-app notifications and strength reactions)
* Row Level Security (RLS on all tables)
* Storage (avatar uploads)
* Edge Functions (Deno runtime, for push delivery)
* pg_net (for database webhook HTTP calls)
* pg_cron (for scheduled reminder processing)

## Push Notification Pipeline

```
[Strength sent] -> handle_new_strength() trigger -> INSERT notifications
                                                        |
                                               notify_push_on_insert() trigger
                                                        |
                                               pg_net HTTP POST -> Edge Function: send-push
                                                        |
                                               Web Push API -> Browser -> Service Worker -> Native notification

[Reminder due]  -> pg_cron (every minute) -> process_reminders() -> INSERT notifications -> same pipeline
```

* VAPID JWT signing (ES256) via crypto.subtle in Deno
* RFC 8291 Web Push payload encryption (ECDH + HKDF + AES-128-GCM) natively in Deno
* No npm web-push dependency (doesn't work in Deno)
* Edge Function cleans up expired/gone subscriptions automatically

## Hosting

* Vercel

## Version Control

* GitHub

---

# Mobile Responsiveness

The platform is:

* 100% mobile responsive
* Mobile-first
* Tablet optimized
* Desktop optimized (sidebar nav on md+, bottom nav on mobile)

Primary usage is expected from mobile devices.

---

# Authentication

## Supported Auth

* Email OTP (magic link / one-time password)
* Google Login (OAuth)

Optional future:

* Apple Login

---

# Core Features (Implemented)

## 1. User Onboarding

Users can:

* Create account via Email OTP or Google OAuth
* Setup profile (full name, avatar, bio, interests)
* Upload avatar to Supabase Storage
* Select accountability interests from 10 categories with emoji icons
* View stats (goals created, completion rate, strengths sent/received)

## 2. Accountability Spaces

Users can:

* Create spaces with name, description, and visibility settings
* View spaces in tabbed interface (My Spaces / Joined)
* See owner name on joined space cards in stats row
* Edit space name and description inline via floating dropdown menu
* Delete spaces via floating dropdown menu
* See text-based stats with small icons (members, goals, strength count)

## 3. Accountability Items (Goals)

Inside spaces users can create via 4-step wizard:

* Step 1: Select type (Goal, Habit, Task, Commitment) with colored icon cards
* Step 2: Title (80 char max with counter) and optional description
* Step 3: Frequency (Daily, Weekly, Monthly, One-time) with radio cards
* Step 4: Reminder configuration (toggle, time presets with emoji, day picker with quick-select)

Each item includes:

* Title and description
* Type (goal/habit/task/commitment) with distinct color and icon
* Frequency (daily/weekly/monthly/one_time)
* Reminder schedule (jsonb: enabled, times[], timezone, days[])
* Status tracking
* Inline edit and delete via floating dropdown menu

Statuses:

* Active
* In Progress
* Completed
* Missed
* Paused

## 4. Frequency-Gated Check-ins

Check-in behavior respects goal frequency:

* **Daily**: can check in again the next day (midnight reset)
* **Weekly**: can check in again next week (Monday reset)
* **Monthly**: can check in again next month (1st of month reset)
* **One-time**: marks goal as permanently completed after single check-in

When on cooldown:

* Check-in button replaced with "Checked in" badge + "Next in Xh Ym" countdown
* Pause/Resume button hidden during cooldown period
* Optimistic UI: instant "Done!" feedback before server confirmation

## 5. Accountability Partners

Users can:

* Invite people via shareable link with animated illustration page
* Accept invites with heart burst animation and auto-redirect
* View partner items with avatar initial badges
* Filter items by All / Mine / Partners with count badges

Partners can:

* Accept invite
* Leave spaces
* Send encouragement ("Send Strength")
* Monitor progress

Space owners control visibility and permissions.

## 6. "Send Strength" Feature

Core engagement feature.

Partners can tap "Send Strength" on any goal. The receiver gets:

* **Push notification** (even when app is closed)
* **In-app toast notification** via Supabase Realtime
* **Full-screen lightning effect** with synthesized zap sound (Web Audio API: sawtooth crack + sine rumble + shimmer)
* **Heart burst animation** on the goal card
* **Floating badge**: "[Name] sent you strength!"
* **Strength received flash** with pink pulsing ring on the goal card

The sender sees:

* Loading spinner during send
* Heart burst animation on the card
* "Sent!" state with pink glow shadow
* Toast confirmation: "Strength sent! They'll be notified."

Strength banner on space pages shows actual sender names (1 name, 2 names, or "Name1, Name2, and X others").

## 7. Reminder System

Users can configure reminders per goal:

* Toggle enable/disable
* Preset times: Morning (08:00), Afternoon (14:00), Evening (19:00)
* Day picker: M-S circle buttons
* Auto-detects timezone via Intl.DateTimeFormat
* Saves to accountability_items.reminder_schedule jsonb

Backend processing:

* pg_cron runs process_reminders() every minute
* Checks active items where reminder_schedule->>'enabled' = 'true'
* Respects timezone and day-of-week filters
* Deduplicates: no reminder if one sent in the last hour for same item
* Inserts notification row which triggers the push pipeline

## 8. Push Notification System

Full Web Push implementation:

* Service worker (public/sw.js) for push display and click routing
* Skips showing notification if app window is focused (prevents duplicates)
* Silent SW registration on app load via PushRegistration component
* Notification settings page: enable/disable flow with permission request
* iOS Safari detection: shows "Add to Home Screen" guidance
* VAPID keys for push authentication
* Edge Function (send-push) handles delivery to all user devices
* Expired subscriptions (404/410) cleaned up automatically

## 9. Notification System

### Push Notifications (Web Push)

* Reminder alerts (scheduled via pg_cron)
* Strength received alerts
* Delivered via Supabase Edge Function -> Web Push API

### In-App Notifications (Supabase Realtime)

* Real-time toast notifications via use-realtime-notifications hook
* Strength-received custom DOM event for lightning effect
* Notification list page at /notifications

## 10. Realtime Updates

Uses Supabase Realtime for:

* Strength notifications (INSERT on notifications table)
* Strength reactions on goal cards (INSERT on strengths table per space)
* In-app toast notifications

## 11. Activity Feed

Dashboard shows recent activity:

* Check-in history with item titles
* Performance summary with completion stats
* Stat cards: streak, completion rate, active goals, strengths received

## 12. Privacy & Security

* Supabase Row Level Security (RLS) on all tables
* Users can only manage their own subscriptions, items, and profiles
* Service role key used only server-side for push subscription management
* Space owners control visibility and permissions
* Private by default visibility
* Secure API routes with auth checks

## 13. Inline Editing

Both goal items and space cards support:

* Floating dropdown menu (three-dot button) with Edit and Delete options
* Edit opens inline form with title/description inputs
* Delete with loading state and confirmation via toast
* Dropdown uses @base-ui/react Menu primitives with slide-in animation

---

# Landing Page (Implemented)

Conversion-optimized landing page with:

* Fixed header with backdrop blur
* Hero section: gradient text headline, pill badge, ambient glow blobs, dual CTA, trust signals
* Mock UI preview: three cards showing goals, strength received, and reminders
* Social proof bar: 500+ users, 2400+ goals tracked, 12000+ strengths sent, 89% consistency rate
* How It Works: 3 numbered steps with connecting lines
* Features grid: 6 cards with colored icons and hover lift effects
* Testimonials: 3 cards with star ratings, quotes, and roles
* Comparison: side-by-side "Other apps" vs "HoldMe"
* Final CTA: "Create your free account" with reassurance text
* Footer with navigation links

---

# Profile Page (Implemented)

Rich profile experience with:

* Gradient banner with overlapping avatar (camera upload overlay)
* Inline edit mode for name, bio (160 char limit), and interests
* Stats grid (2x2): goals created, completion rate, strengths received, strengths sent
* Activity summary: spaces owned, spaces joined, total check-ins, months active
* Interests section with emoji + name pills (view mode) or selectable 2-column grid (edit mode)
* Quick links to settings and spaces
* Logout button

---

# Spaces Page (Implemented)

* Clean "Spaces" heading with "New Space" button
* Conditional tabs: My Spaces / Joined shown only when user has both; single-category lists render without tabs
* Staggered card entrance animations (60ms per card)
* Space cards with:
  * Space name with Owner badge (if owned)
  * Owner name in stats row ("by Name") for joined spaces, member count for owned spaces
  * Description (line-clamped)
  * Text-based stats: member count or owner name · goal count · strength count
  * Three-dot dropdown with Edit/Delete (owner only)
  * Subtle hover: background tint + ring

---

# Navigation (Implemented)

## Mobile (bottom nav)

* Home (dashboard)
* Spaces
* Alerts (notifications)
* Profile

## Desktop (side nav)

* HoldMe logo
* Home
* Spaces
* Alerts
* Profile
* Settings (bottom)

---

# Database Schema

## Tables

```
users              - id, email, full_name, avatar_url, bio, interests[], created_at, updated_at
spaces             - id, name, description, owner_id, visibility, created_at, updated_at
space_members      - id, space_id, user_id, role, permissions (jsonb), joined_at
accountability_items - id, space_id, user_id, title, description, type, frequency, status, due_date, reminder_schedule (jsonb), is_visible, created_at, updated_at
item_checkins      - id, item_id, user_id, status, note, proof_url, checked_in_at
strengths          - id, item_id, sender_id, receiver_id, message, created_at
comments           - id, item_id, user_id, content, created_at
notifications      - id, user_id, type, title, body, data (jsonb), read, created_at
invites            - id, space_id, inviter_id, email, token, status, created_at, expires_at
reports            - id, reporter_id, reported_user_id, space_id, reason, status, created_at
push_subscriptions - id, user_id, endpoint, p256dh, auth, user_agent, created_at
```

## Database Triggers & Functions

* `handle_new_strength()` - trigger on strengths INSERT, creates notification with sender_name and item_title
* `notify_push_on_insert()` - trigger on notifications INSERT, calls send-push Edge Function via pg_net
* `process_reminders()` - pg_cron function (every minute), creates reminder notifications for due items

## Migrations

1. `001_initial_schema.sql` - Core tables, RLS policies, indexes
2. `002_fix_rls_recursion.sql` - Fix recursive RLS policy issue
3. `003_add_strength_notification_trigger.sql` - Strength -> notification trigger
4. `004_push_subscriptions.sql` - Push subscriptions table, pg_net extension
5. `005_reminder_system.sql` - pg_cron extension, process_reminders() function
6. `006_push_webhook_trigger.sql` - notifications INSERT -> Edge Function webhook trigger

---

# Edge Functions

## send-push (Deployed, Active)

* `index.ts` - Webhook handler, authenticates via WEBHOOK_SECRET header, fetches subscriptions, sends push
* `webpush.ts` - Orchestrates VAPID auth + payload encryption + fetch
* `vapid.ts` - VAPID JWT creation using crypto.subtle ES256 signing
* `encrypt.ts` - RFC 8291 Web Push payload encryption (ECDH + HKDF + AES-128-GCM)

---

# File Architecture

```
src/
  app/
    (app)/               - Authenticated app routes
      dashboard/         - Dashboard with stats, spaces, activity
      notifications/     - Notification list
      profile/           - Profile with stats, edit, interests
      settings/          - Push notification settings
      spaces/            - Spaces list with tabs
        [id]/            - Space detail with items
          members/       - Member management
        new/             - Create space
      layout.tsx         - App shell with push registration + PWA prompt
    admin/               - Admin dashboard routes
    api/
      invite/            - Invite send and auto-join endpoints
      push/subscribe/    - Push subscription CRUD
    auth/                - Login, signup, callback
    invite/[token]/      - Public invite acceptance page
    page.tsx             - Landing page
    layout.tsx           - Root layout with font, metadata, toaster
  components/
    effects/             - Strength lightning effect
    layout/              - AppShell, TopBar
    push/                - PushRegistration (silent SW registration)
    pwa/                 - PWA install prompt (Android + iOS)
    ui/                  - shadcn components (avatar, badge, button, card, dialog, dropdown-menu, etc.)
  features/
    activity/            - Activity feed
    dashboard/           - Performance summary, stat cards
    items/               - AddItemForm (4-step wizard), ItemList, ReminderSettings
    notifications/       - NotificationList, NotificationSettings
    profile/             - ProfileView
    spaces/              - SpaceCard, SpaceHeader, SpaceTabs, StrengthBanner, InviteButton, MemberList
  hooks/
    use-realtime-notifications.ts - Realtime notification listener + strength-received event dispatch
    use-user.ts
  lib/
    push/                - register-sw.ts, subscribe.ts (VAPID helpers)
    supabase/            - client.ts, server.ts, middleware.ts
    utils.ts
  middleware.ts          - Auth middleware (excludes sw.js)
  types/                 - database.ts, index.ts
public/
  sw.js                  - Service worker (push display, click routing)
  manifest.json          - PWA manifest (HoldMe, standalone, brand theme)
supabase/
  migrations/            - 6 migration files
  functions/send-push/   - Edge Function (4 files)
```

---

# Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL         - Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    - Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY        - Supabase service role key (server-side only)
NEXT_PUBLIC_VAPID_PUBLIC_KEY     - VAPID public key for push subscriptions
```

Edge Function secrets (set via supabase secrets set):

```
VAPID_PRIVATE_KEY                - VAPID private key for JWT signing
VAPID_PUBLIC_KEY                 - VAPID public key
VAPID_SUBJECT                    - mailto: contact for VAPID (mailto:timxdesign@gmail.com)
WEBHOOK_SECRET                   - Shared secret for webhook authentication
```

---

# Security Requirements

* Secure authentication (Supabase Auth with OTP + OAuth)
* Proper authorization (RLS on all 11 tables)
* Supabase RLS enforcement
* Secure API routes (auth check before operations)
* Protected admin routes
* Notification permission management
* Service role key never exposed to client
* Webhook secret for Edge Function authentication
* Push subscription cleanup for expired endpoints

---

# Performance Requirements

* Fast loading (Next.js static + dynamic rendering)
* Optimized mobile experience (mobile-first design)
* Lazy loading where necessary
* Efficient realtime subscriptions (per-space channels)
* Service worker skips push display when app is focused
* Optimistic UI for check-ins and strength sends

---

# Success Metrics

* Daily active users
* Retention rate
* Check-in completion rate
* Invite conversion rate
* Notification engagement rate
* Strengths sent/received ratio
* Push notification opt-in rate

---

# Pending / Remaining Setup

* Set VAPID secrets on Edge Function (requires `supabase login` + `supabase secrets set`)
* Create PWA icon files (public/icon-192.png, public/icon-512.png) referenced in manifest.json
* End-to-end testing of full push notification pipeline

---

# Future Features (Phase 2)

* Native mobile app
* AI accountability assistant
* Weekly consistency reports
* Group challenges
* Voice/video encouragement
* Habit streaks visualization
* Community discovery
* Smart insights
* Calendar integrations
* Apple Login

---

# Product Positioning

HoldMe is not about productivity.

It is about consistency through trusted human support.

The product should emotionally communicate:

"You don't have to stay consistent alone."
