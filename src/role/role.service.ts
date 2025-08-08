import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleType } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRoles();
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.findByName(updateRoleDto.name);
      if (existingRole) {
        throw new ConflictException('Role name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findById(id);
    
    // Prevent deletion of default roles
    if (role.name === RoleType.USER || role.name === RoleType.ADMIN) {
      throw new ConflictException('Cannot delete default roles');
    }

    await this.roleRepository.remove(role);
  }

  private async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: RoleType.USER,
        description: 'Default user role with basic permissions',
        permissions: ['read:profile', 'update:own-profile'],
      },
      {
        name: RoleType.ADMIN,
        description: 'Administrator role with full permissions',
        permissions: [
          'read:profile',
          'update:own-profile',
          'read:users',
          'update:users',
          'delete:users',
          'manage:roles',
        ],
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.findByName(roleData.name);
      if (!existingRole) {
        await this.roleRepository.save(this.roleRepository.create(roleData));
      }
    }
  }
}