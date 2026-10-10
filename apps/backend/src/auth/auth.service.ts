import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.createUser(registerDto);
    const tokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.usersService.comparePasswords(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: safeUser,
      accessToken,
    };
  }
}
