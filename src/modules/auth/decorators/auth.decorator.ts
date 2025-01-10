import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserRole } from '@/modules/auth/enums/user-role.enum';
import { UserRoleGuard } from '@/modules/auth/guards/user-role.guard';
import { RoleProtected } from '@/modules/auth/decorators/role-protected.decorator';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}

// RoleProtected() -> Used to establish the allowed roles in the metadata
// AuthGuard() -> Used to validate with the jwtStrategy and adds the user to the request
// UserRoleGuard() -> Used to remove the user from context and role metadata and validate and allow access
