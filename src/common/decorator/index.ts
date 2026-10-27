import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const GetStudentId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.role !== Role.Student) {
      return null;
    }
    const id = user._doc?._id ?? user._id ?? user.sub;
    return id ? id.toString() : null;
  },
);

export const GetUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): any => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
