# MindBridge Nigeria 🧠

A comprehensive mental health application connecting patients with licensed therapists across Nigeria. Built with cutting-edge technology to make mental healthcare accessible, affordable, and effective.

## 🌟 Features

### Core Features
- **🔐 Authentication System**: Separate registration flows for patients and therapists
- **📍 Geolocation Matching**: Find therapists by Nigerian states and cities
- **📹 Video Calling**: WebRTC-powered secure video sessions
- **💬 Real-time Chat**: Instant messaging between patients and therapists
- **🤖 AI Chatbot**: 24/7 initial screening and crisis support
- **👥 Support Groups**: Anonymous group therapy sessions
- **📊 Mood Tracking**: Visual mood analytics and progress tracking
- **💳 Payment Integration**: Secure payments in Nigerian Naira (₦)

### Advanced Features
- **🎯 Smart Matching Algorithm**: AI-powered therapist-patient matching
- **🔊 Voice Sentiment Analysis**: Real-time emotion detection during sessions
- **📱 Progressive Web App**: Works offline and installable on mobile
- **🌙 Dark Mode**: Modern glassmorphism UI with glowing effects
- **🔒 End-to-End Encryption**: HIPAA-compliant secure communications
- **📈 Analytics Dashboard**: Comprehensive progress tracking for patients
- **🚨 Emergency Support**: Crisis intervention and emergency contacts

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon library

### Backend
- **Next.js API Routes** - Server-side API
- **MongoDB** - NoSQL database
- **NextAuth.js** - Authentication
- **Socket.io** - Real-time communication

### Third-party Services
- **Stripe/Paystack** - Payment processing
- **Cloudinary** - Media storage
- **Twilio** - SMS notifications
- **OpenAI** - AI chatbot functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindbridge-nigeria.git
   cd mindbridge-nigeria
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mindbridge-nigeria
   NEXTAUTH_SECRET=your-secret-key
   STRIPE_SECRET_KEY=your-stripe-key
   # ... other variables
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
mindbridge-nigeria/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # User dashboard
│   │   ├── register/          # Registration page
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── AIChatbot.tsx     # AI assistant
│   │   ├── MoodTracker.tsx   # Mood tracking
│   │   └── VideoCall.tsx     # Video calling
│   └── lib/                   # Utility functions
│       ├── database.ts        # Database connection
│       └── utils.ts          # Helper functions
├── public/                    # Static assets
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Secondary**: Purple gradient (#8B5CF6 to #EC4899)
- **Background**: Dark slate with gradient overlays
- **Text**: White with glowing effects

### Typography
- **Font**: System fonts with fallbacks
- **Headings**: Bold with glow effects
- **Body**: Regular weight for readability

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session

### Therapists
- `GET /api/therapists` - List available therapists
- `GET /api/therapists/[id]` - Get therapist details
- `POST /api/therapists/book` - Book a session

### Sessions
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/[id]` - Update session

## 🌍 Nigerian Context

### Geographic Coverage
- All 36 Nigerian states plus FCT Abuja
- Major cities in each state
- Geolocation-based therapist matching

### Payment Methods
- Nigerian Naira (₦) currency
- Paystack integration for local payments
- Bank transfer options
- Mobile money support

### Cultural Considerations
- Culturally sensitive mental health approaches
- Multi-language support (English, Hausa, Igbo, Yoruba)
- Local mental health practices integration

## 🔒 Security & Privacy

- **Data Encryption**: End-to-end encryption for all communications
- **HIPAA Compliance**: Medical data protection standards
- **Secure Authentication**: JWT-based session management
- **Privacy Controls**: Granular privacy settings for users
- **Data Retention**: Compliant data retention policies

## 📱 Mobile Experience

- **Responsive Design**: Works on all device sizes
- **PWA Support**: Installable as mobile app
- **Offline Functionality**: Basic features work offline
- **Push Notifications**: Session reminders and updates

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@mindbridge.ng
- 🔗 Website: https://mindbridge.ng
- 📱 Emergency: +234 806 210 6493 (Nigeria Suicide Prevention Initiative)

## 🙏 Acknowledgments

- Nigerian mental health professionals
- Open source community
- Mental health advocates
- Technology partners

---

**Making mental healthcare accessible to every Nigerian, one connection at a time.** 🇳🇬
