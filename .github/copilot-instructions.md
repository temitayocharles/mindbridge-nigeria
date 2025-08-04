# MindBridge Nigeria - Mental Health Application

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
MindBridge Nigeria is a comprehensive mental health application designed to connect patients with licensed therapists across Nigeria. The application features geolocation-based matching, real-time communication, and modern UI/UX with a dark theme.

## Technology Stack
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes with MongoDB
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io for chat and video calls
- **Payments**: Stripe integration for Nigerian payments
- **UI Library**: Custom components with Tailwind CSS and Lucide React icons

## Key Features
1. **User Authentication**: Separate flows for patients and therapists
2. **Geolocation Matching**: Find therapists by Nigerian states and cities
3. **Video Calling**: WebRTC integration for therapy sessions
4. **Chat System**: Real-time messaging between patients and therapists
5. **AI Chatbot**: Initial screening and crisis support
6. **Support Groups**: Anonymous group sessions
7. **Mood Tracking**: Data visualization for patient progress
8. **Payment Integration**: Secure payments in Nigerian Naira (₦)
9. **Admin Dashboard**: Therapist verification and platform management

## Design Guidelines
- **Theme**: Dark theme with glassmorphism effects
- **Colors**: Blue and purple gradients with glowing text effects
- **Animations**: Smooth transitions using Framer Motion
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG 2.1 compliant

## Code Standards
- Use TypeScript for type safety
- Follow Next.js 15 App Router conventions
- Implement proper error handling
- Use Tailwind CSS utility classes
- Create reusable UI components
- Implement proper data validation with Zod
- Use React Hook Form for form management

## Nigerian Context
- Support for all 36 Nigerian states plus FCT
- Currency formatting in Nigerian Naira (₦)
- Local phone number formats (+234)
- Cultural sensitivity in mental health approaches
- Integration with Nigerian payment systems

## Security & Privacy
- End-to-end encryption for sensitive communications
- HIPAA-compliant data handling
- Secure therapist verification process
- Anonymous support group options
- Data protection following Nigerian regulations

When generating code, ensure it follows these patterns and maintains consistency with the existing codebase structure.
