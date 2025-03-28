import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StudentsService } from '../students/students.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private studentsService: StudentsService,
    private jwtService: JwtService,
  ) { }

  async validateStudent(universityId: string, password: string): Promise<any> {
    const student = await this.studentsService.findByUniversityId(universityId);
    if (student && await bcrypt.compare(password, student.password)) {
      const { password, ...result } = student.toObject();
      return result;
    }

    return null;
  }

  async login(universityId: string, password: string, deviceNumber: string) {
    const student = await this.validateStudent(universityId, password);

    if (!student) {
      throw new UnauthorizedException('رقم الطالب أو كلمة المرور غير صحيحة');
    }

    if (student.deviceNumber !== deviceNumber) {
      throw new UnauthorizedException('رقم الجهاز غير متطابق');
    }
    const payload = { universityId: student.universityId, sub: student._id, role: "student" };
    return {
      accessToken: this.jwtService.sign(payload),
      student,
    };
  }
  generateAdminToken() {
    const payload = { sub: 'admin', role: 'admin' };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        username: 'admin',
        role: 'admin'
      }
    };
  }

}