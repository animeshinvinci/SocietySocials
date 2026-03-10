# SocietySocials - Product Requirements Document

## Original Problem Statement
Build SocietySocials - an anonymous social platform for residents of apartment societies. Users authenticate via mobile number, select their residential society, and receive a persistent anonymous persona.

## User Personas
- **Residents**: Default users who can read, post, react, comment, vote, and report
- **Admins (RWA)**: Can pin posts, remove content, create announcements (Phase 2)

## What's Been Implemented (January 2026)

### Phase 1 MVP
- ✅ Mobile number authentication (no OTP)
- ✅ Anonymous persona generation with edit capability
- ✅ 16 societies (including 4 new: Bren Zahara, SJR Blue Waters, Bren Edgewaters, Oberoi Splendor Mumbai)
- ✅ Test Society for development testing
- ✅ Posts (Discussion, Question, Poll)
- ✅ Reactions, Comments, Poll voting
- ✅ Report system

### New Features (Latest Update)
- ✅ **Request New Society**: Users can submit society requests for admin review
- ✅ **Editable Persona**: Users can edit their persona name with availability check
- ✅ **4 Persona Suggestions**: Alternative names shown on persona reveal
- ✅ **View Demo Society**: Toggle to preview demo content from any society
- ✅ **Post Type Filters**: Filter feed by Discussion/Question/Poll
- ✅ **Society Name Header**: Building name shown at top of feed
- ✅ **Sample Post Tags**: Seeded posts marked as "Sample"
- ✅ **Hide Samples Filter**: Toggle to show only real posts

### Societies List
1. Sobha Dream Acres - Marathahalli, Bengaluru (1200 units)
2. Prestige Shantiniketan - Whitefield, Bengaluru (3000 units)
3. Brigade Orchards - Devanahalli, Bengaluru (1500 units)
4. Godrej Woodsman Estate - Hebbal, Bengaluru (800 units)
5. Embassy Springs - Devanahalli, Bengaluru (2000 units)
6. Mantri Webcity - Hennur, Bengaluru (1100 units)
7. RMZ Galleria - Yelahanka, Bengaluru (600 units)
8. Salarpuria Sattva Divinity - RR Nagar, Bengaluru (900 units)
9. Provident Welworth City - Doddaballapur, Bengaluru (700 units)
10. Purva Panorama - Bannerghatta Road, Bengaluru (1000 units)
11. **Bren Zahara** - Kasavanahalli, Sarjapur Road, Bengaluru (303 units)
12. **SJR Blue Waters** - Harlur Road, Bengaluru (1244 units)
13. **Bren Edgewaters** - Kasavanahalli, Bengaluru (191 units)
14. **Oberoi Splendor** - Andheri East, Mumbai (1296 units)
15. **Test Society** - For development testing (100 units)
16. Demo Society - For previewing app features

## Prioritized Backlog

### P1 (High Priority)
- OTP verification via Twilio
- Admin dashboard for society requests
- Push notifications

### P2 (Medium Priority)
- Image posts
- Threaded comments
- Search posts

## Next Action Items
1. Implement OTP verification
2. Build admin panel for society request approval
3. Add push notifications
