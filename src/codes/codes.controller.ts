import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { CodesService } from './codes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('codes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CodesController {
    constructor(private readonly codesService: CodesService) { }

    @Post('courses/:courseId/generate')
    @Roles(Role.Owner)
    async generateCodes(@Param('courseId') courseId: string, @Body() body: { count?: number }) {
        const count = body.count || 100;
        const codes = await this.codesService.generateForCourse(courseId, count);
        return { codes, count: codes.length };
    }

    @Get('courses/:courseId/active')
    @Roles(Role.Owner)
    async getActiveCodes(@Param('courseId') courseId: string) {
        return this.codesService.getActiveCodesForCourse(courseId);
    }

    @Get('courses/:courseId/used')
    @Roles(Role.Owner)
    async getUsedCodes(@Param('courseId') courseId: string) {
        return this.codesService.getUsedCodesForCourse(courseId);
    }
}

