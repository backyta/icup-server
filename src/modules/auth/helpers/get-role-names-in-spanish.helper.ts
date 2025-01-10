import { UserRoleNames } from '@/modules/auth/enums/user-role.enum';

export const getRoleNamesInSpanish = (validUserRoles: string[]): string => {
  return validUserRoles
    .map((role) => {
      return UserRoleNames[role] ?? role;
    })
    .join(' o ');
};
