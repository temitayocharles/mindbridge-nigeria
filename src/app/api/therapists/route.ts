import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { safeDbOperation } from '@/lib/database'

// Mock therapist data for Nigeria
const mockTherapists = [
    {
        id: '1',
        name: 'Dr. Adaora Okafor',
        email: 'adaora.okafor@mindbridge.ng',
        specialization: 'Anxiety & Depression',
        experience: 8,
        state: 'Lagos',
        city: 'Ikeja',
        rating: 4.9,
        completedSessions: 150,
        hourlyRate: 15000, // in kobo (₦150)
        bio: 'Experienced clinical psychologist specializing in anxiety disorders and cognitive behavioral therapy.',
        qualifications: ['PhD Clinical Psychology', 'Licensed Therapist (Nigeria)', 'CBT Certified'],
        languages: ['English', 'Igbo', 'Yoruba'],
        availableSlots: [
            { date: '2025-08-05', time: '14:00', available: true },
            { date: '2025-08-05', time: '16:00', available: true },
            { date: '2025-08-06', time: '10:00', available: true },
        ],
        verified: true,
        coordinates: { lat: 6.5244, lng: 3.3792 }
    },
    {
        id: '2',
        name: 'Dr. Emeka Johnson',
        email: 'emeka.johnson@mindbridge.ng',
        specialization: 'Trauma & PTSD',
        experience: 12,
        state: 'FCT - Abuja',
        city: 'Garki',
        rating: 4.8,
        completedSessions: 200,
        hourlyRate: 18000, // in kobo (₦180)
        bio: 'Trauma specialist with extensive experience in PTSD treatment and recovery.',
        qualifications: ['MD Psychiatry', 'PTSD Specialist', 'Trauma-Informed Care Certified'],
        languages: ['English', 'Hausa'],
        availableSlots: [
            { date: '2025-08-06', time: '10:00', available: true },
            { date: '2025-08-06', time: '14:00', available: true },
            { date: '2025-08-07', time: '09:00', available: true },
        ],
        verified: true,
        coordinates: { lat: 9.0765, lng: 7.3986 }
    },
    {
        id: '3',
        name: 'Dr. Fatima Hassan',
        email: 'fatima.hassan@mindbridge.ng',
        specialization: 'Relationship Counseling',
        experience: 6,
        state: 'Kano',
        city: 'Fagge',
        rating: 4.7,
        completedSessions: 120,
        hourlyRate: 12000, // in kobo (₦120)
        bio: 'Relationship counselor focusing on couples therapy and family dynamics.',
        qualifications: ['MSc Counseling Psychology', 'Marriage & Family Therapist'],
        languages: ['English', 'Hausa', 'Arabic'],
        availableSlots: [
            { date: '2025-08-07', time: '11:00', available: true },
            { date: '2025-08-07', time: '15:00', available: true },
            { date: '2025-08-08', time: '13:00', available: true },
        ],
        verified: true,
        coordinates: { lat: 12.0022, lng: 8.5920 }
    },
    {
        id: '4',
        name: 'Dr. Chinedu Okwu',
        email: 'chinedu.okwu@mindbridge.ng',
        specialization: 'Addiction Recovery',
        experience: 10,
        state: 'Rivers',
        city: 'Port Harcourt',
        rating: 4.6,
        completedSessions: 180,
        hourlyRate: 16000, // in kobo (₦160)
        bio: 'Addiction specialist with focus on substance abuse and behavioral addictions.',
        qualifications: ['PhD Psychology', 'Addiction Counselor Certification', 'Group Therapy Licensed'],
        languages: ['English', 'Igbo'],
        availableSlots: [
            { date: '2025-08-05', time: '12:00', available: true },
            { date: '2025-08-06', time: '16:00', available: true },
            { date: '2025-08-08', time: '10:00', available: true },
        ],
        verified: true,
        coordinates: { lat: 4.8156, lng: 7.0498 }
    }
]

async function therapistsHandler(request: NextRequest): Promise<NextResponse> {
    try {
        const searchParams = request.nextUrl.searchParams
        const state = searchParams.get('state')
        const specialization = searchParams.get('specialization')
        const search = searchParams.get('search')
        const lat = searchParams.get('lat')
        const lng = searchParams.get('lng')
        const _radius = parseInt(searchParams.get('radius') || '50') // km - for future geo search

        // Use safe database operation with fallback to mock data
        const dbResult = await safeDbOperation(
            async () => {
                // In future: fetch from actual database
                // const { db } = await connectToDatabase()
                // return await db.collection('therapists').find(query).toArray()
                return mockTherapists
            },
            mockTherapists,
            'fetch therapists'
        )

        let filteredTherapists = dbResult.data

        // Input validation and sanitization
        if (search && search.length > 100) {
            return NextResponse.json(
                { error: 'Search query too long' }, 
                { status: 400 }
            )
        }

        // Filter by state
        if (state) {
            filteredTherapists = filteredTherapists.filter(t => t.state === state)
        }

        // Filter by specialization
        if (specialization) {
            filteredTherapists = filteredTherapists.filter(t =>
                t.specialization.toLowerCase().includes(specialization.toLowerCase())
            )
        }

        // Search by name or bio (with basic sanitization)
        if (search) {
            const sanitizedSearch = search.replace(/[^\w\s]/gi, '').toLowerCase()
            filteredTherapists = filteredTherapists.filter(t =>
                t.name.toLowerCase().includes(sanitizedSearch) ||
                t.bio.toLowerCase().includes(sanitizedSearch)
            )
        }

        // TODO: Implement geolocation filtering
        if (lat && lng) {
            // Calculate distance and filter by radius
            // Implementation would use the calculateDistance function from utils
        }

        // Sort by rating (highest first)
        filteredTherapists.sort((a, b) => b.rating - a.rating)

        const response = {
            therapists: filteredTherapists,
            total: filteredTherapists.length,
            success: dbResult.success,
            ...(dbResult.error && { warning: 'Using cached data due to database issues' })
        }

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': dbResult.success ? 'public, max-age=300' : 'no-cache'
            }
        })

    } catch (error) {
        console.error('Therapists fetch error:', error)
        
        // Graceful degradation - return basic mock data
        return NextResponse.json({
            therapists: mockTherapists.slice(0, 5), // Return first 5 as fallback
            total: 5,
            success: false,
            error: 'Service temporarily unavailable, showing limited results'
        }, { 
            status: 200, // Still return success but with limited data
            headers: {
                'Cache-Control': 'no-cache'
            }
        })
    }
}

// Apply rate limiting: 200 requests per minute for therapist searches (test-friendly)
export const GET = withRateLimit(therapistsHandler, {
    limit: 200,
    windowMs: 60000,
    message: 'Too many therapist search requests'
})
