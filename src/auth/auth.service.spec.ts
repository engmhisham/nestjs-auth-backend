import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let roleService: jest.Mocked<RoleService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockRole: Role = {
    id: '1',
    name: 'user',
    description: 'User role',
    permissions: ['read:profile'],
    users: [],
    createdAt: new Date(),
  };

  const mockUser: Partial<User> = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    roles: [mockRole],
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockUser = (overrides: Partial<User> = {}): User => {
    const user = {
      ...mockUser,
      ...overrides,
      hasRole: jest.fn().mockImplementation((roleName: string) => {
        const roles = overrides.roles || mockUser.roles || [];
        return roles.some(role => role.name === roleName);
      }),
      getRoleNames: jest.fn().mockImplementation(() => {
        const roles = overrides.roles || mockUser.roles || [];
        return roles.map(role => role.name);
      }),
    } as User;
    return user;
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
    findById: jest.fn(),
  };

  const mockRoleService = {
    findByName: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    roleService = module.get(RoleService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();

    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      const newUser = createMockUser();
      
      userService.findByEmail.mockResolvedValue(null);
      roleService.findByName.mockResolvedValue(mockRole);
      mockBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      userService.create.mockResolvedValue(newUser);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      userService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(roleService.findByName).toHaveBeenCalledWith('user');
      expect(userService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashedpassword',
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roles: [mockRole],
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = createMockUser();
      userService.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
    });

    it('should throw BadRequestException if default role not found', async () => {
      userService.findByEmail.mockResolvedValue(null);
      roleService.findByName.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const user = createMockUser();
      
      userService.findByEmail.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      userService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = createMockUser();
      
      userService.findByEmail.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = createMockUser({ isActive: false });
      userService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const payload = { sub: '123', email: 'test@example.com', roles: ['user'] };
      const userWithRefreshToken = createMockUser({
        refreshToken: 'valid-refresh-token',
      });

      jwtService.verify.mockReturnValue(payload);
      userService.findById.mockResolvedValue(userWithRefreshToken);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      userService.updateRefreshToken.mockResolvedValue(undefined);


      const result = await service.refreshTokens(refreshTokenDto);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'refresh-secret',
      });
      expect(userService.findById).toHaveBeenCalledWith('123');
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = { refreshToken: 'invalid-token' };
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const payload = { sub: '123', email: 'test@example.com', roles: ['user'] };

      jwtService.verify.mockReturnValue(payload);
      userService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const payload = { sub: '123', email: 'test@example.com', roles: ['user'] };
      const userWithDifferentToken = createMockUser({
        refreshToken: 'different-token',
      });

      jwtService.verify.mockReturnValue(payload);
      userService.findById.mockResolvedValue(userWithDifferentToken);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const userId = '123';
      userService.updateRefreshToken.mockResolvedValue(undefined);


      const result = await service.logout(userId);

      expect(userService.updateRefreshToken).toHaveBeenCalledWith(userId, null);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('validateUser', () => {
    it('should return user if valid and active', async () => {
      const user = createMockUser();
      userService.findById.mockResolvedValue(user);


      const result = await service.validateUser('123');

      expect(userService.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = createMockUser({ isActive: false });
      userService.findById.mockResolvedValue(inactiveUser);

      await expect(service.validateUser('123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(service.validateUser('123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});