import { OpenAPIHono } from '@hono/zod-openapi';
import logger from '@logger';
import { defaultHook } from '@shared/api/openapi/defaultHook';
import { deleteCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { sign } from 'hono/jwt';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { APP_CONFIG } from '@/config/appConfig';
import { configProvider } from '@/config/configProvider';
import { client } from '@/infrastucture/cache/client';
import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { GetBasicUserInfo } from '@/modules/users/application/use-case/getBasicUserInfo';
import { InvalidEmailAddress } from '@/modules/users/domain/errors/InvalidEmailAddress';
import { UserAlreadyExistError } from '@/modules/users/domain/errors/UserAlreadyExistError';
import { UserCacheRepository } from '@/modules/users/infrastructure/repositories/UserCacheRepository';
import { UserRepository } from '@/modules/users/infrastructure/repositories/UserRepository';
import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';
import { ValidationError } from '@/shared/errors/Specialized/ValidationError';

import { RepositoryFactory } from '../../../infrastucture/factories/RepositoryFactory';
import { CreateUserDevice as CreateOrFindUserDevice } from '../../users/application/use-case/createUserDevice';
import { CreateAuthSession } from '../application/use-cases/createAuthSession';
import { LoginUser } from '../application/use-cases/loginUser';
import { LogoutUser } from '../application/use-cases/logoutUser';
import { RefreshAuthSession } from '../application/use-cases/refreshAuthSession';
import { RegisterUser } from '../application/use-cases/registerUser';
import { AuthSessionRefreshToken } from '../domain/value-objects';
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

  const ipAddress = c.get('client-ip') ?? null;

  if (!ipAddress) {
    logger.warn(`Login attempt without IP address ${c.req.path}`);
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message: 'Unable to determine client IP address',
    });
  }

  const repositoryFactory = new RepositoryFactory();
  const userCacheRepository = repositoryFactory.userCacheRepository();
  const deviceRepository = repositoryFactory.deviceRepository();
  const authSessionRepository = repositoryFactory.authSessionRepository();
  const loginUser = new LoginUser(userCacheRepository);
  const createOrFindUserDevice = new CreateOrFindUserDevice(deviceRepository);
  const createAuthSession = new CreateAuthSession(
    authSessionRepository,
    userCacheRepository,
  );
  try {
    const user = await loginUser.execute(data);

    if (!user.id) {
      logger.error(`User ${user.email.value} has no ID after successful login`);
      throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }

    const device = await createOrFindUserDevice.execute(
      data.fingerprint,
      user.id.value,
      data.name,
      data.os,
    );

    const { session: authSession, rawToken: refreshToken } =
      await createAuthSession.execute({
        userId: user.id,
        deviceId: device.id,
        userAgent: c.req.header('User-Agent') ?? 'Unknown',
        ipAddress: ipAddress,
      });

    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      secure: !configProvider.get('DEVELOPMENT'),
      // sameSite: 'Strict',
      maxAge: APP_CONFIG.auth.tokens.refreshCookieMaxAgeSeconds,
    });

    const accessToken = await sign(
      {
        sub: user.id.value,
        role: user.role.name,
        sessionId: authSession.id.value,
        exp:
          Math.floor(Date.now() / 1000) +
          APP_CONFIG.auth.tokens.accessTokenTtlSeconds,
      },
      configProvider.get('JWT_ACCESS_SECRET'),
    );

    return c.json(
      {
        message: 'User logged in successfully',
        accessToken,
      },
      StatusCodes.OK,
    );
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
    if (err instanceof Error) {
      throw new HTTPException(StatusCodes.UNAUTHORIZED, {
        message: err.message || 'Invalid credentials',
      });
    }
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message: 'An unexpected error occurred during login',
    });
  }
});

authRouter.openapi(refreshRoute, async (c) => {
  const data = c.req.valid('cookie');
  try {
    const tokenPayload = await AuthSessionRefreshToken.decode(
      data.refreshToken,
    );

    logger.onlyDev(
      `Decoded refresh token payload: ${JSON.stringify(tokenPayload)}`,
    );
    const repositoryFactory = new RepositoryFactory();
    const refreshToken = new RefreshAuthSession(
      repositoryFactory.authSessionRepository(),
      repositoryFactory.userCacheRepository(),
    );
    const refreshedData = {
      sessionId: tokenPayload.sessionId,
      refreshToken: data.refreshToken,
    };
    const newData = await refreshToken.execute(refreshedData);

    const accessToken = await sign(
      {
        sub: tokenPayload.userId,
        role: newData.user.role.name,
        sessionId: tokenPayload.sessionId,
        exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
      },
      configProvider.get('JWT_ACCESS_SECRET'),
    );

    setCookie(c, 'refreshToken', newData.rawToken, {
      httpOnly: true,
      secure: !configProvider.get('DEVELOPMENT'),
      // sameSite: 'Strict',
      maxAge: 60 * 60 * 24 * 7,
    });
    const payload = {
      message: 'Authentication token refreshed successfully',
      accessToken,
    };
    return c.json(payload, StatusCodes.OK);
  } catch (err) {
    logger.warn(
      `Failed to decode refresh token: ${err instanceof Error ? err.message : String(err)}`,
    );
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Invalid refresh token',
    });
  }
});

authRouter.openapi(logoutRoute, async (c) => {
  const data = c.req.valid('cookie');
  const repositoryFactory = new RepositoryFactory();
  const authSessionRepository = repositoryFactory.authSessionRepository();
  const logout = new LogoutUser(authSessionRepository);
  try {
    const tokenPayload = await AuthSessionRefreshToken.decode(
      data.refreshToken,
    );

    await logout.execute(tokenPayload.sessionId);
  } catch (err) {
    logger.warn(
      `Failed to decode refresh token during logout: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    const result = deleteCookie(c, 'refreshToken', {
      httpOnly: true,
      secure: !configProvider.get('DEVELOPMENT'),
      // sameSite: 'Strict',
    });
    if (!result) {
      logger.onlyDev(
        'Failed to delete refresh token cookie during logout - cookie not found. Should never happen, validation should have failed if cookie was missing.',
      );
    }
  }
  return c.json(
    {
      message: 'User logged out successfully',
    },
    200,
  );
});

authRouter.openapi(meRoute, async (c) => {
  const data = c.get('jwt-payload');

  if (!data) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
    });
  }

  const userRepository = new RepositoryFactory().userRepository();
  const getUserProfile = new GetBasicUserInfo(userRepository);

  try {
    const userProfile = await getUserProfile.execute(data.userId);

    return c.json(userProfile, StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error && err.message === 'User not found') {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'User not found',
      });
    }
    logger.error(
      `Error retrieving user profile for user ID ${data.userId}: ${err instanceof Error ? err.message : String(err)}`,
    );
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'An error occurred while retrieving user information',
    });
  }
});

export default authRouter;
