const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection
async function testDatabaseConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz_app');
        console.log('✅ Database connection successful');
        
        // Test basic operations
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📊 Available collections:', collections.map(c => c.name));
        
        await mongoose.connection.close();
        console.log('✅ Database test completed');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

// Test environment variables
function testEnvironmentVariables() {
    const required = [
        'JWT_SECRET',
        'MONGODB_URI'
    ];
    
    const optional = [
        'EMAIL_HOST',
        'EMAIL_USER',
        'EMAIL_PASS',
        'CLIENT_URL'
    ];
    
    console.log('🔧 Checking environment variables...');
    
    required.forEach(varName => {
        if (!process.env[varName]) {
            console.error(`❌ Missing required environment variable: ${varName}`);
            process.exit(1);
        } else {
            console.log(`✅ ${varName}: ${varName === 'JWT_SECRET' ? '***' : process.env[varName]}`);
        }
    });
    
    optional.forEach(varName => {
        if (process.env[varName]) {
            console.log(`✅ ${varName}: ${varName.includes('PASS') ? '***' : process.env[varName]}`);
        } else {
            console.log(`⚠️  ${varName}: Not set (optional)`);
        }
    });
}

// Run tests
async function runTests() {
    console.log('🧪 Running Quiz App Backend Tests...\n');
    
    testEnvironmentVariables();
    console.log('');
    
    await testDatabaseConnection();
    
    console.log('\n✅ All tests passed! Backend is ready to run.');
}

runTests().catch(console.error);
