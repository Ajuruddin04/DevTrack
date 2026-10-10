import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered & JWT access token returned' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login with email & password' })
  @ApiResponse({ status: 201, description: 'Login successful & JWT access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized / Token required' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@GetUser() user: any) {
    return user;
  }
}
