import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetStudentId = createParamDecorator(
    async (
        data: unknown,
        context: ExecutionContext,
    ): Promise<string[]> => {
        const request = context.switchToHttp().getRequest();                        
        const account = request.user._doc._id;
        return account;
    },
);
