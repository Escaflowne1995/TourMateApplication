// Test script to check Supabase schema and debug profile saving
// Run this with: node src/test-supabase-schema.js

const { supabase } = require('./services/supabase/supabaseClient');

async function testSupabaseSchema() {
    console.log('=== TESTING SUPABASE SCHEMA ===');
    
    try {
        // Test 1: Check if we can connect to Supabase
        console.log('1. Testing Supabase connection...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.log('   Auth check failed:', authError.message);
            console.log('   This is expected if no user is logged in');
        } else if (user) {
            console.log('   ✅ User authenticated:', user.id);
        } else {
            console.log('   No user currently authenticated');
        }
        
        // Test 2: Check profiles table structure
        console.log('\n2. Testing profiles table structure...');
        
        // Try to select from profiles table to see what columns exist
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
            
        if (error) {
            console.log('   ❌ Error querying profiles table:', error.message);
            
            if (error.message.includes('relation "profiles" does not exist')) {
                console.log('   🔧 FIX NEEDED: Run the migration SQL in your Supabase dashboard!');
            }
        } else {
            console.log('   ✅ Profiles table exists');
            
            if (data && data.length > 0) {
                console.log('   📄 Sample row structure:', Object.keys(data[0]));
            } else {
                console.log('   📄 Table is empty, but structure should be good');
            }
        }
        
        // Test 3: Try a test insert to see what columns are missing
        console.log('\n3. Testing required columns...');
        
        const testData = {
            id: '00000000-0000-0000-0000-000000000000', // Fake UUID for test
            name: 'Test',
            full_name: 'Test User',
            phone: '1234567890',
            location: 'Test City',
            avatar_url: 'test.jpg',
            birth_date: '1990-01-01',
            gender: 'Test',
            country: 'Test Country',
            zip_code: '12345'
        };
        
        // We won't actually insert, just test the structure
        console.log('   Testing with data structure:', Object.keys(testData));
        console.log('   🔧 If save fails, you need to run the migration SQL script!');
        
    } catch (error) {
        console.error('   ❌ Test failed:', error.message);
    }
    
    console.log('\n=== SCHEMA TEST COMPLETE ===');
    console.log('\nIf you see errors above, please:');
    console.log('1. Go to your Supabase Dashboard → SQL Editor');
    console.log('2. Run the migration script from: src/services/supabase/profile-update-migration.sql');
    console.log('3. Try saving your profile again');
}

// Run the test
testSupabaseSchema().then(() => {
    console.log('\nTest completed. Check the console output above.');
    process.exit(0);
}).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
