// express-backend/src/seed.ts
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User, { UserType, UserRole } from './models/User';
import WasteListing, { WasteStatus, ItemTypeEnum, WasteCategoryEnum } from './models/WasteListing';
import Comment from './models/Comment';
import connectDB from './config/db';
import bcrypt from 'bcryptjs'; // For hashing passwords in seed

const BCRYPT_SALT_ROUNDS = 10; // Match this with authController

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Comment.deleteMany({});
    await WasteListing.deleteMany({});
    await User.deleteMany({});
    console.log('Existing data cleared.');

    console.log('Creating users...');
    const adminPasswordHash = await bcrypt.hash('adminpassword', BCRYPT_SALT_ROUNDS);
    const collectorJohnPasswordHash = await bcrypt.hash('johnpassword', BCRYPT_SALT_ROUNDS);
    const collectorJanePasswordHash = await bcrypt.hash('janepassword', BCRYPT_SALT_ROUNDS);
    const generatorAlicePasswordHash = await bcrypt.hash('alicepassword', BCRYPT_SALT_ROUNDS);

    const adminUser = new User({
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      name: 'Admin User',
      displayName: 'Admin',
      userType: UserType.ADMIN,
      role: UserRole.ADMIN,
      latitude: 27.1751, longitude: 78.0421, address: 'Admin Office, Agra', city: 'Agra', state: 'Uttar Pradesh', zipCode: '282001',
      contactPhone: '111-222-3333', contactEmail: 'admin@example.com',
    });
    await adminUser.save();

    const collectorJohn = new User({
      email: 'collector1@example.com',
      passwordHash: collectorJohnPasswordHash,
      name: 'Collector John',
      displayName: 'John C.',
      userType: UserType.COLLECTOR,
      role: UserRole.COLLECTOR,
      latitude: 27.1760, longitude: 78.0425, address: 'Collector Depot, Agra', city: 'Agra', state: 'Uttar Pradesh', zipCode: '282002',
      contactPhone: '123-456-7890', contactEmail: 'collector1@example.com',
    });
    await collectorJohn.save();

    const collectorJane = new User({
      email: 'collector2@example.com',
      passwordHash: collectorJanePasswordHash,
      name: 'Collector Jane',
      displayName: 'Jane C.',
      userType: UserType.COLLECTOR,
      role: UserRole.COLLECTOR,
      latitude: 27.1770, longitude: 78.0435, address: 'Recycling Hub, Agra', city: 'Agra', state: 'Uttar Pradesh', zipCode: '282003',
      contactPhone: '987-654-3210', contactEmail: 'collector2@example.com',
    });
    await collectorJane.save();

    const generatorAlice = new User({
      email: 'generator1@example.com',
      passwordHash: generatorAlicePasswordHash,
      name: 'Generator Alice',
      displayName: 'Alice G.',
      userType: UserType.GENERATOR,
      role: UserRole.LISTER,
      latitude: 27.1740, longitude: 78.0410, address: 'Alice Home, Agra', city: 'Agra', state: 'Uttar Pradesh', zipCode: '282004',
      contactPhone: '555-111-2222', contactEmail: 'generator1@example.com',
    });
    await generatorAlice.save();
    console.log('Users created.');

    console.log('Creating waste listings...');
    const listingA = new WasteListing({
      userId: generatorAlice._id,
      wasteType: 'Old Newspapers',
      quantity: '10',
      unit: 'kg',
      description: 'Stack of old newspapers, dry and clean.',
      status: WasteStatus.PENDING,
      latitude: 27.1785, longitude: 78.0405, address: 'Near XYZ Cafe', city: 'Agra', state: 'Uttar Pradesh', zipCode: '282005',
      itemType: ItemTypeEnum.WASTE,
      wasteCategory: WasteCategoryEnum.RECYCLABLE_PAPER,
      imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Paper',
      createdAt: new Date(Date.now() - 3600000 * 5),
    });
    await listingA.save();

    const listingB = new WasteListing({
      userId: generatorAlice._id,
      wasteType: 'Broken Plastic Chairs',
      quantity: '3',
      unit: 'chairs',
      description: 'Three broken plastic chairs, suitable for recycling.',
      status: WasteStatus.PENDING,
      latitude: 27.1720, longitude: 78.0440, address: 'Main Market', city: 'Agra', state: 'Uttar Pradesh', zipCode: '282006',
      itemType: ItemTypeEnum.WASTE,
      wasteCategory: WasteCategoryEnum.RECYCLABLE_PLASTIC,
      imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Plastic',
      createdAt: new Date(Date.now() - 3600000 * 2),
    });
    await listingB.save();

    const listingC = new WasteListing({
      userId: generatorAlice._id,
      wasteType: 'Used Car Battery',
      quantity: '1',
      unit: 'battery',
      description: 'Dead car battery, heavy.',
      status: WasteStatus.ASSIGNED,
      assignedCollectorId: collectorJohn._id,
      latitude: 27.1700, longitude: 78.0415, address: 'Industrial Area', city: 'Agra', state: 'Uttar Pradesh', zipCode: '282007',
      itemType: ItemTypeEnum.WASTE,
      wasteCategory: WasteCategoryEnum.HAZARDOUS,
      imageUrl: 'https://via.placeholder.com/150/00FF00/000000?text=Battery',
      createdAt: new Date(Date.now() - 3600000 * 10),
    });
    await listingC.save();

    const commentC1 = new Comment({
      wasteListingId: listingC._id,
      userId: collectorJohn._id,
      text: 'Will pick up by evening today.',
      createdAt: new Date(Date.now() - 3600000 * 8),
    });
    await commentC1.save();

    const listingD = new WasteListing({
      userId: generatorAlice._id,
      wasteType: 'Old TV',
      quantity: '1',
      unit: 'unit',
      description: 'Old CRT TV, still working but outdated.',
      status: WasteStatus.PENDING,
      latitude: 27.1765, longitude: 78.0430, address: 'Residential Complex', city: 'Agra', state: 'Uttar Pradesh', zipCode: '282008',
      createdAt: new Date(Date.now() - 3600000 * 1),
      itemType: ItemTypeEnum.OLD_ITEM,
      price: 1500,
      imageUrl: 'https://via.placeholder.com/150/FFFF00/000000?text=TV',
    });
    await listingD.save();

    console.log('Waste listings created.');
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();