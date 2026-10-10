import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let _usersService: UsersService;
  let _jwtService: JwtService;

  const mockUsersService = {
    createUser: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    comparePasswords: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    _usersService = module.get<UsersService>(UsersService);
    _jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should register a new user and return accessToken', async () => {
    const registerDto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    };
    const createdUser = {
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockUsersService.createUser as any).mockResolvedValue(createdUser);
    (mockJwtService.signAsync as any).mockResolvedValue('jwt_token_example');

    const result = await authService.register(registerDto);

    expect(result).toEqual({
      user: createdUser,
      accessToken: 'jwt_token_example',
    });
  });

  it('should throw UnauthorizedException on invalid login credentials', async () => {
    (mockUsersService.findByEmailWithPassword as any).mockResolvedValue(null);

    await expect(
      authService.login({ email: 'wrong@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
