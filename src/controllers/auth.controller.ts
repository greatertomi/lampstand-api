import { Request, Response } from 'express';
import handleGetRepository from '../utils/handleGetRepository';
import { UserEntity }  from '../entities';
import { logger } from '../services';
import bcrypt from 'bcryptjs';

export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password, agreedToTerms } = req.body;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create a new user instance
  const user = new UserEntity();
  user.fullName = fullName;
  user.emailAddress = email;
  user.agreedToTerms = agreedToTerms;
  user.password = hashedPassword;
  try {
    // Save the user to the database
    const userRepository = handleGetRepository(UserEntity);
    await userRepository.save(user);

    // Return the response
    const response = {
      message: 'User created',
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.emailAddress,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    // Handle any errors that occurred during the process
    logger.error('Error creating user:', error);
    res.status(500).json({ message: 'An error occurred while creating the user.' });
  }
};
