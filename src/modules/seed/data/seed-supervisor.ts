interface SeedSupervisor {
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
  isDirectRelationToPastor: boolean;

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
  theirCopastor?: string;
  theirPastor?: string;
}

interface SeedDataSupervisors {
  supervisors: SeedSupervisor[];
}

//! Data Supervisors
export const dataSupervisors: SeedDataSupervisors = {
  supervisors: [
    {
      firstNames: 'Gabriela',
      lastNames: 'Fernandez Torres',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1989-09-03'),
      maritalStatus: 'married',
      numberChildren: 3,
      conversionDate: new Date('2007-11-20'),
      email: 'gabriela.fernandez@google.com',
      phoneNumber: '+1-234-5678',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Av. Los Nogales 890',
      referenceAddress: 'Frente al parque zonal',
      roles: ['supervisor'],
      isDirectRelationToPastor: false,
    },
    {
      firstNames: 'Juan',
      lastNames: 'Lopez Martinez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1984-05-16'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2005-08-30'),
      email: 'juan.lopez@google.com',
      phoneNumber: '+1-678-9012',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Las Acacias 567',
      referenceAddress: 'Cerca del mercado municipal',
      roles: ['supervisor'],
      isDirectRelationToPastor: false,
    },
    {
      firstNames: 'Sandra',
      lastNames: 'Ramirez Silva',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1993-02-12'),
      maritalStatus: 'divorced',
      numberChildren: 1,
      conversionDate: new Date('2011-03-25'),
      email: 'sandra.ramirez@google.com',
      phoneNumber: '+1-890-1234',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Av. Las Hortensias 234',
      referenceAddress: 'Cerca del parque industrial',
      roles: ['supervisor'],
      isDirectRelationToPastor: false,
    },
    {
      firstNames: 'Ricardo',
      lastNames: 'Gomez Diaz',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1981-07-30'),
      maritalStatus: 'married',
      numberChildren: 2,
      conversionDate: new Date('2002-12-15'),
      email: 'ricardo.gomez@google.com',
      phoneNumber: '+1-345-6789',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Unificada',
      residenceAddress: 'Jr. Los Laureles 890',
      referenceAddress: 'Al lado del centro educativo',
      roles: ['supervisor'],
      isDirectRelationToPastor: false,
    },
    {
      firstNames: 'Maria',
      lastNames: 'Perez Rodriguez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1990-11-25'),
      maritalStatus: 'widowed',
      numberChildren: 4,
      conversionDate: new Date('2008-06-20'),
      email: 'maria.perez@google.com',
      phoneNumber: '+1-901-2345',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Industrial',
      residenceAddress: 'Av. Los Cipreses 567',
      referenceAddress: 'Frente a la fábrica textil',
      roles: ['supervisor'],
      isDirectRelationToPastor: false,
    },
    {
      firstNames: 'Diego',
      lastNames: 'Castro Alvarez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1987-04-20'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2006-10-10'),
      email: 'diego.castro@google.com',
      phoneNumber: '+1-012-3456',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Las Orquídeas 123',
      referenceAddress: 'Cerca del parque zonal',
      roles: ['supervisor'],
      isDirectRelationToPastor: false,
    },
  ],
};
