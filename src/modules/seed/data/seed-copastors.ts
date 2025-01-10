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
      phoneNumber: '+1-623-1091',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Av. Cariancha 231',
      referenceAddress: 'A 2 cuadras del colegio',
      roles: ['copastor'],
    },
    {
      firstNames: 'Eduardo',
      lastNames: 'Cordova Flores',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1992-08-21'),
      maritalStatus: 'single',
      numberChildren: 0,
      conversionDate: new Date('2010-05-12'),
      email: 'eduardo.cordova@google.com',
      phoneNumber: '+1-567-9876',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Av. Los Pinos 512',
      referenceAddress: 'Frente a la plaza central',
      roles: ['copastor'],
    },
    {
      firstNames: 'Carla',
      lastNames: 'Gomez Rodriguez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1985-12-10'),
      maritalStatus: 'married',
      numberChildren: 3,
      conversionDate: new Date('2005-06-30'),
      email: 'carla.gomez@google.com',
      phoneNumber: '+1-987-6543',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Jr. Los Alamos 321',
      referenceAddress: 'Cerca del mercado municipal',
      roles: ['copastor'],
    },
    {
      firstNames: 'Julio',
      lastNames: 'Vargas Medina',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1978-04-03'),
      maritalStatus: 'widowed',
      numberChildren: 2,
      conversionDate: new Date('2000-11-17'),
      email: 'julio.vargas@google.com',
      phoneNumber: '+1-234-5678',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Payet',
      residenceAddress: 'Av. Los Jazmines 456',
      referenceAddress: 'Cerca del parque infantil',
      roles: ['copastor'],
    },
    {
      firstNames: 'Ana',
      lastNames: 'Torres Gutierrez',
      gender: 'female',
      originCountry: 'Perú',
      birthDate: new Date('1990-02-28'),
      maritalStatus: 'married',
      numberChildren: 1,
      conversionDate: new Date('2009-09-05'),
      email: 'ana.torres@google.com',
      phoneNumber: '+1-876-5432',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Ermitaño',
      residenceAddress: 'Jr. Los Rosales 789',
      referenceAddress: 'A una cuadra de la iglesia',
      roles: ['copastor'],
    },
    {
      firstNames: 'Pedro',
      lastNames: 'Soto Chavez',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1982-11-17'),
      maritalStatus: 'married',
      numberChildren: 4,
      conversionDate: new Date('2003-08-12'),
      email: 'pedro.soto@google.com',
      phoneNumber: '+1-432-1098',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Av. Los Laureles 123',
      referenceAddress: 'Al lado del colegio San Miguel',
      roles: ['copastor'],
    },
  ],
};
