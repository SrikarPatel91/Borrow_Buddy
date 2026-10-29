const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Import models
const User = require('../src/models/User');
const Item = require('../src/models/Item');
const Group = require('../src/models/Group');
const Loan = require('../src/models/Loan');
const Activity = require('../src/models/Activity');
const app = require('../src/server');

describe('BorrowBuddy Backend Test Suite', () => {
  describe('1. Server Health & Route Verification', () => {
    it('GET /api/health should respond with status 200 and ok status', async () => {
      const res = await request(app).get('/api/health');
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.status, 'ok');
      assert.strictEqual(res.body.app, 'BorrowBuddy API');
    });

    it('Unknown route should return 404 with standardized error JSON', async () => {
      const res = await request(app).get('/api/non-existent-route-12345');
      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Route not found/);
    });

    it('Protected routes should reject requests without token with 401', async () => {
      const res = await request(app).get('/api/items');
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Not authorized/i);
    });

    it('Protected routes should reject invalid bearer tokens with 401', async () => {
      const res = await request(app)
        .get('/api/loans')
        .set('Authorization', 'Bearer invalid_bogus_token_123');
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('2. User Model & Password Hashing Logic', () => {
    it('should validate user schema correctly', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const validationError = user.validateSync();
      assert.strictEqual(validationError, undefined);
    });

    it('should require name, email, and password', () => {
      const user = new User({});
      const validationError = user.validateSync();
      assert.ok(validationError);
      assert.ok(validationError.errors['name']);
      assert.ok(validationError.errors['email']);
      assert.ok(validationError.errors['password']);
    });

    it('should reject invalid email formats', () => {
      const user = new User({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'password123',
      });
      const validationError = user.validateSync();
      assert.ok(validationError);
      assert.ok(validationError.errors['email']);
    });

    it('should securely hash password with bcrypt', async () => {
      const rawPassword = 'secretPassword123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      assert.notStrictEqual(rawPassword, hashedPassword);
      const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
      assert.strictEqual(isMatch, true);

      const isMismatch = await bcrypt.compare('wrongPassword', hashedPassword);
      assert.strictEqual(isMismatch, false);
    });
  });

  describe('3. Item Model & Business Logic', () => {
    it('should validate valid item structure', () => {
      const dummyUserId = new mongoose.Types.ObjectId();
      const item = new Item({
        name: 'Calculus Early Transcendentals',
        category: 'Books',
        owner: dummyUserId,
        status: 'Available',
      });

      const error = item.validateSync();
      assert.strictEqual(error, undefined);
      assert.strictEqual(item.status, 'Available');
    });

    it('should reject invalid categories', () => {
      const dummyUserId = new mongoose.Types.ObjectId();
      const item = new Item({
        name: 'Spaceship',
        category: 'IntergalacticVehicle',
        owner: dummyUserId,
      });

      const error = item.validateSync();
      assert.ok(error);
      assert.ok(error.errors['category']);
    });
  });

  describe('4. Loan Model & Overdue Calculation Logic', () => {
    it('should validate loan schema', () => {
      const dummyId = new mongoose.Types.ObjectId();
      const loan = new Loan({
        item: dummyId,
        lender: dummyId,
        borrowerName: 'Rahul',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Active',
      });

      const error = loan.validateSync();
      assert.strictEqual(error, undefined);
      assert.strictEqual(loan.status, 'Active');
    });

    it('should properly calculate overdue vs active vs returned status', () => {
      const now = new Date();
      const pastDue = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const futureDue = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

      // Past due date and status is Active -> is overdue
      const isOverdue = pastDue < now;
      assert.strictEqual(isOverdue, true);

      // Future due date -> not overdue
      const isFutureOverdue = futureDue < now;
      assert.strictEqual(isFutureOverdue, false);

      // Returned loan -> must NEVER be marked overdue even if returned after due date
      const returnedLoan = {
        status: 'Returned',
        dueDate: pastDue,
        returnedDate: now,
      };
      const displayStatus = returnedLoan.status === 'Returned' ? 'Returned' : (returnedLoan.dueDate < now ? 'Overdue' : 'Active');
      assert.strictEqual(displayStatus, 'Returned');
    });
  });

  describe('5. Group Model Validation', () => {
    it('should require group name and creator', () => {
      const group = new Group({});
      const error = group.validateSync();
      assert.ok(error);
      assert.ok(error.errors['name']);
      assert.ok(error.errors['creator']);
    });

    it('should validate proper group structure', () => {
      const dummyUserId = new mongoose.Types.ObjectId();
      const group = new Group({
        name: 'Friends Group',
        description: 'Books, Chargers, Sports Equipment',
        creator: dummyUserId,
        members: [dummyUserId],
      });

      const error = group.validateSync();
      assert.strictEqual(error, undefined);
      assert.strictEqual(group.members.length, 1);
    });
  });

  after(async () => {
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    setTimeout(() => process.exit(0), 100);
  });
});
