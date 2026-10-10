import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compare plain and hashed passwords correctly', async () => {
    const plain = 'mysecretpassword';
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(plain, 10);
    const isValid = await service.comparePasswords(plain, hash);
    const isInvalid = await service.comparePasswords('wrongpassword', hash);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });
});
