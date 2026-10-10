import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.register on register()', async () => {
    const registerDto = { name: 'User', email: 'u@example.com', password: 'password123' };
    const expectedResult = { user: { id: 1, name: 'User', email: 'u@example.com' }, accessToken: 'token' };

    (mockAuthService.register as any).mockResolvedValue(expectedResult);

    const result = await controller.register(registerDto);

    expect(authService.register).toHaveBeenCalledWith(registerDto);
    expect(result).toEqual(expectedResult);
  });

  it('should call authService.login on login()', async () => {
    const loginDto = { email: 'u@example.com', password: 'password123' };
    const expectedResult = { user: { id: 1, email: 'u@example.com' }, accessToken: 'token' };

    (mockAuthService.login as any).mockResolvedValue(expectedResult);

    const result = await controller.login(loginDto);

    expect(authService.login).toHaveBeenCalledWith(loginDto);
    expect(result).toEqual(expectedResult);
  });

  it('should return profile on getProfile()', async () => {
    const user = { id: 1, email: 'u@example.com' };
    const result = await controller.getProfile(user);
    expect(result).toEqual(user);
  });
});
