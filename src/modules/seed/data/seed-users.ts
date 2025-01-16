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
      firstNames: 'User',
      lastNames: 'Test 1',
      email: 'user.test1@icup.com',
      gender: 'female',
      password: bcrypt.hashSync('Abcd1234$', 10),
      roles: ['admin-user'],
    },
    {
      firstNames: 'User',
      lastNames: 'Test 2',
      email: 'user.test2@icup.com',
      gender: 'male',
      password: bcrypt.hashSync('Abcd1234%', 10),
      roles: ['admin-user'],
    },
    {
      firstNames: 'User',
      lastNames: 'Test 3',
      email: 'user.test3@icup.com',
      gender: 'female',
      password: bcrypt.hashSync('Abcd1234&', 10),
      roles: ['admin-user'],
    },
  ],
};
