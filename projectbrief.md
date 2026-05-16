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

* Add goals/tasks/habits
* Define reminders/check-in frequency
* Invite accountability partners
* Receive encouragement
* Track progress
* Stay consistent through social support

Example:
A user creates a space called:
“30 Day Discipline Challenge”

Inside the space:

* Wake up at 5AM
* Gym 4x weekly
* Post content daily
* Read 10 pages daily

They invite:

* Friends
* Mentors
* Coaches
* Family
* Accountability partners

Partners can:

* View allowed items
* Send encouragement (“Send Strength”)
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
* Clutter
* Heavy dashboards
* Dark productivity aesthetics

---

# Branding

## Primary Color

#1E96FC

## Secondary Color

#FC851D

## Typeface

DM Sans

---

# Platform Deliverables

## 1. End User Web App

Responsive web application for users.

## 2. Admin Dashboard

Administrative management dashboard.

* User management system
* Dashboard analysis

## 3. Push Notification System

For engagement and reminders.

---

# Technical Stack

## Frontend

* Next.js (App Router)
* TypeScript
* TailwindCSS
* ShadCN UI

## Backend

* Supabase

Services include:

* Authentication
* PostgreSQL Database
* Realtime
* Row Level Security
* Storage
* Edge Functions
* Push Notification Support

## Hosting

* Vercel

## Version Control

* GitHub

---

# Mobile Responsiveness

The platform must be:

* 100% mobile responsive
* Mobile-first
* Tablet optimized
* Desktop optimized

Primary usage is expected from mobile devices.

---

# Authentication

## Supported Auth

* Email OTP
* Google Login

Optional future:

* Apple Login

---

# Core Features

# 1. User Onboarding

Users should be able to:

* Create account
* Setup profile
* Upload avatar
* Add short bio
* Select accountability interests

---

# 2. Accountability Spaces

Users can:

* Create spaces
* Name spaces
* Add descriptions
* Set visibility/privacy
* Invite users

Example:

* Fitness Accountability
* Faith Journey
* Content Challenge
* Study Accountability

---

# 3. Accountability Items

Inside spaces users can create:

* Goals
* Tasks
* Habits
* Commitments

Each item includes:

* Title
* Description
* Frequency
* Reminder schedule
* Due date (if any)
* Progress status

Statuses:

* Active
* In Progress
* Completed
* Missed
* Paused

---

# 4. Accountability Partners

Users can:

* Invite people via email/link
* Remove partners
* Restrict visibility
* Control access permissions

Partners can:

* Accept invite
* Leave spaces
* Send encouragement
* Comment
* Monitor progress

Important:
Space owners control visibility and permissions.

---

# 5. “Send Strength” Feature

Core engagement feature.

Partners can tap:
“Send Strength”

The owner receives:

* Push notification
* In-app notification

Example:
“Tolu sent you strength for ‘Morning Workout’.”

This should feel:

* Emotional
* Supportive
* Encouraging

Not gamified.

---

# 6. Check-In System

Users can:

* Mark complete
* Skip
* Miss
* Update progress

Optional:

* Add short notes
* Upload proof/photos

---

# 7. Notification System

## Push Notifications

Must support:

* Reminder alerts
* Encouragement alerts
* Partner activity
* Missed commitment alerts
* Daily check-ins

Suggested Implementation:

* Firebase Cloud Messaging (FCM)
* Supabase Edge Functions
* Browser Push API

---

# 8. Realtime Updates

Use Supabase realtime for:

* Comments
* Notifications
* Live check-ins
* Activity feed updates

---

# 9. Activity Feed

Users should see activity like:

* “Sarah completed Morning Prayer”
* “James sent strength”
* “You missed Gym Session”

Feed should remain:

* Minimal
* Useful
* Encouraging

---

# 10. Comments & Encouragement

Lightweight interactions only.

Users can:

* Leave encouragement
* Respond
* Motivate

Avoid turning this into:

* A full social media app
* A chat application

---

# 11. Privacy & Security

Critical feature.

Users must be able to:

* Revoke access instantly
* Leave spaces
* Hide specific accountability items
* Control visibility

Supabase Row Level Security (RLS) must be implemented properly.

---

# Admin Dashboard

Admin should manage:

* Users
* Reports
* Spaces
* Notifications
* Moderation
* Abuse reports
* Analytics

---

# Suggested User Flow

## Onboarding Flow

Landing Page →
Sign Up →
Create First Space →
Add First Accountability Item →
Invite Partner →
Enable Notifications

---

# Suggested Navigation

## Mobile Navigation

* Home
* Spaces
* Notifications
* Profile

---

# UX Priorities

The experience should prioritize:

* Emotional connection
* Simplicity
* Fast interactions
* Encouragement
* Retention

The platform should feel:
“Supportive, not stressful.”

---

# Suggested Pages

## Public Website

* Landing Page
* About
* Features
* Pricing (Future)
* Contact

## User App

* Dashboard
* Space Details
* Item Details
* Notifications
* Profile
* Settings

## Admin

* Analytics
* Users
* Reports
* Moderation
* Notifications

---

# Future Features (Phase 2)

* Native mobile app
* AI accountability assistant
* Weekly consistency reports
* Group challenges
* Voice/video encouragement
* Habit streaks
* Community discovery
* Smart insights
* Calendar integrations

---

# Suggested Folder Architecture

```txt
/app
/components
/features
/lib
/hooks
/services
/types
/utils
```

---

# Database Tables

```txt
users
spaces
space_members
accountability_items
item_checkins
strengths
comments
notifications
invites
reports
```

---

# Security Requirements

* Secure authentication
* Proper authorization
* Supabase RLS enforcement
* Secure API routes
* Protected admin routes
* Notification permission management

---

# Performance Requirements

* Fast loading
* Optimized mobile experience
* Lazy loading where necessary
* Efficient realtime subscriptions

---

# Success Metrics

* Daily active users
* Retention rate
* Check-in completion rate
* Invite conversion rate
* Notification engagement rate

---

# Product Positioning

HoldMe is not about productivity.

It is about consistency through trusted human support.

The product should emotionally communicate:

“You don’t have to stay consistent alone.”
