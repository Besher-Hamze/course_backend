import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    @Post()
    @Roles(Role.Owner)
    async create(@Body() body: { username: string; fullName: string; password: string }) {
        const { username, fullName, password } = body;
        return this.teachersService.create(username, fullName, password);
    }

    @Get()
    @Roles(Role.Owner)
    async findAll() {
        return this.teachersService.findAll();
    }

    @Patch(':id/activate')
    @Roles(Role.Owner)
    async activate(@Param('id') id: string) {
        return this.teachersService.setActive(id, true);
    }

    @Patch(':id/deactivate')
    @Roles(Role.Owner)
    async deactivate(@Param('id') id: string) {
        return this.teachersService.setActive(id, false);
    }
}


