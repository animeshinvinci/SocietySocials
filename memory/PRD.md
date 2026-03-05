# SocietySocials - Product Requirements Document

## Original Problem Statement
Build SocietySocials - an anonymous social platform for residents of apartment societies. Users authenticate via mobile number, select their residential society, and receive a persistent anonymous persona. They can create posts (text, question, poll), react to others' posts, comment, and vote — all without revealing their real identity.

## User Personas
- **Residents**: Default users who can read, post, react, comment, vote, and report
- **Admins (RWA)**: Can pin posts, remove content, create announcements (Phase 2)

## Core Requirements (Static)
- Mobile-first responsive web app
- Anonymous persona generation (Adjective + Noun + Number)
- Society selection from seeded list (10 Bengaluru societies)
- 3 Post types: Discussion, Question, Poll
- 3 Reactions: Agree, Interesting, Me Too
- Flat comments on posts
- Poll voting with creator-controlled visibility
- Report system with auto-moderation

## What's Been Implemented (MVP - January 2026)

### Backend (FastAPI + MongoDB)
- ✅ User authentication via mobile number (Phase 1 - no OTP)
- ✅ Persona generation with 100 adjectives × 100 nouns
- ✅ 10 seeded Bengaluru societies
- ✅ Posts CRUD (Discussion, Question, Poll)
- ✅ Reactions (Agree, Interesting, Me Too)
- ✅ Comments system
- ✅ Poll voting with real-time/on-close visibility
- ✅ Report system with auto-hide thresholds

### Frontend (React + Tailwind)
- ✅ Splash screen with branding
- ✅ Phone entry screen
- ✅ Society selection with search
- ✅ Persona reveal animation
- ✅ Feed with Latest/Popular sorting
- ✅ Create post sheet (3 post types)
- ✅ Post detail with reactions & comments
- ✅ Poll voting UI
- ✅ Profile screen with post history
- ✅ Report sheet
- ✅ Bottom navigation

### Design
- ✅ Dark sleek theme ("Midnight Society")
- ✅ Glassmorphism effects
- ✅ Framer Motion animations
- ✅ Mobile-first responsive

## Prioritized Backlog

### P0 (Critical - Before Launch)
- None remaining for MVP

### P1 (High Priority - Phase 2)
- OTP verification via Twilio/MSG91
- Push notifications for replies/reactions
- Admin dashboard
- AI-assisted moderation

### P2 (Medium Priority)
- Image posts
- Event announcements
- Threaded comments
- Search posts within society

### P3 (Low Priority)
- Society addition request flow
- Aggregate analytics for RWA
- Expanded reaction set

## Next Action Items
1. Add OTP verification for Phase 2
2. Implement push notifications
3. Build admin moderation dashboard
4. Add image upload support for posts
