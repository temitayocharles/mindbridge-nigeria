import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const state = searchParams.get('state')
        const specialization = searchParams.get('specialization')
        const search = searchParams.get('search')
        const lat = searchParams.get('lat')
        const lng = searchParams.get('lng')
        const radius = parseInt(searchParams.get('radius') || '50') // km

        let filteredTherapists = mockTherapists

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

        // Search by name or bio
        if (search) {
            filteredTherapists = filteredTherapists.filter(t =>
                t.name.toLowerCase().includes(search.toLowerCase()) ||
                t.bio.toLowerCase().includes(search.toLowerCase())
            )
        }

        // TODO: Implement geolocation filtering
        if (lat && lng) {
            // Calculate distance and filter by radius
            // Implementation would use the calculateDistance function from utils
        }

        // Sort by rating (highest first)
        filteredTherapists.sort((a, b) => b.rating - a.rating)

        return NextResponse.json({
            therapists: filteredTherapists,
            total: filteredTherapists.length
        })

    } catch (error) {
        console.error('Therapists fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
