// test-db-connection.js
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import your existing models
const Delivery = require('./src/models/Delivery'); // Adjust path if needed

async function testDatabaseConnection() {
  try {
    // Connect to the database
    await connectDB();
    console.log('✅ Database connection successful');
    
    // Test 1: Check if Delivery model exists and can be queried
    console.log('\n📋 TESTING DELIVERY MODEL:');
    
    // Count existing deliveries
    const deliveryCount = await Delivery.countDocuments();
    console.log('- Found ${deliveryCount} existing deliveries in the database');
    
    // List first 5 deliveries if any exist
    if (deliveryCount > 0) {
      const sampleDeliveries = await Delivery.find().limit(5);
      console.log('- Sample delivery IDs:');
      sampleDeliveries.forEach(delivery => {
        console.log(`  • ${delivery._id} (Status: ${delivery.status || 'unknown'})`);
      });
      
      // Test detailed info for the first delivery
      if (sampleDeliveries.length > 0) {
        const firstDelivery = sampleDeliveries[0];
        console.log('\n📦 SAMPLE DELIVERY DETAILS:');
        console.log('- ID:', firstDelivery._id);
        console.log('- Order ID:', firstDelivery.orderId);
        console.log('- Status:', firstDelivery.status);
        console.log('- Restaurant ID:', firstDelivery.restaurantId);
        console.log('- Driver ID:', firstDelivery.driverId);
        console.log('- Customer Location:', firstDelivery.customerLocation);
        console.log('- Restaurant Location:', firstDelivery.restaurantLocation);
        console.log('- Driver Location:', firstDelivery.driverLocation);
        
        // Test if this delivery is retrievable by ID
        console.log('\n🔍 TESTING ID LOOKUP:');
        const foundDelivery = await Delivery.findById(firstDelivery._id);
        
        if (foundDelivery) {
          console.log('✅ Successfully found delivery by ID: ${firstDelivery._id}');
        } else {
          console.log('❌ Could not find delivery by ID: ${firstDelivery._id}');
        }
      }
    } else {
      console.log('\n📝 CREATING TEST DELIVERY:');
      
      // Create a test delivery
      const testDelivery = new Delivery({
        orderId: 'TEST-ORDER-' + Date.now(),
        restaurantId: 'TEST-RESTAURANT',
        restaurantLocation: {
          type: 'Point',
          coordinates: [76.9558, 11.0168] // Coimbatore coordinates
        },
        customerLocation: {
          type: 'Point',
          coordinates: [76.9629, 11.0238] // Another Coimbatore location
        },
        status: 'pending',
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      });
      
      try {
        // Save the delivery to the database
        const savedDelivery = await testDelivery.save();
        console.log('✅ Test delivery created with ID:', savedDelivery._id);
        console.log('📋 Use this ID to test the DeliveryTracker component');
      } catch (saveError) {
        console.error('❌ Error creating test delivery:', saveError.message);
        console.log('🔍 SCHEMA VALIDATION ERROR DETAILS:');
        if (saveError.errors) {
          Object.keys(saveError.errors).forEach(key => {
            console.log('- ${key}: ${saveError.errors[key].message}');
          });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error(error);
    return false;
  } finally {
    // Close the database connection
    try {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
  }
}

// Run the test
console.log('🔄 STARTING DATABASE CONNECTION TEST');
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ DATABASE TEST COMPLETED SUCCESSFULLY');
    } else {
      console.log('\n❌ DATABASE TEST FAILED');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 UNEXPECTED ERROR:', err);
    process.exit(1);
  });