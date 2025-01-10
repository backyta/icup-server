import * as bcrypt from 'bcrypt';

interface SeedUser {
  email: string;
  firstNames: string;
  lastNames: string;
  gender: string;
  password: string;
  roles: string[];
}

interface SeedDataUsers {
  users: SeedUser[];
}

export const dataUsers: SeedDataUsers = {
  users: [
    {
      firstNames: 'Luisa Maria',
      lastNames: 'Torres Zapata',
      email: 'luisa@google.com',
      gender: 'female',
      password: bcrypt.hashSync('Abc1234$', 10),
      roles: ['admin-user'],
    },
    {
      firstNames: 'Eva Daniela',
      lastNames: 'Carranza Valle',
      email: 'eva@google.com',
      gender: 'female',
      password: bcrypt.hashSync('Abc1234$', 10),
      roles: ['treasurer-user'],
    },
    {
      firstNames: 'Luz Estrella',
      lastNames: 'Vallejo Zambrano',
      email: 'luz@google.com',
      gender: 'female',
      password: bcrypt.hashSync('Abc1234$', 10),
      roles: ['user'],
    },
  ],
};
