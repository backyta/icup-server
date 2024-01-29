import { SetMetadata } from '@nestjs/common';
import { ValidUserRoles } from '../enums/valid-user-roles.enum';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidUserRoles[]) => {
  return SetMetadata(META_ROLES, args);
};
