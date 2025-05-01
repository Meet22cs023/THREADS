import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import connectDB from '../db/connectDB.js';

dotenv.config();

// Connect to the database
connectDB();

// Sample user data
const users = [
  {
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Software Engineer | JavaScript Enthusiast',
    profilePic: 'https://ui-avatars.com/api/?name=John+Doe&background=random&size=200'
  },
  {
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'UI/UX Designer | Creative Thinker',
    profilePic: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random&size=200'
  },
  {
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex@example.com',
    password: 'password123',
    bio: 'Full Stack Developer | React & Node.js',
    profilePic: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=random&size=200'
  },
  {
    name: 'Sara Wilson',
    username: 'saraw',
    email: 'sara@example.com',
    password: 'password123',
    bio: 'Product Manager | Tech Enthusiast',
    profilePic: 'https://ui-avatars.com/api/?name=Sara+Wilson&background=random&size=200'
  },
  {
    name: 'Mike Brown',
    username: 'mikebrown',
    email: 'mike@example.com',
    password: 'password123',
    bio: 'DevOps Engineer | Cloud Architecture',
    profilePic: 'https://ui-avatars.com/api/?name=Mike+Brown&background=random&size=200'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users with hashed passwords
    const createdUsers = [];
    
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = new User({
        name: user.name,
        username: user.username,
        email: user.email,
        password: hashedPassword,
        bio: user.bio,
        profilePic: user.profilePic
      });
      
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
    }
    
    console.log('Users created successfully');
    
    // Create follower relationships
    // User 1 follows User 2 and 3
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $push: { following: [createdUsers[1]._id, createdUsers[2]._id] }
    });
    
    // Update followers for User 2 and 3
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $push: { followers: createdUsers[0]._id }
    });
    
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $push: { followers: createdUsers[0]._id }
    });
    
    // User 2 follows User 3 and 4
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $push: { following: [createdUsers[2]._id, createdUsers[3]._id] }
    });
    
    // Update followers for User 3 and 4
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $push: { followers: createdUsers[1]._id }
    });
    
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      $push: { followers: createdUsers[1]._id }
    });
    
    // Create some sample posts
    const samplePosts = [
      {
        postedBy: createdUsers[0]._id,
        text: "Hello world! This is my first post on Threads!",
        img: "https://res.cloudinary.com/dcqnrh4jw/image/upload/v1711432896/social/post1_wtymgs.jpg"
      },
      {
        postedBy: createdUsers[1]._id,
        text: "Just finished designing a new UI component. What do you think?",
        img: "https://res.cloudinary.com/dcqnrh4jw/image/upload/v1711432896/social/post2_t2ldfz.jpg"
      },
      {
        postedBy: createdUsers[2]._id,
        text: "Working on a new project with React and Node.js. So excited!",
      },
      {
        postedBy: createdUsers[0]._id,
        text: "Learning something new every day!",
      }
    ];
    
    // Insert sample posts
    await Post.insertMany(samplePosts);
    
    console.log('Sample posts created');
    console.log('Database seeded successfully!');
    
    // Disconnect from database
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 