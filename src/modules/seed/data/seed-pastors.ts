interface SeedPastor {
  //* General Info
  firstNames: string;
  lastNames: string;
  gender: string;
  originCountry: string;
  birthDate: Date;
  age?: number;
  maritalStatus: string;
  numberChildren?: string;
  conversionDate?: Date;

  //* Contact info
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
  theirChurch?: string;
}

interface SeedDataPastors {
  pastors: SeedPastor[];
}

export const dataPastors: SeedDataPastors = {
  pastors: [
    {
      firstNames: 'Daniel Jesus',
      lastNames: 'Perez Torres',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1970-12-08'),
      maritalStatus: 'married',
      numberChildren: '4',
      conversionDate: new Date('2006-03-10'),
      email: 'daniel.perez@google.com',
      phoneNumber: '+51 999-555-578',
      residenceDistrict: 'Comas',
      residenceUrbanSector: 'La Merced',
      residenceAddress: 'Jr. Las flores 125',
      referenceAddress: 'Casa blanca al frente del colegio Maria Parado.',
      roles: ['pastor'],
    },
    {
      firstNames: 'Michael Rodrigo',
      lastNames: 'Vega Rosales',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1968-08-25'),
      maritalStatus: 'married',
      numberChildren: '3',
      conversionDate: new Date('2005-06-05'),
      email: 'michael.vega@google.com',
      phoneNumber: '+51 990-555-876',
      residenceDistrict: 'Independencia',
      residenceUrbanSector: 'Tahuantinsuyo',
      residenceAddress: 'Jr. Tamputoco 100',
      referenceAddress: 'A 2 cuadras del parque cantuta.',
      roles: ['pastor'],
    },
    {
      firstNames: 'Carlos Antonio',
      lastNames: 'Prado Torrealva',
      gender: 'male',
      originCountry: 'Perú',
      birthDate: new Date('1978-05-20'),
      maritalStatus: 'married',
      numberChildren: '2',
      conversionDate: new Date('2010-07-15'),
      email: 'carlos.prado@google.com',
      phoneNumber: '+51 923-420-123',
      residenceDistrict: 'Los Olivos',
      residenceUrbanSector: 'Villa Sol',
      residenceAddress: 'Av. Central Industrial 500',
      referenceAddress: 'A 2 cuadras del mercado productores.',
      roles: ['pastor'],
    },
  ],
};
