interface SeedCopastor {
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
  theirPastor?: string;
}

interface SeedDataCopastors {
  copastors: SeedCopastor[];
}

//! Data Copastors
export const dataCopastors: SeedDataCopastors = {
  copastors: [
    //* Comas
    {
      firstNames: 'Julio Marcos',
      lastNames: 'Vargas Medina',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1978-04-03'),
      maritalStatus: 'widowed',
      numberChildren: 2,
      conversionDate: new Date('2000-11-17'),
      email: 'julio.vargas@google.com',
      phoneNumber: '+51 985-122-999',
      residenceDistrict: 'Comas',
      residenceUrbanSector: 'La Merced',
      residenceAddress: 'Av. Los Jazmines 456',
      referenceAddress: 'Cerca del parque infantil.',
      roles: ['copastor'],
    },
    {
      firstNames: 'Ana Martha',
      lastNames: 'Torres Gutierrez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1990-02-28'),
      maritalStatus: 'married',
      numberChildren: 1,
      conversionDate: new Date('2009-09-05'),
      email: 'ana.torres@google.com',
      phoneNumber: '+51 999-888-222',
      residenceDistrict: 'Comas',
      residenceUrbanSector: 'Santa Luzmila',
      residenceAddress: 'Jr. Los Rosales 789',
      referenceAddress: 'A una cuadra de la iglesia.',
      roles: ['copastor'],
    },
    {
      firstNames: 'Pedro Kevin',
      lastNames: 'Soto Chavez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1982-11-17'),
      maritalStatus: 'married',
      numberChildren: 4,
      conversionDate: new Date('2003-08-12'),
      email: 'pedro.soto@google.com',
      phoneNumber: '+51 999-222-333',
      residenceDistrict: 'Comas',
      residenceUrbanSector: 'El Retablo',
      residenceAddress: 'Av. Los Laureles 123',
      referenceAddress: 'Al lado del colegio San Miguel.',
      roles: ['copastor'],
    },
     //* Independencia
     {
      firstNames: 'Luz Mariella',
      lastNames: 'Salgado Huaman',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1987-03-15'),
      maritalStatus: 'married',
      numberChildren: 2,
      conversionDate: new Date('2007-03-15'),
      email: 'luz.salgado@google.com',
      phoneNumber: '+51 999-224-325',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Av. Cariancha 231',
      referenceAddress: 'A 2 cuadras del colegio.',
      roles: ['copastor'],
    },
    {
      firstNames: 'Eduardo Gaspar',
      lastNames: 'Cordova Flores',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1992-08-21'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2010-05-12'),
      email: 'eduardo.cordova@google.com',
      phoneNumber: '+51 999-224-325',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Av. Los Pinos 512',
      referenceAddress: 'Frente a la plaza central.',
      roles: ['copastor'],
    },
    {
      firstNames: 'Carla Angela',
      lastNames: 'Gomez Rodriguez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1985-12-10'),
      maritalStatus: 'married',
      numberChildren: 3,
      conversionDate: new Date('2005-06-30'),
      email: 'carla.gomez@google.com',
      phoneNumber: '+51 999-224-325',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Jr. Los Alamos 321',
      referenceAddress: 'Cerca del mercado municipal.',
      roles: ['copastor'],
    },
    //* Los Olivos
    {
      firstNames: 'Marcos Brian',
      lastNames: 'Paredes Gutiérrez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1988-11-22'),
      maritalStatus: 'married',
      numberChildren: 3,
      conversionDate: new Date('2012-08-14'),
      email: 'marcos.paredes@gmail.com',
      phoneNumber: '+51 999-224-325',
      residenceDistrict: 'Los Olivos',
      residenceUrbanSector: 'Infantas',
      residenceAddress: 'Jr. Lima 456',
      referenceAddress: 'Cerca de la tienda Plaza Vea.',
      roles: ['copastor'],
    },
    {
      firstNames: 'Raquel Karina',
      lastNames: 'González Torres',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1994-03-10'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2016-12-05'),
      email: 'raquel.gonzalez@outlook.com',
      phoneNumber: '+51 999-224-325',
      residenceDistrict: 'Los Olivos',
      residenceUrbanSector: 'El Naranjal',
      residenceAddress: 'Av. Las Flores 123',
      referenceAddress: 'Cerca de la comisaría.',
      roles: ['copastor'],
    },
    {
      firstNames: 'Fernando Miguel',
      lastNames: 'Álvarez Romero',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1976-06-29'),
      maritalStatus: 'widowed',
      numberChildren: 1,
      conversionDate: new Date('2001-05-25'),
      email: 'fernando.alvarez@icloud.com',
      phoneNumber: '+51 999-224-325',
      residenceDistrict: 'Los Olivos',
      residenceUrbanSector: 'Covida',
      residenceAddress: 'Calle Los Jazmines 89',
      referenceAddress: 'Cerca de la iglesia de San Juan.',
      roles: ['copastor'],
    },
  ],
};
