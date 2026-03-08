import { Hono } from 'hono';
import { loginBodySchema, registerBodySchema } from './auth.schema';
import { zValidator } from 'src/shared/api/middleware/validator-wrapper';
import logger from '@logger';
import {
  InternalServerErrorResponse,
  registerPayloadSchema,
} from './schemas/auth.responses.schema';
import { StatusCodes } from 'http-status-codes';
const authRouter = new Hono();

authRouter.post('/register', zValidator('json', registerBodySchema), (c) => {
  const data = c.req.valid('json');
  logger.info('Received registration data:', data);
  // Here you would handle the logic for registering a new user, such as validating input and storing user data.

  const payload = {
    message: 'User registered successfully',
  };

  const result = registerPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return c.json(payload);
});

authRouter.post('/login', zValidator('json', loginBodySchema), (c) => {
  const data = c.req.valid('json');
  logger.info('Received login data:', data);

  const payload = {
    message: 'User logged in successfully',
  };

  const result = registerPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  // Here you would handle the logic for logging in a user, such as validating credentials and generating a token.
  return c.json(payload);
});

authRouter.post('/refresh', (c) => {
  const payload = {
    message: 'Token refreshed successfully',
  };

  const result = registerPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  // Here you would handle the logic for refreshing a user's authentication token, such as validating the refresh token and generating a new access token.
  return c.json(payload);
});

authRouter.post('/logout', (c) => {
  const payload = {
    message: 'User logged out successfully',
  };

  const result = registerPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  // Here you would handle the logic for logging out a user, such as invalidating a token or clearing session data.
  return c.json(payload);
});

authRouter.get('/me', (c) => {
  const payload = {
    message: 'Authenticated user information retrieved successfully',
  };

  const result = registerPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  // Here you would handle the logic for retrieving the authenticated user's information, such as validating the token and querying user data.
  return c.json(payload);
});

export default authRouter;
