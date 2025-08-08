import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 'moderator', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    example: 'Updated moderator role description',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: ['read:users', 'update:users', 'delete:posts'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}