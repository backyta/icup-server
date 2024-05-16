import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RoleProtected } from '@/auth/decorators';
import { UserRoleGuard } from '@/auth/guards';
import { ValidUserRoles } from '@/auth/enums';

export function Auth(...roles: ValidUserRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
