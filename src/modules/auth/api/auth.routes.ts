import { OpenAPIHono } from '@hono/zod-openapi';
import logger from '@logger';
import { defaultHook } from '@shared/api/openapi/defaultHook';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { client } from '@/infrastucture/cache/client';
import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { InvalidEmailAddress } from '@/modules/users/domain/errors/InvalidEmailAddress';
import { UserAlreadyExistError } from '@/modules/users/domain/errors/UserAlreadyExistError';
import { UserCacheRepository } from '@/modules/users/infrastructure/repositories/UserCacheRepository';
import { UserRepository } from '@/modules/users/infrastructure/repositories/UserRepository';
import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';
import { ValidationError } from '@/shared/errors/Specialized/ValidationError';

import { LoginUser } from '../application/use-cases/loginUser';
import { RegisterUser } from '../application/use-cases/registerUser';
import {
  loginRoute,
  logoutRoute,
  meRoute,
  refreshRoute,
  registerRoute,
} from './auth.openapi';

const authRouter = new OpenAPIHono({ defaultHook });

authRouter.openapi(registerRoute, async (c) => {
  // Example validated data access
  const data = c.req.valid('json');

  const daoFactory = new DaoFactory();
  const userDao = daoFactory.db.userDao();
  const roleDao = daoFactory.db.roleDao();
  const userRepository = new UserRepository(userDao);
  const userCacheRepository = new UserCacheRepository(userRepository, client);
  const registerUser = new RegisterUser(userCacheRepository, roleDao);

  try {
    await registerUser.execute(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      if (error instanceof PasswordValidationError) {
        throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
          message: 'ValidationError',
          cause: [
            {
              field: 'password',
              error: error.message,
            },
          ],
        });
      }

      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: error.message,
      });
    }
    if (error instanceof UserAlreadyExistError) {
      logger.warn(
        `User registration failed due to existing user: ${error.message}`,
      );
      throw new HTTPException(StatusCodes.CONFLICT, {
        message: 'ConflictError',
        cause: [
          {
            field: 'email',
            error: error.message,
          },
        ],
      });
    }
    if (error instanceof Error) {
      throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: error.message,
      });
    }
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message: 'An unexpected error occurred during registration',
    });
  }
  // Here you would handle the logic for registering a new user, such as validating input and storing user data.

  const payload = {
    message: 'User registered successfully',
  };

  return c.json(payload, StatusCodes.OK);
});

authRouter.openapi(loginRoute, async (c) => {
  const data = c.req.valid('json');

  const daoFactory = new DaoFactory();
  const userDao = daoFactory.db.userDao();
  const userRepository = new UserRepository(userDao);
  const userCacheRepository = new UserCacheRepository(userRepository, client);
  const loginUser = new LoginUser(userCacheRepository);
  try {
    await loginUser.execute(data);
    //TODO: Generate and return authentication token, set cookies, etc.
  } catch (err) {
    if (err instanceof InvalidEmailAddress) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [
          {
            field: 'email',
            error: err.message,
          },
        ],
      });
    }

    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'ValidationError',
      cause: [
        {
          field: 'email',
          error: 'Invalid email format',
        },
      ],
    });
  }

  const payload = {
    message: 'User logged in successfully',
  };

  // Here you would handle the logic for logging in a user, such as validating credentials and generating a token.
  return c.json(payload, StatusCodes.OK);
});

authRouter.openapi(refreshRoute, (c) => {
  const payload = {
    message: 'Token refreshed successfully',
  };

  // Here you would handle the logic for refreshing a user's authentication token, such as validating the refresh token and generating a new access token.
  return c.json(payload, StatusCodes.OK);
});

authRouter.openapi(logoutRoute, (c) => {
  const payload = {
    message: 'User logged out successfully',
  };

  // Here you would handle the logic for logging out a user, such as invalidating a token or clearing session data.
  return c.json(payload, StatusCodes.OK);
});

authRouter.openapi(meRoute, (c) => {
  const payload = {
    message: 'Authenticated user information retrieved successfully',
  };

  // Here you would handle the logic for retrieving the authenticated user's information, such as validating the token and querying user data.
  return c.json(payload, StatusCodes.OK);
});

export default authRouter;
