import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { StudentsService } from '../students/students.service';
import { TeachersService } from 'src/teachers/teachers.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private studentsService: StudentsService,
    private teachersService: TeachersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload.role === 'owner') {
      return { ...payload, role: 'owner' };
    } else if (payload.role === 'teacher') {
      const teacher = await this.teachersService.findById(payload.sub);
      return { ...teacher, role: 'teacher' } as any;
    } else {
      const student = await this.studentsService.findOne(payload.sub);
      const role = payload.role;
      return { ...student, role };
    }
  }
}

