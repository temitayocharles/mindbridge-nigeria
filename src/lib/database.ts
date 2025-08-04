import { MongoClient, Db, MongoClientOptions } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindbridge-nigeria'
const MONGODB_DB = process.env.MONGODB_DB || 'mindbridge-nigeria'

// Global variable to cache the database connection
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

const mongoClientOptions: MongoClientOptions = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    retryWrites: true, // Enable retryable writes
    retryReads: true, // Enable retryable reads
}

export async function connectToDatabase() {
    // If we have a cached connection, return it
    if (cachedClient && cachedDb) {
        // Test the connection
        try {
            await cachedClient.db('admin').command({ ping: 1 })
            return { client: cachedClient, db: cachedDb }
        } catch (error) {
            console.warn('Cached connection failed, reconnecting...', error)
            cachedClient = null
            cachedDb = null
        }
    }

    try {
        // Create a new MongoDB client
        const client = new MongoClient(MONGODB_URI, mongoClientOptions)

        // Connect to the MongoDB cluster
        await client.connect()

        // Test the connection
        await client.db('admin').command({ ping: 1 })

        // Get the database
        const db = client.db(MONGODB_DB)

        // Cache the connection
        cachedClient = client
        cachedDb = db

        console.log('Connected to MongoDB successfully')

        return { client, db }
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error)
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Graceful shutdown
export async function disconnectFromDatabase() {
    if (cachedClient) {
        await cachedClient.close()
        cachedClient = null
        cachedDb = null
        console.log('Disconnected from MongoDB')
    }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        const { client } = await connectToDatabase()
        await client.db('admin').command({ ping: 1 })
        return true
    } catch (error) {
        console.error('Database health check failed:', error)
        return false
    }
}

// Database schemas and collections
export const collections = {
    users: 'users',
    therapists: 'therapists',
    sessions: 'sessions',
    messages: 'messages',
    appointments: 'appointments',
    payments: 'payments',
    supportGroups: 'support_groups',
    moodEntries: 'mood_entries',
    emergencyContacts: 'emergency_contacts'
}

// User types
export type UserType = 'patient' | 'therapist' | 'admin'

// Database schemas
export interface User {
    _id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    userType: UserType
    state: string
    city: string
    coordinates?: {
        lat: number
        lng: number
    }
    profileImage?: string
    verified: boolean
    createdAt: Date
    updatedAt: Date
    lastLogin?: Date
}

export interface Therapist extends User {
    license: string
    specialization: string[]
    experience: number
    hourlyRate: number // in kobo
    bio: string
    qualifications: string[]
    languages: string[]
    rating: number
    completedSessions: number
    availableSlots: {
        date: string
        time: string
        available: boolean
    }[]
    verificationStatus: 'pending' | 'verified' | 'rejected'
    verificationDocuments?: string[]
}

export interface Session {
    _id?: string
    patientId: string
    therapistId: string
    type: 'video' | 'in-person' | 'phone'
    scheduledAt: Date
    duration: number // in minutes
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
    sessionNotes?: string
    rating?: number
    feedback?: string
    paymentId?: string
    createdAt: Date
    updatedAt: Date
}

export interface Message {
    _id?: string
    senderId: string
    recipientId: string
    sessionId?: string
    content: string
    type: 'text' | 'image' | 'file'
    read: boolean
    createdAt: Date
}

export interface MoodEntry {
    _id?: string
    userId: string
    mood: number // 1-10 scale
    notes?: string
    tags: string[]
    date: Date
    createdAt: Date
}
