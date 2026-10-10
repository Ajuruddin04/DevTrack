import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user (admin / internal)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Get all registered users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Find user by ID' })
  @ApiResponse({ status: 200, description: 'User record' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Find user by Email' })
  @ApiResponse({ status: 200, description: 'User record' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}
