// MongoDB Initialization Script for MindBridge Nigeria
// This script creates the initial database structure and indexes

print('🚀 Initializing MindBridge Nigeria Database...');

// Switch to the application database
db = db.getSiblingDB('mindbridge');

// Create application user
db.createUser({
  user: 'mindbridge_app',
  pwd: 'secure_app_password_123',
  roles: [
    { role: 'readWrite', db: 'mindbridge' },
    { role: 'dbAdmin', db: 'mindbridge' }
  ]
});

print('✅ Created application user');

// ======================== Users Collection ========================
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'firstName', 'lastName', 'hashedPassword', 'createdAt'],
      properties: {
        email: { bsonType: 'string', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
        firstName: { bsonType: 'string', minLength: 1, maxLength: 50 },
        lastName: { bsonType: 'string', minLength: 1, maxLength: 50 },
        hashedPassword: { bsonType: 'string', minLength: 60 },
        role: { enum: ['patient', 'therapist', 'admin'] },
        verified: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ verified: 1 });
db.users.createIndex({ createdAt: -1 });

print('✅ Created users collection with validation and indexes');

// ======================== Therapists Collection ========================
db.createCollection('therapists', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'specialization', 'experience', 'hourlyRate', 'verified'],
      properties: {
        userId: { bsonType: 'objectId' },
        specialization: { bsonType: 'string', minLength: 1 },
        experience: { bsonType: 'int', minimum: 0, maximum: 50 },
        hourlyRate: { bsonType: 'int', minimum: 0 },
        bio: { bsonType: 'string', maxLength: 1000 },
        qualifications: { bsonType: 'array', items: { bsonType: 'string' } },
        languages: { bsonType: 'array', items: { bsonType: 'string' } },
        state: { bsonType: 'string' },
        city: { bsonType: 'string' },
        verified: { bsonType: 'bool' },
        rating: { bsonType: 'double', minimum: 0, maximum: 5 },
        completedSessions: { bsonType: 'int', minimum: 0 }
      }
    }
  }
});

// Create indexes for therapists
db.therapists.createIndex({ userId: 1 }, { unique: true });
db.therapists.createIndex({ specialization: 1 });
db.therapists.createIndex({ state: 1, city: 1 });
db.therapists.createIndex({ verified: 1 });
db.therapists.createIndex({ rating: -1 });
db.therapists.createIndex({ hourlyRate: 1 });

print('✅ Created therapists collection with validation and indexes');

// ======================== Sessions Collection ========================
db.createCollection('sessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['patientId', 'therapistId', 'scheduledDate', 'status', 'createdAt'],
      properties: {
        patientId: { bsonType: 'objectId' },
        therapistId: { bsonType: 'objectId' },
        scheduledDate: { bsonType: 'date' },
        duration: { bsonType: 'int', minimum: 30, maximum: 120 },
        status: { enum: ['scheduled', 'completed', 'cancelled', 'no-show'] },
        amount: { bsonType: 'int', minimum: 0 },
        paymentStatus: { enum: ['pending', 'paid', 'refunded'] },
        notes: { bsonType: 'string', maxLength: 2000 },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for sessions
db.sessions.createIndex({ patientId: 1 });
db.sessions.createIndex({ therapistId: 1 });
db.sessions.createIndex({ scheduledDate: 1 });
db.sessions.createIndex({ status: 1 });
db.sessions.createIndex({ createdAt: -1 });

print('✅ Created sessions collection with validation and indexes');

// ======================== Messages Collection ========================
db.createCollection('messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['senderId', 'receiverId', 'content', 'createdAt'],
      properties: {
        senderId: { bsonType: 'objectId' },
        receiverId: { bsonType: 'objectId' },
        sessionId: { bsonType: 'objectId' },
        content: { bsonType: 'string', minLength: 1, maxLength: 5000 },
        type: { enum: ['text', 'file', 'image', 'system'] },
        read: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for messages
db.messages.createIndex({ senderId: 1, receiverId: 1 });
db.messages.createIndex({ sessionId: 1 });
db.messages.createIndex({ createdAt: -1 });
db.messages.createIndex({ read: 1 });

print('✅ Created messages collection with validation and indexes');

// ======================== Audit Logs Collection ========================
db.createCollection('audit_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'action', 'resource', 'timestamp'],
      properties: {
        userId: { bsonType: 'objectId' },
        action: { bsonType: 'string' },
        resource: { bsonType: 'string' },
        resourceId: { bsonType: 'objectId' },
        ipAddress: { bsonType: 'string' },
        userAgent: { bsonType: 'string' },
        timestamp: { bsonType: 'date' },
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Create indexes for audit logs
db.audit_logs.createIndex({ userId: 1 });
db.audit_logs.createIndex({ action: 1 });
db.audit_logs.createIndex({ resource: 1 });
db.audit_logs.createIndex({ timestamp: -1 });

print('✅ Created audit_logs collection with validation and indexes');

// ======================== Sample Data ========================
// Insert sample therapists data
const sampleTherapists = [
  {
    userId: new ObjectId(),
    email: 'adaora.okafor@mindbridge.ng',
    name: 'Dr. Adaora Okafor',
    specialization: 'Anxiety & Depression',
    experience: 8,
    state: 'Lagos',
    city: 'Ikeja',
    rating: 4.9,
    completedSessions: 150,
    hourlyRate: 15000,
    bio: 'Experienced clinical psychologist specializing in anxiety disorders and cognitive behavioral therapy.',
    qualifications: ['PhD Clinical Psychology', 'Licensed Therapist (Nigeria)', 'CBT Certified'],
    languages: ['English', 'Igbo', 'Yoruba'],
    verified: true,
    coordinates: { lat: 6.5244, lng: 3.3792 }
  },
  {
    userId: new ObjectId(),
    email: 'emeka.johnson@mindbridge.ng',
    name: 'Dr. Emeka Johnson',
    specialization: 'Trauma & PTSD',
    experience: 12,
    state: 'FCT - Abuja',
    city: 'Garki',
    rating: 4.8,
    completedSessions: 200,
    hourlyRate: 18000,
    bio: 'Trauma specialist with extensive experience in PTSD treatment and recovery.',
    qualifications: ['MD Psychiatry', 'PTSD Specialist', 'Trauma-Informed Care Certified'],
    languages: ['English', 'Hausa'],
    verified: true,
    coordinates: { lat: 9.0765, lng: 7.3986 }
  }
];

db.therapists.insertMany(sampleTherapists);
print('✅ Inserted sample therapist data');

// Create compound indexes for complex queries
db.therapists.createIndex({ 
  state: 1, 
  specialization: 1, 
  verified: 1, 
  rating: -1 
});

db.sessions.createIndex({ 
  therapistId: 1, 
  scheduledDate: 1, 
  status: 1 
});

print('✅ Created compound indexes for performance optimization');

print('🎉 MindBridge Nigeria Database initialization completed successfully!');
print('📊 Collections created:', db.getCollectionNames().length);
print('🔍 Total indexes created:', 
  db.users.getIndexes().length + 
  db.therapists.getIndexes().length + 
  db.sessions.getIndexes().length + 
  db.messages.getIndexes().length + 
  db.audit_logs.getIndexes().length
);
