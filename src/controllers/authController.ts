// express-backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import User, { IUser, UserRole, UserType } from '../models/User';
import bcrypt from 'bcryptjs';      // Password hashing ke liye
import jwt from 'jsonwebtoken';    // JSON Web Tokens ke liye

// JWT secret key (REAL APP MEIN ISE .env FILE MEIN RAKHEIN!)
const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecureJwtSecretKeyForDev';
// Salt rounds for bcrypt (password hashing strength)
const BCRYPT_SALT_ROUNDS = 10;

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
export const signupUser = async (req: Request, res: Response) => {
  const { email, password, displayName, userType, latitude, longitude, address, city, state, zipCode, contactPhone, contactEmail } = req.body;

  if (!email || !password || !displayName || !userType) {
    return res.status(400).json({ msg: 'Please enter all required fields: email, password, displayName, userType' });
  }

  // userType validation
  const userTypeUpper = userType.toUpperCase() as UserType;
  if (!Object.values(UserType).includes(userTypeUpper)) {
    return res.status(400).json({ msg: `Invalid userType: ${userType}. Must be GENERATOR, COLLECTOR, or ADMIN.` });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine user role based on userType
    let role: UserRole;
    switch (userTypeUpper) {
      case UserType.ADMIN:
        role = UserRole.ADMIN;
        break;
      case UserType.COLLECTOR:
        role = UserRole.COLLECTOR;
        break;
      default:
        role = UserRole.LISTER; // Default role for GENERATOR or others
    }

    // Create new user
    user = new User({
      email,
      passwordHash: hashedPassword,
      displayName,
      name: displayName,
      userType: userTypeUpper,
      role: role,
      latitude, longitude, address, city, state, zipCode, contactPhone, contactEmail,
    });

    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        userType: user.userType
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    res.status(201).json({
      msg: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        role: user.role,
      },
      token: token
    });
  } catch (err: any) {
    console.error('Error in signupUser:', err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/auth/signin
// @desc    Authenticate user & get token
// @access  Public
export const signinUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields: email and password' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash || ''); // Use bcrypt.compare
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        userType: user.userType
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    res.json({
      msg: 'Logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        role: user.role,
      },
      token: token
    });
  } catch (err: any) {
    console.error('Error in signinUser:', err.message);
    res.status(500).send('Server Error');
  }
};
