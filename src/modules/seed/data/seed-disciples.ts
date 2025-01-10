interface SeedDisciples {
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
  theirFamilyGroup?: string;
}

//? Array Interfaces
interface SeedDataMembers {
  disciples: SeedDisciples[];
}

//! Data Disciples
export const dataDisciples: SeedDataMembers = {
  disciples: [
    {
      firstNames: 'Carlos',
      lastNames: 'Gonzales Huaman',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1990-12-05'),
      maritalStatus: 'single',
      numberChildren: 3,
      conversionDate: new Date('2008-07-20'),
      email: 'carlos.gonzales@google.com',
      phoneNumber: '+1-567-8901',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Los Pinos 123',
      referenceAddress: 'Frente al parque zonal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Daniela',
      lastNames: 'Rojas Gutierrez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1995-09-18'),
      maritalStatus: 'single',
      numberChildren: 2,
      conversionDate: new Date('2013-02-10'),
      email: 'daniela.rojas@google.com',
      phoneNumber: '+1-890-1234',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Av. Los Girasoles 456',
      referenceAddress: 'Cerca del mercado municipal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Mateo',
      lastNames: 'Lopez Sanchez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('2002-05-10'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2018-09-15'),
      email: 'mateo.lopez@google.com',
      phoneNumber: '+1-234-5678',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Las Orquídeas 789',
      referenceAddress: 'A una cuadra del colegio',
      roles: ['disciple'],
    },
    {
      firstNames: 'Valentina',
      lastNames: 'Garcia Flores',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('2007-11-30'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2022-02-18'),
      email: 'valentina.garcia@google.com',
      phoneNumber: '+1-901-2345',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Av. Las Hortensias 890',
      referenceAddress: 'Frente al parque industrial',
      roles: ['disciple'],
    },
    {
      firstNames: 'Pedro',
      lastNames: 'Martinez Castillo',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('2010-03-15'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2025-01-20'),
      email: 'pedro.martinez@google.com',
      phoneNumber: '+1-345-6789',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Jr. Los Laureles 234',
      referenceAddress: 'Al lado del centro educativo',
      roles: ['disciple'],
    },
    {
      firstNames: 'Ana',
      lastNames: 'Malpartida Ramirez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1998-08-21'),
      maritalStatus: 'single',
      numberChildren: 1,
      conversionDate: new Date('2016-07-05'),
      email: 'ana.malpartida@google.com',
      phoneNumber: '+1-567-8901',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Av. Los Jazmines 567',
      referenceAddress: 'Cerca del parque zonal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Diego',
      lastNames: 'Alvarez Garcia',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('2004-12-10'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2020-05-15'),
      email: 'diego.alvarez@google.com',
      phoneNumber: '+1-678-9012',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Jr. Las Acacias 890',
      referenceAddress: 'Frente al centro deportivo',
      roles: ['disciple'],
    },
    {
      firstNames: 'Lucía',
      lastNames: 'Amaranto Gutierrez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('2001-04-25'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2019-10-20'),
      email: 'lucia.amaranto@google.com',
      phoneNumber: '+1-234-5678',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Av. Las Rosas 123',
      referenceAddress: 'Frente a la plaza central',
      roles: ['disciple'],
    },
    {
      firstNames: 'Eduardo',
      lastNames: 'Palacios Castillo',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('2006-09-18'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2022-08-15'),
      email: 'eduardo.palacios@google.com',
      phoneNumber: '+1-890-1234',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Los Pinos 456',
      referenceAddress: 'Al lado del parque zonal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Sofía',
      lastNames: 'Gonzales Ramirez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('2009-07-30'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2024-12-20'),
      email: 'sofia.gonzales@google.com',
      phoneNumber: '+1-901-2345',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Av. Los Nogales 890',
      referenceAddress: 'Frente al parque industrial',
      roles: ['disciple'],
    },
    {
      firstNames: 'Javier',
      lastNames: 'Fernandez Torres',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('2012-02-08'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2028-09-10'),
      email: 'javier.fernandez@google.com',
      phoneNumber: '+1-567-8901',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Las Margaritas 678',
      referenceAddress: 'Frente al centro comercial',
      roles: ['disciple'],
    },
    {
      firstNames: 'Camila',
      lastNames: 'Martinez Garcia',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('2015-05-20'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2031-11-15'),
      email: 'camila.martinez@google.com',
      phoneNumber: '+1-234-5678',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Av. Los Laureles 234',
      referenceAddress: 'Cerca del parque zonal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Juanito',
      lastNames: 'Lopez Ramirez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1992-09-12'),
      maritalStatus: 'single',
      numberChildren: 2,
      conversionDate: new Date('2034-03-20'),
      email: 'juanito.lopez@google.com',
      phoneNumber: '+1-890-1234',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Jr. Los Pinos 345',
      referenceAddress: 'Cerca del parque industrial',
      roles: ['disciple'],
    },
    {
      firstNames: 'Valeria',
      lastNames: 'Gomez Torres',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('2000-11-18'),
      maritalStatus: 'single',
      numberChildren: 1,
      conversionDate: new Date('2029-07-05'),
      email: 'valeria.gomez@google.com',
      phoneNumber: '+1-901-2345',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Av. Las Orquídeas 456',
      referenceAddress: 'Frente al centro de salud',
      roles: ['disciple'],
    },
    {
      firstNames: 'Dieguito',
      lastNames: 'Hernandez Garcia',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1989-07-30'),
      maritalStatus: 'single',
      numberChildren: 3,
      conversionDate: new Date('2032-12-20'),
      email: 'dieguito.hernandez@google.com',
      phoneNumber: '+1-345-6789',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Jr. Las Rosas 567',
      referenceAddress: 'Cerca del mercado municipal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Laura',
      lastNames: 'Perez Gutierrez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('2001-08-25'),
      maritalStatus: 'single',
      numberChildren: 1,
      conversionDate: new Date('2035-04-15'),
      email: 'laura.perez@google.com',
      phoneNumber: '+1-678-9012',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Av. Las Acacias 678',
      referenceAddress: 'Frente al parque zonal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Pedrito',
      lastNames: 'Gutierrez Martinez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1995-10-10'),
      maritalStatus: 'single',
      numberChildren: 2,
      conversionDate: new Date('2033-06-20'),
      email: 'pedrito.gutierrez@google.com',
      phoneNumber: '+1-789-0123',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Los Nogales 789',
      referenceAddress: 'Frente al mercado municipal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Abril',
      lastNames: 'Sanchez Diaz',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1985-03-15'),
      maritalStatus: 'single',
      numberChildren: 4,
      conversionDate: new Date('2030-09-10'),
      email: 'abril.sanchez@google.com',
      phoneNumber: '+1-012-3456',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Av. Los Cedros 890',
      referenceAddress: 'Cerca del parque industrial',
      roles: ['disciple'],
    },
    {
      firstNames: 'Marcos',
      lastNames: 'Rodriguez Gutierrez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1988-12-05'),
      maritalStatus: 'single',
      numberChildren: 5,
      conversionDate: new Date('2036-07-20'),
      email: 'marcos.rodriguez@google.com',
      phoneNumber: '+1-345-6789',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Jr. Las Margaritas 123',
      referenceAddress: 'Al lado del parque zonal',
      roles: ['disciple'],
    },
    {
      firstNames: 'Alejandra',
      lastNames: 'Martinez Flores',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('2000-11-20'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2027-02-15'),
      email: 'alejandra.martinez@google.com',
      phoneNumber: '+1-678-9012',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Av. Las Orquídeas 890',
      referenceAddress: 'Cerca del centro de salud',
      roles: ['disciple'],
    },
  ],
};
