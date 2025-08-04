#!/usr/bin/env node

/**
 * Database Setup and Health Check Script
 * Sets up MongoDB with proper collections and test data
 */

const { MongoClient } = require('mongodb');

class DatabaseSetup {
    constructor() {
        this.mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindbridge';
        this.client = null;
        this.db = null;
    }

    async connect() {
        try {
            this.client = new MongoClient(this.mongoUrl, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10000,
            });

            await this.client.connect();
            this.db = this.client.db();
            console.log('✅ Connected to MongoDB');
            return true;
        } catch (error) {
            console.log('❌ MongoDB connection failed:', error.message);
            return false;
        }
    }

    async setupCollections() {
        try {
            const collections = ['users', 'therapists', 'sessions', 'messages', 'moodEntries'];

            for (const collectionName of collections) {
                const collection = this.db.collection(collectionName);

                // Create indexes for better performance
                switch (collectionName) {
                    case 'users':
                        await collection.createIndex({ email: 1 }, { unique: true });
                        await collection.createIndex({ createdAt: 1 });
                        break;
                    case 'therapists':
                        await collection.createIndex({ specialization: 1 });
                        await collection.createIndex({ isVerified: 1 });
                        break;
                    case 'sessions':
                        await collection.createIndex({ userId: 1 });
                        await collection.createIndex({ therapistId: 1 });
                        await collection.createIndex({ scheduledAt: 1 });
                        break;
                    case 'messages':
                        await collection.createIndex({ sessionId: 1 });
                        await collection.createIndex({ createdAt: 1 });
                        break;
                    case 'moodEntries':
                        await collection.createIndex({ userId: 1 });
                        await collection.createIndex({ createdAt: 1 });
                        break;
                }

                console.log(`✅ Setup collection: ${collectionName}`);
            }

            return true;
        } catch (error) {
            console.log('❌ Collection setup failed:', error.message);
            return false;
        }
    }

    async seedTestData() {
        try {
            // Sample therapists
            const therapists = [
                {
                    name: 'Dr. Adaora Okafor',
                    email: 'adaora@mindbridge.ng',
                    specialization: 'Clinical Psychology',
                    bio: 'Specialized in anxiety and depression treatment with 10+ years experience.',
                    isVerified: true,
                    rating: 4.8,
                    location: 'Lagos',
                    languages: ['English', 'Igbo'],
                    createdAt: new Date()
                },
                {
                    name: 'Dr. Kemi Adeleke',
                    email: 'kemi@mindbridge.ng',
                    specialization: 'Family Therapy',
                    bio: 'Expert in family counseling and relationship therapy.',
                    isVerified: true,
                    rating: 4.9,
                    location: 'Abuja',
                    languages: ['English', 'Yoruba'],
                    createdAt: new Date()
                },
                {
                    name: 'Dr. Ibrahim Hassan',
                    email: 'ibrahim@mindbridge.ng',
                    specialization: 'Trauma Therapy',
                    bio: 'Specialized in PTSD and trauma recovery.',
                    isVerified: true,
                    rating: 4.7,
                    location: 'Kano',
                    languages: ['English', 'Hausa'],
                    createdAt: new Date()
                }
            ];

            await this.db.collection('therapists').insertMany(therapists);
            console.log('✅ Seeded therapist data');

            // Sample user for testing
            const testUser = {
                name: 'Test User',
                email: 'test@example.com',
                hashedPassword: 'hashed_password_here',
                role: 'user',
                isVerified: true,
                createdAt: new Date()
            };

            await this.db.collection('users').insertOne(testUser);
            console.log('✅ Seeded user data');

            return true;
        } catch (error) {
            console.log('❌ Data seeding failed:', error.message);
            return false;
        }
    }

    async healthCheck() {
        try {
            await this.db.admin().ping();
            const stats = await this.db.stats();

            console.log('📊 Database Health Check:');
            console.log(`   Database: ${stats.db}`);
            console.log(`   Collections: ${stats.collections}`);
            console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);

            return true;
        } catch (error) {
            console.log('❌ Database health check failed:', error.message);
            return false;
        }
    }

    async close() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Database connection closed');
        }
    }

    async run() {
        console.log('🗄️  Starting Database Setup...');

        const connected = await this.connect();
        if (!connected) {
            console.log('⚠️  Skipping database setup - MongoDB not available');
            console.log('💡 To run with database:');
            console.log('   1. Install MongoDB: brew install mongodb/brew/mongodb-community');
            console.log('   2. Start MongoDB: brew services start mongodb/brew/mongodb-community');
            console.log('   3. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
            return false;
        }

        try {
            await this.setupCollections();
            await this.seedTestData();
            await this.healthCheck();

            console.log('✅ Database setup complete!');
            return true;
        } catch (error) {
            console.log('❌ Database setup failed:', error.message);
            return false;
        } finally {
            await this.close();
        }
    }
}

// Run if called directly
if (require.main === module) {
    const dbSetup = new DatabaseSetup();
    dbSetup.run().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = DatabaseSetup;
