import { SetMetadata } from '@nestjs/common';
import { ValidUserRoles } from '@/modules/auth/enums';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidUserRoles[]) => {
  return SetMetadata(META_ROLES, args);
};
