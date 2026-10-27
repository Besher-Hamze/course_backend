import { Role } from '../enums/role.enum';

export function getUserId(user: any): string | null {
  if (!user) return null;
  const id = user._doc?._id ?? user._id ?? user.sub;
  return id ? id.toString() : null;
}

export function isOwner(user: any): boolean {
  return user?.role === Role.Owner;
}

export function isTeacher(user: any): boolean {
  return user?.role === Role.Teacher;
}

export function isStaff(user: any): boolean {
  return isOwner(user) || isTeacher(user);
}

export function isStudent(user: any): boolean {
  return user?.role === Role.Student;
}
