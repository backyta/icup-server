import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RoleProtected } from '@/modules/auth/decorators';
import { UserRoleGuard } from '@/modules/auth/guards';
import { ValidUserRoles } from '@/modules/auth/enums';

export function Auth(...roles: ValidUserRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
