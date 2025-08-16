const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Listing = require('../models/Listing');
const Match = require('../models/Match');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apnaroom', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Match.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@apnaroom.com',
      password: 'admin123',
      gender: 'Male',
      age: 30,
      accountType: 'Both',
      isVerified: true,
      isAdmin: true,
      occupation: 'Administrator'
    });
    await adminUser.save();

    // Create sample users
    const users = [
      {
        fullName: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'password123',
        gender: 'Female',
        age: 26,
        accountType: 'Seeker',
        isVerified: true,
        occupation: 'Software Engineer',
        bio: 'Working professional looking for a peaceful place with good connectivity.',
        preferences: {
          budget: { min: 15000, max: 25000 },
          location: ['Koramangala', 'HSR Layout', 'BTM Layout'],
          roomType: 'Private Room',
          genderPreference: 'Female',
          smoking: 'No',
          drinking: 'Socially',
          pets: 'No',
          foodHabits: 'Vegetarian',
          moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      {
        fullName: 'Rahul Mehta',
        email: 'rahul@example.com',
        password: 'password123',
        gender: 'Male',
        age: 28,
        accountType: 'Lister',
        isVerified: true,
        occupation: 'Marketing Manager',
        bio: 'Friendly landlord with well-maintained properties.'
      },
      {
        fullName: 'Anjali Gupta',
        email: 'anjali@example.com',
        password: 'password123',
        gender: 'Female',
        age: 24,
        accountType: 'Both',
        isVerified: true,
        occupation: 'Designer',
        bio: 'Creative professional, loves cooking and keeping spaces tidy.',
        preferences: {
          budget: { min: 12000, max: 20000 },
          location: ['Whitefield', 'Marathahalli'],
          roomType: 'Shared Room',
          genderPreference: 'Any',
          smoking: 'No',
          drinking: 'No',
          pets: 'Yes',
          foodHabits: 'Non-Vegetarian'
        }
      },
      {
        fullName: 'Arjun Singh',
        email: 'arjun@example.com',
        password: 'password123',
        gender: 'Male',
        age: 29,
        accountType: 'Lister',
        isVerified: true,
        occupation: 'Business Owner',
        bio: 'Property owner with multiple listings in prime locations.'
      },
      {
        fullName: 'Sneha Patel',
        email: 'sneha@example.com',
        password: 'password123',
        gender: 'Female',
        age: 25,
        accountType: 'Seeker',
        isVerified: true,
        occupation: 'Marketing Manager',
        bio: 'Friendly, responsible flatmate. Love cooking and maintaining clean spaces.',
        preferences: {
          budget: { min: 18000, max: 23000 },
          location: ['Whitefield', 'Marathahalli'],
          roomType: 'Private Room',
          genderPreference: 'Female',
          smoking: 'No',
          drinking: 'Socially',
          pets: 'No',
          foodHabits: 'Vegetarian'
        }
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }

    console.log('Created sample users');

    // Create sample listings
    const listings = [
      {
        title: 'Modern 2BHK in Koramangala',
        description: 'Spacious room in a well-maintained apartment with great connectivity to tech parks. The apartment features modern amenities and is located in the heart of Koramangala.',
        propertyType: 'Apartment',
        roomType: 'Private Room',
        furnished: 'Fully Furnished',
        location: {
          address: '123 Main Street, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034',
          coordinates: { latitude: 12.9352, longitude: 77.6245 }
        },
        rent: 25000,
        deposit: 50000,
        maintenanceCharges: 2000,
        amenities: ['WiFi', 'Parking', 'Kitchen', 'AC', 'Washing Machine', 'Security'],
        owner: createdUsers[1]._id, // Rahul
        preferences: {
          gender: 'Female',
          ageRange: { min: 22, max: 30 },
          occupation: ['Software Engineer', 'Designer'],
          smoking: 'No',
          drinking: 'Any',
          pets: 'No',
          foodHabits: 'Any'
        },
        houseRules: 'No smoking inside, guests welcome with prior notice, maintain cleanliness.',
        availableFrom: new Date(),
        images: [
          { url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', isPrimary: true },
          { url: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg', isPrimary: false }
        ]
      },
      {
        title: 'Cozy Studio near Metro',
        description: 'Perfect studio apartment for working professionals with metro connectivity. Fully furnished with all modern amenities.',
        propertyType: 'Apartment',
        roomType: 'Studio',
        furnished: 'Fully Furnished',
        location: {
          address: '456 HSR Layout, Sector 2',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560102',
          coordinates: { latitude: 12.9116, longitude: 77.6473 }
        },
        rent: 22000,
        deposit: 44000,
        maintenanceCharges: 1500,
        amenities: ['WiFi', 'Kitchen', 'AC', 'Metro Access', 'Security'],
        owner: createdUsers[2]._id, // Anjali
        preferences: {
          gender: 'Any',
          ageRange: { min: 23, max: 35 },
          smoking: 'No',
          drinking: 'Any',
          pets: 'No'
        },
        houseRules: 'Working professionals preferred, no parties, maintain cleanliness.',
        availableFrom: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        images: [
          { url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg', isPrimary: true }
        ]
      },
      {
        title: 'Shared Room in Whitefield',
        description: 'Great shared accommodation in gated community with all amenities. Perfect for young professionals.',
        propertyType: 'Apartment',
        roomType: 'Shared Room',
        furnished: 'Semi Furnished',
        location: {
          address: '789 Whitefield Main Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560066',
          coordinates: { latitude: 12.9698, longitude: 77.7500 }
        },
        rent: 15000,
        deposit: 30000,
        maintenanceCharges: 1000,
        amenities: ['WiFi', 'Kitchen', 'Gym', 'Swimming Pool', 'Security'],
        owner: createdUsers[3]._id, // Arjun
        preferences: {
          gender: 'Male',
          ageRange: { min: 22, max: 28 },
          smoking: 'Any',
          drinking: 'Any',
          pets: 'No'
        },
        houseRules: 'Shared responsibilities, respect roommate privacy, no loud music after 10 PM.',
        availableFrom: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        images: [
          { url: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg', isPrimary: true }
        ]
      },
      {
        title: 'Luxury 1BHK in BTM Layout',
        description: 'Premium 1BHK apartment with modern furnishing and excellent connectivity.',
        propertyType: 'Apartment',
        roomType: '1 BHK',
        furnished: 'Fully Furnished',
        location: {
          address: '321 BTM Layout, Stage 2',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560076',
          coordinates: { latitude: 12.9165, longitude: 77.6101 }
        },
        rent: 28000,
        deposit: 56000,
        maintenanceCharges: 2500,
        amenities: ['WiFi', 'Parking', 'Kitchen', 'AC', 'Balcony', 'Security', 'Elevator'],
        owner: createdUsers[1]._id, // Rahul
        preferences: {
          gender: 'Any',
          ageRange: { min: 25, max: 35 },
          occupation: ['Software Engineer', 'Manager'],
          smoking: 'No',
          drinking: 'Any',
          pets: 'Yes'
        },
        houseRules: 'Professional tenants preferred, no smoking, pets allowed with deposit.',
        availableFrom: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        images: [
          { url: 'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg', isPrimary: true }
        ]
      }
    ];

    const createdListings = [];
    for (const listingData of listings) {
      const listing = new Listing(listingData);
      await listing.save();
      createdListings.push(listing);
    }

    console.log('Created sample listings');

    // Create sample matches
    const seekers = createdUsers.filter(user => 
      user.accountType === 'Seeker' || user.accountType === 'Both'
    );

    for (const seeker of seekers) {
      for (const listing of createdListings) {
        // Skip if seeker is the owner
        if (seeker._id.toString() === listing.owner.toString()) continue;

        const compatibility = Match.calculateCompatibility(seeker, listing);
        
        if (compatibility.totalScore >= 70) {
          const match = new Match({
            seeker: seeker._id,
            lister: listing.owner,
            listing: listing._id,
            compatibilityScore: compatibility.totalScore,
            compatibilityFactors: compatibility.factors
          });

          // Randomly set some interests
          if (Math.random() > 0.5) {
            match.seekerInterested = Math.random() > 0.3;
          }
          if (Math.random() > 0.7) {
            match.listerInterested = Math.random() > 0.4;
          }

          // Update status based on interests
          if (match.seekerInterested === true && match.listerInterested === true) {
            match.status = 'Matched';
          } else if (match.seekerInterested === false || match.listerInterested === false) {
            match.status = 'Not Interested';
          } else if (match.seekerInterested === true || match.listerInterested === true) {
            match.status = 'Interested';
          }

          await match.save();
        }
      }
    }

    console.log('Created sample matches');

    // Add some applications to listings
    for (const listing of createdListings.slice(0, 2)) {
      const applicants = seekers.filter(seeker => 
        seeker._id.toString() !== listing.owner.toString()
      ).slice(0, 2);

      for (const applicant of applicants) {
        listing.applications.push({
          applicant: applicant._id,
          message: `Hi, I'm interested in your listing. I'm a ${applicant.occupation} and would be a responsible tenant.`,
          status: Math.random() > 0.5 ? 'Pending' : 'Accepted'
        });
      }

      await listing.save();
    }

    console.log('Added sample applications');

    console.log('Data seeding completed successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@apnaroom.com / admin123');
    console.log('Users: priya@example.com, rahul@example.com, anjali@example.com, arjun@example.com, sneha@example.com');
    console.log('Password for all users: password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedData();