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
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Set a reasonable timeout for health checks (2 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database check timeout')), 2000);
    });
    
    const healthCheckPromise = (async () => {
      const { client } = await connectToDatabase();
      await client.db('admin').command({ ping: 1 });
    })();
    
    await Promise.race([healthCheckPromise, timeoutPromise]);
    
    const responseTime = Date.now() - startTime;
    return {
      status: 'healthy',
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Database health check failed:', error);
    
    // Determine if this is a timeout or connection error
    const isTimeoutError = error instanceof Error && error.message.includes('timeout');
    const isConnectionError = error instanceof Error && 
      (error.message.includes('ECONNREFUSED') || error.message.includes('connect'));
    
    return {
      status: isTimeoutError || isConnectionError ? 'degraded' : 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

// Graceful database operations with fallback
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string = 'database operation'
): Promise<{ success: boolean; data: T; error?: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.warn(`${operationName} failed, using fallback:`, error);
    return { 
      success: false, 
      data: fallback, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
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
