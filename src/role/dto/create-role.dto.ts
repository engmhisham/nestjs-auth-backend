import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'moderator' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'Moderator role with limited admin permissions',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: ['read:users', 'update:users'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}