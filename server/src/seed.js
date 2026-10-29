const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Group = require('./models/Group');
const Item = require('./models/Item');
const Loan = require('./models/Loan');
const Activity = require('./models/Activity');
const { connectDB } = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing data...');
    await User.deleteMany();
    await Group.deleteMany();
    await Item.deleteMany();
    await Loan.deleteMany();
    await Activity.deleteMany();

    console.log('[Seed] Creating demo users...');
    const srikar = await User.create({
      name: 'Srikar Patel',
      email: 'srikar@example.com',
      password: 'password123',
      phone: '',
    });

    const rahul = await User.create({
      name: 'Rahul',
      email: 'rahul@example.com',
      password: 'password123',
      phone: '+91 98111 22334',
    });

    const kiran = await User.create({
      name: 'Kiran',
      email: 'kiran@example.com',
      password: 'password123',
      phone: '+91 98222 33445',
    });

    const akhil = await User.create({
      name: 'Akhil',
      email: 'akhil@example.com',
      password: 'password123',
      phone: '+91 98333 44556',
    });

    const teja = await User.create({
      name: 'Teja',
      email: 'teja@example.com',
      password: 'password123',
      phone: '+91 98444 55667',
    });

    console.log('[Seed] Creating groups...');
    const friendsGroup = await Group.create({
      name: 'Friends Group',
      description: 'Books, Chargers, Sports Equipment',
      creator: srikar._id,
      members: [srikar._id, rahul._id, kiran._id, akhil._id],
    });

    const collegeGroup = await Group.create({
      name: 'College Group',
      description: 'Lab Equipment, Project Tools',
      creator: srikar._id,
      members: [srikar._id, rahul._id, kiran._id, akhil._id, teja._id],
    });

    console.log('[Seed] Creating items...');
    const physicsBook = await Item.create({
      name: 'Physics Book',
      category: 'Books',
      description: 'University Physics with Modern Physics by Young and Freedman',
      owner: srikar._id,
      group: friendsGroup._id,
      status: 'Available',
    });

    const laptopCharger = await Item.create({
      name: 'Laptop Charger',
      category: 'Electronics',
      description: '65W USB-C fast charging adapter and braided cable',
      owner: srikar._id,
      group: friendsGroup._id,
      status: 'Borrowed',
    });

    const cricketBat = await Item.create({
      name: 'Cricket Bat',
      category: 'Sports',
      description: 'English Willow Cricket Bat with protective cover',
      owner: srikar._id,
      group: friendsGroup._id,
      status: 'Available',
    });

    const waterBottle = await Item.create({
      name: 'Water Bottle',
      category: 'Others',
      description: '1 Litre Stainless Steel insulated flask',
      owner: srikar._id,
      group: friendsGroup._id,
      status: 'Available',
    });

    const projector = await Item.create({
      name: 'Projector',
      category: 'Electronics',
      description: 'Full HD 1080p portable HDMI projector for presentations',
      owner: srikar._id,
      group: collegeGroup._id,
      status: 'Overdue',
    });

    // Additional items to match counts on dashboard
    const labMultimeter = await Item.create({
      name: 'Digital Multimeter',
      category: 'Lab Equipment',
      description: 'Auto-ranging digital multimeter for electronics testing',
      owner: srikar._id,
      group: collegeGroup._id,
      status: 'Available',
    });

    const solderingIron = await Item.create({
      name: 'Soldering Iron Kit',
      category: 'Tools',
      description: 'Adjustable temperature soldering station with solder wire',
      owner: srikar._id,
      group: collegeGroup._id,
      status: 'Available',
    });

    const badmintoRacket = await Item.create({
      name: 'Badminton Racket Set',
      category: 'Sports',
      description: 'Pair of Yonex carbon fiber badminton rackets with shuttlecocks',
      owner: srikar._id,
      group: friendsGroup._id,
      status: 'Available',
    });

    const calculusBook = await Item.create({
      name: 'Calculus Early Transcendentals',
      category: 'Books',
      description: 'James Stewart 8th Edition',
      owner: srikar._id,
      group: collegeGroup._id,
      status: 'Available',
    });

    const hdmiCable = await Item.create({
      name: 'HDMI 4K Cable 5m',
      category: 'Electronics',
      description: 'Braided high speed 4K 60Hz HDMI cable',
      owner: srikar._id,
      group: collegeGroup._id,
      status: 'Available',
    });

    const toolkit = await Item.create({
      name: 'Precision Screwdriver Set',
      category: 'Tools',
      description: '64 in 1 electronics repair tool set',
      owner: srikar._id,
      group: collegeGroup._id,
      status: 'Available',
    });

    const basketball = await Item.create({
      name: 'Spalding Basketball',
      category: 'Sports',
      description: 'Size 7 composite leather outdoor basketball',
      owner: srikar._id,
      group: friendsGroup._id,
      status: 'Available',
    });

    console.log('[Seed] Creating loans...');
    // Active Loan: Laptop Charger -> Rahul
    const loan1 = await Loan.create({
      item: laptopCharger._id,
      lender: srikar._id,
      borrower: rahul._id,
      borrowerName: 'Rahul',
      borrowerEmail: 'rahul@example.com',
      checkoutDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      status: 'Active',
      checkoutNote: 'Needs it for study session',
    });
    laptopCharger.currentLoan = loan1._id;
    await laptopCharger.save();

    // Overdue Loan: Projector -> Akhil
    const loan2 = await Loan.create({
      item: projector._id,
      lender: srikar._id,
      borrower: akhil._id,
      borrowerName: 'Akhil',
      borrowerEmail: 'akhil@example.com',
      checkoutDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (Overdue!)
      status: 'Overdue',
      checkoutNote: 'Presentation project',
    });
    projector.currentLoan = loan2._id;
    await projector.save();

    // Returned Loan (for history)
    const loan3 = await Loan.create({
      item: physicsBook._id,
      lender: srikar._id,
      borrower: kiran._id,
      borrowerName: 'Kiran',
      borrowerEmail: 'kiran@example.com',
      checkoutDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      returnedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: 'Returned',
      checkoutNote: 'Physics midterm prep',
      returnNote: 'Returned in good condition',
    });

    // Returned Cricket Bat (history)
    const loan4 = await Loan.create({
      item: cricketBat._id,
      lender: srikar._id,
      borrower: teja._id,
      borrowerName: 'Teja',
      borrowerEmail: 'teja@example.com',
      checkoutDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      returnedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'Returned',
      checkoutNote: 'Weekend cricket match',
      returnNote: 'Clean and safe',
    });

    console.log('[Seed] Creating recent activities...');
    await Activity.create({
      user: srikar._id,
      type: 'borrow',
      title: 'Laptop Charger borrowed by Rahul',
      subtitle: `${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • Due in 2 days`,
      item: laptopCharger._id,
      loan: loan1._id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Activity.create({
      user: srikar._id,
      type: 'return',
      title: 'Book returned by Kiran',
      subtitle: `${new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      item: physicsBook._id,
      loan: loan3._id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await Activity.create({
      user: srikar._id,
      type: 'borrow',
      title: 'Projector borrowed by Akhil',
      subtitle: `${new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • Overdue`,
      item: projector._id,
      loan: loan2._id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    console.log('\n========================================');
    console.log('✅ Demo database seeded successfully!');
    console.log('   User Email:    srikar@example.com');
    console.log('   User Password: password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
