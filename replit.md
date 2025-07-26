# Replit.md

## Overview

This is a full-stack chat application built as "Sofeia AI" - an advanced autonomous content agent. The application features a React frontend with shadcn/ui components and an Express.js backend with multiple AI provider integrations (Groq, Perplexity, Anthropic). The system implements a sophisticated C.R.A.F.T framework for content optimization and includes intelligent query routing based on complexity analysis.

## User Preferences

Preferred communication style: Simple, everyday language.
Output format: Properly formatted HTML with real headings (h1, h2, h3), bullets (ul, li), and tables. All AI responses should be ready for direct copy-paste as functional HTML code.

## SEO Strategy & Competitive Positioning

Target Keywords (High Volume, Low Competition):
- Primary: "AI SEO content generator" (3,600/month, low competition)
- Secondary: "free AI content generator" (9,900/month, medium competition) 
- Long-tail: "AI content generator with SEO optimization" (340/month, very low competition)

Competitive Targets: ContentScale (BrandWell) and Brandwell.com
- Position as superior alternative with multi-AI routing
- Emphasize free credits vs expensive monthly subscriptions ($249+)
- Highlight ready-to-use HTML output advantage
- Focus on C.R.A.F.T framework + RankMath SEO integration

SEO Implementation (Updated Jan 26, 2025):
- Comprehensive schema markup (SoftwareApplication, Organization, FAQ, WebSite)
- Optimized meta titles targeting primary keywords
- Enhanced meta descriptions with competitive positioning
- Open Graph and Twitter Card optimization
- Dynamic page titles for legal pages
- Structured data for AI Overview optimization

## Support Channels
- WhatsApp: +31 6 2807 3996 (for direct credit purchases and urgent support)
- Facebook Group: https://www.facebook.com/groups/1079321647257618 (ContentScale Facebook Group for community questions and discussions)

## Admin System
- Admin Key: 0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb
- Admin can add credits to users via POST /api/admin/add-credits
- Admin can view user info via GET /api/admin/user/:email
- See admin-credits-example.md for detailed usage instructions

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Sofeia AI color scheme
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful endpoints for conversations and messages
- **AI Integration**: Multi-provider system with intelligent routing
- **Storage**: Pluggable storage interface (currently in-memory, designed for database expansion)

### Database Strategy
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Conversations and messages tables with JSON metadata fields
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless PostgreSQL

## Key Components

### AI Provider System
The application implements a sophisticated AI routing system that automatically selects the best provider based on query analysis:

- **Groq**: Fast responses for simple queries (basic questions, greetings)
- **Perplexity**: Research-intensive queries requiring live data and citations
- **Anthropic (Claude)**: Complex content generation and detailed analysis

### Query Analysis Engine
- Analyzes incoming queries using pattern matching
- Determines complexity level (simple, complex, research)
- Routes to appropriate AI provider
- Detects target country for SEO optimization

### C.R.A.F.T Framework Implementation (Enhanced with RankMath SEO)
A content optimization system that applies five steps with RankMath SEO principles:
1. **Cut**: Remove unnecessary fluff and improve clarity (RankMath readability optimization)
2. **Review**: Apply RankMath SEO principles - keyword optimization, proper heading structure, meta elements
3. **Add**: Suggest media and visual enhancements (break up text, improve engagement)
4. **Fact-check**: Add verification indicators and citations (E-A-T optimization)
5. **Trust-build**: Include authority signals and credibility markers (conversational "you" language)

**RankMath SEO Integration Features:**
- Focus keyword optimization with 0.5-2.5% density
- Proper heading hierarchy (H1 > H2 > H3) with keyword integration
- Table of contents for content >2000 words
- Internal/external linking opportunities
- Meta description optimization
- Government/academic source verification (.gov/.edu)
- Content scoring for 100/100 RankMath SEO tests

### Storage Architecture
- Interface-based design allowing easy database swapping
- Current in-memory implementation for development
- Designed for PostgreSQL production deployment
- Support for conversation threading and message metadata

## Data Flow

### Message Processing Pipeline
1. User submits message through chat interface
2. Query analyzer determines complexity and target country
3. AI router selects appropriate provider (Groq/Perplexity/Anthropic)
4. For research queries: keyword research and C.R.A.F.T optimization applied
5. AI provider generates response with metadata
6. Response stored with processing steps and citations
7. Real-time updates sent to frontend via query invalidation

### State Management
- React Query handles all server state and caching
- Optimistic updates for immediate UI feedback
- Automatic retry and error handling
- Real-time conversation updates

## External Dependencies

### AI Services
- **Anthropic API**: Claude models for complex content generation
- **Groq API**: Fast inference for simple queries
- **Perplexity API**: Research and citation-heavy responses

### UI Framework
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- Express server with tsx for TypeScript execution
- Environment variables for API keys
- Replit-specific optimizations and error overlays

### Production Build
- Vite builds optimized frontend bundle
- ESBuild compiles server code to single file
- Static file serving integrated into Express
- Environment-based configuration

### Database Setup
- Drizzle migrations for schema deployment
- Environment variable configuration for database URL
- PostgreSQL connection via Neon serverless
- Session storage using connect-pg-simple

### Scalability Considerations
- Stateless backend design for horizontal scaling
- Database connection pooling ready
- API rate limiting considerations for AI providers
- Caching strategy for frequent queries

The architecture emphasizes modularity, type safety, and developer experience while maintaining production readiness for a sophisticated AI-powered chat application.