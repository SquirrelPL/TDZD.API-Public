
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const  Permission = (isCustom: boolean = false , ...roles: String[]) => SetMetadata(ROLES_KEY, {roles, isCustom});
//