// Test script to verify ML integration
import fetch from 'node-fetch';

async function testMLIntegration() {
  console.log('🧪 Testing ML Integration...\n');

  // Test 1: Check if backend server is running
  try {
    console.log('1. Testing backend server connection...');
    const response = await fetch('http://localhost:3001/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: 'Clicks',
        company: 'TestCorp',
        campaign_type: 'Email',
        channel: 'Social',
        target_audience: 'General',
        location: 'Global',
        language: 'English',
        customer_segment: 'All'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend server is running');
      console.log('📊 Prediction result:', {
        metric: data.metric,
        prediction: data.prediction?.toFixed(2),
        confidence: (data.confidence * 100)?.toFixed(1) + '%',
        models_used: data.models_used
      });
    } else {
      console.log('❌ Backend server error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Backend server not running:', error.message);
    console.log('💡 Please start the backend server with: cd backend && node server.js');
    return;
  }

  // Test 2: Test query endpoint
  try {
    console.log('\n2. Testing query endpoint...');
    const response = await fetch('http://localhost:3001/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What is the average ROI by channel?'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Query endpoint is working');
      console.log('📊 Query result type:', Array.isArray(data.result) ? 'Array' : typeof data.result);
    } else {
      console.log('❌ Query endpoint error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Query endpoint error:', error.message);
  }

  // Test 3: Test model performance endpoint
  try {
    console.log('\n3. Testing model performance endpoint...');
    const response = await fetch('http://localhost:3001/api/models/performance');

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Model performance endpoint is working');
      console.log('📊 Available models:', Object.keys(data));
    } else {
      console.log('❌ Model performance endpoint error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Model performance endpoint error:', error.message);
  }

  // Test 4: Test feature importance endpoint
  try {
    console.log('\n4. Testing feature importance endpoint...');
    const response = await fetch('http://localhost:3001/api/models/features/clicks');

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Feature importance endpoint is working');
      console.log('📊 Number of features:', data.length);
    } else {
      console.log('❌ Feature importance endpoint error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Feature importance endpoint error:', error.message);
  }

  console.log('\n🎉 ML Integration test completed!');
  console.log('\n💡 To start the frontend, run: npm run dev');
}

testMLIntegration().catch(console.error);
