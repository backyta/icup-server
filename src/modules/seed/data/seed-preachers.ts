interface SeedPreacher {
  //* General Info
  firstNames: string;
  lastNames: string;
  gender: string;
  originCountry: string;
  birthDate: Date;
  age?: number;
  maritalStatus: string;
  numberChildren?: number;
  conversionDate?: Date;

  //* Contact Info
  email: string;
  phoneNumber: string;
  residenceCountry?: string;
  residenceDepartment?: string;
  residenceProvince?: string;
  residenceDistrict: string;
  residenceUrbanSector: string;
  residenceAddress: string;
  referenceAddress: string;
  roles: string[];
  recordStatus?: string;

  //* Relations
  theirSupervisor?: string;
}

interface SeedDataPreachers {
  preachers: SeedPreacher[];
}

export const dataPreachers: SeedDataPreachers = {
  preachers: [
    {
      firstNames: 'Marcelo',
      lastNames: 'Quispe Ramos',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1980-07-08'),
      maritalStatus: 'divorced',
      numberChildren: 2,
      conversionDate: new Date('2001-09-15'),
      email: 'marcelo.quispe@google.com',
      phoneNumber: '+1-456-7890',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Unificada',
      residenceAddress: 'Av. Los Girasoles 678',
      referenceAddress: 'Cerca del centro comercial',
      roles: ['preacher'],
    },
    {
      firstNames: 'Susana',
      lastNames: 'Flores Diaz',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1995-11-30'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2013-04-20'),
      email: 'susana.flores@google.com',
      phoneNumber: '+1-890-1234',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Los Pinos 890',
      referenceAddress: 'Frente al parque zonal',
      roles: ['preacher'],
    },
    {
      firstNames: 'Raul',
      lastNames: 'Gutierrez Torres',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1976-04-18'),
      maritalStatus: 'widowed',
      numberChildren: 3,
      conversionDate: new Date('1998-12-10'),
      email: 'raul.gutierrez@google.com',
      phoneNumber: '+1-678-9012',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Av. Los Cerezos 345',
      referenceAddress: 'Cerca del colegio San Jose',
      roles: ['preacher'],
    },
    {
      firstNames: 'Jorge',
      lastNames: 'Mendoza Lopez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1983-09-25'),
      maritalStatus: 'married',
      numberChildren: 1,
      conversionDate: new Date('2004-08-05'),
      email: 'jorge.mendoza@google.com',
      phoneNumber: '+1-234-5678',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Jr. Los Olivos 567',
      referenceAddress: 'Al lado del centro de salud',
      roles: ['preacher'],
    },
    {
      firstNames: 'Veronica',
      lastNames: 'Sanchez Silva',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1991-12-12'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2010-10-20'),
      email: 'veronica.sanchez@google.com',
      phoneNumber: '+1-345-6789',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Industrial',
      residenceAddress: 'Av. Los Claveles 123',
      referenceAddress: 'Frente a la fábrica de muebles',
      roles: ['preacher'],
    },
    {
      firstNames: 'Manuel',
      lastNames: 'Diaz Medina',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1987-05-03'),
      maritalStatus: 'married',
      numberChildren: 4,
      conversionDate: new Date('2009-07-15'),
      email: 'manuel.diaz@google.com',
      phoneNumber: '+1-901-2345',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Las Orquídeas 890',
      referenceAddress: 'A una cuadra del mercado',
      roles: ['preacher'],
    },
    {
      firstNames: 'Natalia',
      lastNames: 'Chavez Castillo',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1986-08-19'),
      maritalStatus: 'married',
      numberChildren: 2,
      conversionDate: new Date('2007-06-25'),
      email: 'natalia.chavez@google.com',
      phoneNumber: '+1-567-8901',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Av. Los Cedros 456',
      referenceAddress: 'Cerca del parque principal',
      roles: ['preacher'],
    },
    {
      firstNames: 'Carlos',
      lastNames: 'Hernandez Perez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1979-01-14'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2000-11-30'),
      email: 'carlos.hernandez@google.com',
      phoneNumber: '+1-678-9012',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Unificada',
      residenceAddress: 'Jr. Las Azucenas 789',
      referenceAddress: 'Cerca del centro deportivo',
      roles: ['preacher'],
    },
    {
      firstNames: 'Mariana',
      lastNames: 'Alvarez Ramirez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1984-06-28'),
      maritalStatus: 'divorced',
      numberChildren: 1,
      conversionDate: new Date('2003-04-15'),
      email: 'mariana.alvarez@google.com',
      phoneNumber: '+1-345-6789',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Av. Las Margaritas 234',
      referenceAddress: 'Frente al supermercado',
      roles: ['preacher'],
    },
    {
      firstNames: 'Roberto',
      lastNames: 'Garcia Gonzales',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1977-03-05'),
      maritalStatus: 'widowed',
      numberChildren: 5,
      conversionDate: new Date('1999-10-10'),
      email: 'roberto.garcia@google.com',
      phoneNumber: '+1-012-3456',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Industrial',
      residenceAddress: 'Jr. Los Lirios 678',
      referenceAddress: 'Cerca del hospital',
      roles: ['preacher'],
    },
  ],
};
