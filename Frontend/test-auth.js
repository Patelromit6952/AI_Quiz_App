// Simple test to verify authentication flow
console.log('🧪 Testing Authentication Flow...');

// Test 1: Check if localStorage is available
if (typeof localStorage !== 'undefined') {
    console.log('✅ localStorage is available');
} else {
    console.log('❌ localStorage is not available');
}

// Test 2: Check if fetch is available
if (typeof fetch !== 'undefined') {
    console.log('✅ fetch is available');
} else {
    console.log('❌ fetch is not available');
}

// Test 3: Check if we can make a request to the backend
async function testBackendConnection() {
    try {
        const response = await fetch('http://localhost:8000/api/health');
        const data = await response.json();
        console.log('✅ Backend connection successful:', data);
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
    }
}

// Test 4: Check if we can make a login request
async function testLoginRequest() {
    try {
        const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword'
            })
        });
        const data = await response.json();
        console.log('✅ Login request successful (expected to fail with invalid credentials):', data);
    } catch (error) {
        console.log('❌ Login request failed:', error.message);
    }
}

// Run tests
testBackendConnection();
testLoginRequest();

console.log('🔍 Check the browser console for authentication debugging information');
