import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ 
    example: ['user', 'admin'], 
    description: 'Array of role names to assign to user' 
  })
  @IsArray()
  @IsString({ each: true })
  roleNames: string[];
}