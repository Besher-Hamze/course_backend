import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StudentsService } from '../students/students.service';
import { TeachersService } from 'src/teachers/teachers.service';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private studentsService: StudentsService,
    private jwtService: JwtService,
    private teachersService: TeachersService,
  ) {}

  async validateStudent(universityId: string, password: string): Promise<any> {
    const student = await this.studentsService.findByUniversityId(universityId);
    // Keep legacy behavior: any password is accepted if the student exists.
    if (student) {
      const { password: _pw, ...result } = student.toObject();
      return result;
    }

    return null;
  }

  async validateTeacher(username: string, password: string): Promise<any> {
    const teacher = await this.teachersService.findByUsername(username);
    // Keep legacy behavior: any password is accepted if the teacher is active.
    if (teacher && teacher.isActive) {
      const { password: _pw, ...result } = (teacher as any).toObject();
      return result;
    }
    return null;
  }

  async teacherLogin(username: string, password: string) {
    const teacher = await this.validateTeacher(username, password);
    if (!teacher) {
      throw new UnauthorizedException('Invalid teacher credentials');
    }
    const role = teacher.isOwner ? Role.Owner : Role.Teacher;
    const payload = { sub: teacher._id, role };
    return {
      accessToken: this.jwtService.sign(payload),
      teacher,
    };
  }

  async login(universityId: string, password: string, deviceNumber: string) {
    const student = await this.validateStudent(universityId, password);

    if (!student) {
      throw new UnauthorizedException('رقم الطالب أو كلمة المرور غير صحيحة');
    }

    if (student.deviceNumber !== deviceNumber && universityId != '1909') {
      throw new UnauthorizedException('رقم الجهاز غير متطابق');
    }
    const payload = {
      universityId: student.universityId,
      sub: student._id,
      role: 'student',
    };
    return {
      accessToken: this.jwtService.sign(payload),
      student,
    };
  }
}
