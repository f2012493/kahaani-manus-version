# Kahaani Clone - Project TODO

## Phase 1: Design & Architecture
- [ ] Design system finalized (colors, typography, spacing)
- [ ] Database schema designed and reviewed
- [ ] API routes and tRPC procedures planned

## Phase 2: Database & Backend
- [ ] Users table with profile information
- [ ] Stories table with metadata
- [ ] Story themes table
- [ ] Orders table for purchases
- [ ] Story content table for generated text
- [ ] Story illustrations table for generated images
- [ ] Database migrations created and applied
- [ ] Que## Phase 2: Backend Procedures & Database
- [x] Database schema with all tables
- [x] tRPC procedures for story creation
- [x] tRPC procedures for story generation
- [x] tRPC procedures for order management
- [x] tRPC procedures for story retrieval and filtering
- [x] Comprehensive backend tests (13 tests passing)

## Phase 3: Frontend UI Components
- [x] Home/Landing page
- [x] Navigation header with auth state
- [x] Authentication pages (handled by Manus OAuth)
- [x] Story creation wizard (multi-step form with validation)
- [x] Child details input component
- [x] Theme selection component
- [x] Story preview with illustrations
- [x] Pricing comparison component
- [x] User dashboard layout
- [x] Stories library with filtering (theme, status, search)
- [x] Gift story creation flow
- [x] Order history page
- [x] Proper error handling and loading states
- [x] useEffect-based navigation (no render-phase redirects)

## Phase 4: AI Features
- [x] Story generation API integration (LLM with structured JSON output)
- [x] Image generation for illustrations (AI image generation)
- [x] Story content generation with child name personalization
- [x] Multi-page story structure with image prompts
- [x] Story personalization with child name
- [x] Theme-specific story templates
- [x] Image prompt generation based on story content

## Phase 5: Story Preview & Pricing
- [x] Free preview system (story preview after generation)
- [x] Digital PDF pricing (₹199)
- [x] Printed book pricing (₹499)
- [x] Feature comparison table
- [x] Purchase flow integration
- [x] Order confirmation and delivery tracking

## Phase 6: Dashboard & Library
- [x] User dashboard with created stories
- [x] Story library with search and filtering (by theme, status, search query)
- [x] Theme-based filtering
- [x] Story editing capability (backend procedure added)
- [x] Story deletion capability (backend procedure added)
- [x] Gift story tracking

## Phase 7: Testing & Optimization
- [x] Unit tests for backend procedures (15 tests passing - includes update/delete)
- [x] Integration tests for story generation
- [x] Story update and delete procedures with tests
- [x] End-to-end testing of story creation flow
- [x] Performance optimization
- [x] Bug fixes and refinements

## Phase 8: Deployment & Delivery
- [x] Final checkpoint creation
- [x] Documentation review
- [x] Platform ready for user testing
- [ ] User delivery and handoff

## New Features - Kid's Image Upload & Integration

### Phase 5.5: Kid's Image Upload
- [x] Add image upload field to story creation wizard
- [x] Store kid's image in S3 storage (via uploadKidImage procedure)
- [x] Update database schema to store kid image URL (kidImageUrl field added)
- [x] Add image preview in story creation form
- [ ] Add image cropping/adjustment UI

### Phase 6.5: Image Integration in Story Illustrations
- [x] Modify image generation prompt to include kid's image reference
- [x] Upload kid's image to S3 for use in image generation (with URL persistence to DB)
- [x] Update illustration generation to include kid's photo in prompts
- [x] Database schema updated with kidImageUrl fields
- [x] Backend procedures for image upload and story generation with kid's image
- [x] Frontend UI for image upload in story creation wizard
- [x] Image preview in story creation form and review step
- [x] Backend tests passing (15 tests)
- [ ] End-to-end testing with actual image generation
