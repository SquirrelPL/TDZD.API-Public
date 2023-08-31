import { createParamDecorator, ExecutionContext, ForbiddenException, Module } from '@nestjs/common';
import { GetUserPipe } from '../pipe/getUser.pipe'

//
export const GetUserDec = createParamDecorator(
  async (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const request2 = ctx.switchToHttp().getRequest();
    const authHeader = request2.headers['authorization']
    return {request,authHeader};
  },
);

export const GetUser = (additionalOptions?: any) => GetUserDec(additionalOptions, GetUserPipe);