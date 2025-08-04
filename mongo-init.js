// MongoDB initialization script
print('Starting database initialization...');

// Switch to the mindbridge database
db = db.getSiblingDB('mindbridge-nigeria');

// Create collections with proper indexes
print('Creating collections and indexes...');

// Users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ userType: 1 });
db.users.createIndex({ state: 1, city: 1 });
db.users.createIndex({ createdAt: 1 });

// Therapists collection
db.createCollection('therapists');
db.therapists.createIndex({ userId: 1 }, { unique: true });
db.therapists.createIndex({ specialization: 1 });
db.therapists.createIndex({ state: 1, city: 1 });
db.therapists.createIndex({ verificationStatus: 1 });
db.therapists.createIndex({ rating: -1 });
db.therapists.createIndex({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

// Sessions collection
db.createCollection('sessions');
db.sessions.createIndex({ patientId: 1 });
db.sessions.createIndex({ therapistId: 1 });
db.sessions.createIndex({ scheduledAt: 1 });
db.sessions.createIndex({ status: 1 });
db.sessions.createIndex({ createdAt: 1 });

// Messages collection
db.createCollection('messages');
db.messages.createIndex({ senderId: 1, recipientId: 1 });
db.messages.createIndex({ sessionId: 1 });
db.messages.createIndex({ createdAt: 1 });

// Mood entries collection
db.createCollection('mood_entries');
db.mood_entries.createIndex({ userId: 1 });
db.mood_entries.createIndex({ date: 1 });
db.mood_entries.createIndex({ createdAt: 1 });

// Support groups collection
db.createCollection('support_groups');
db.support_groups.createIndex({ category: 1 });
db.support_groups.createIndex({ isActive: 1 });

// Payments collection
db.createCollection('payments');
db.payments.createIndex({ userId: 1 });
db.payments.createIndex({ sessionId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: 1 });

print('Database initialization completed successfully.');
print('Collections created with appropriate indexes.');

// Insert some sample data for development/testing
if (db.getName() === 'mindbridge-nigeria') {
    print('Inserting sample data...');

    // Sample Nigerian states
    const nigerianStates = [
        'Lagos', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Anambra', 'Plateau', 'Enugu',
        'Abia', 'Adamawa', 'Akwa Ibom', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'FCT - Abuja', 'Gombe',
        'Imo', 'Jigawa', 'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Ogun',
        'Ondo', 'Osun', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ];

    // Create a system admin user (for development)
    const adminUser = {
        email: 'admin@mindbridge.ng',
        firstName: 'System',
        lastName: 'Administrator',
        userType: 'admin',
        state: 'FCT - Abuja',
        city: 'Abuja',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        db.users.insertOne(adminUser);
        print('Sample admin user created.');
    } catch (e) {
        print('Admin user already exists or error occurred:', e.message);
    }

    print('Sample data insertion completed.');
}
