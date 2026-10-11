import { Role } from '../enums/role.enum';

/** Returns the student id when the request user is a student, otherwise null. */
export function getStudentId(user: any): string | null {
    if (!user || user.role !== Role.Student) {
        return null;
    }
    const id = user._doc?._id ?? user._id ?? user.sub;
    return id ? id.toString() : null;
}

export function toPlain<T = any>(doc: any): T {
    return doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : doc;
}
