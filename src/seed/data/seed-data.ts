interface SeedMember {
  //* General Info
  first_name: string;
  last_name: string;
  date_birth: string | Date;
  email?: string;
  is_active?: boolean;
  gender: string;
  marital_status: string;
  number_children?: number;
  phone?: string;
  date_joining?: string | Date;
  origin_country: string;
  roles: string[];

  //* Info Member adress
  residence_country?: string;
  departament?: string;
  province?: string;
  district: string;
  address: string;

  //* Relations
  their_family_home?: string;
  their_pastor?: string;
  their_copastor?: string;
  their_preacher?: string;
}

interface SeedData {
  members: SeedMember[];
}

export const dataMembersPastor: SeedData = {
  members: [
    {
      first_name: 'Michael Rodrigo',
      last_name: 'Vega Rosales',
      date_birth: '1968-08-25',
      email: 'michael.vega@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 3,
      phone: '+1-555-9876',
      date_joining: '2011-06-05',
      origin_country: 'Peru',
      roles: ['pastor', 'member'],
      district: 'Independencia',
      address: 'Jr. Tamputoco 100',
    },
    {
      first_name: 'Daniel Jesus',
      last_name: 'Perez Torres',
      date_birth: '1970-12-08',
      email: 'daniel.perez@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 3,
      phone: '+1-555-5678',
      date_joining: '2012-03-10',
      origin_country: 'Peru',
      roles: ['pastor', 'member'],
      district: 'Comas',
      address: 'Jr. Las flores 125',
    },
    {
      first_name: 'Carlos Antonio',
      last_name: 'Martinez Julian',
      date_birth: '1978-05-20',
      email: 'carlos.martinez@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-555-1234',
      date_joining: '2010-07-15',
      origin_country: 'Peru',
      roles: ['pastor', 'member'],
      district: 'Carabayllo',
      address: 'Av. Tupac Amaru 500',
    },
  ],
};

export const dataMembersCopastor: SeedData = {
  members: [
    {
      first_name: 'Luz Mariella',
      last_name: 'Salgado Huaman',
      date_birth: '1987-03-15',
      email: 'luz.salgado@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-623-1091',
      date_joining: '2007-03-15',
      origin_country: 'Peru',
      roles: ['copastor', 'member'],
      district: 'Independencia',
      address: 'Av. Coricancha 231',
    },
    {
      first_name: 'Maria Mercedes',
      last_name: 'Quispe Ramirez',
      date_birth: '1979-09-22',
      email: 'maria.quispe@google.com',
      gender: 'female',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-235-7520',
      date_joining: '2010-09-22',
      origin_country: 'Peru',
      roles: ['copastor', 'member'],
      district: 'Independencia',
      address: 'Jr. Tamputoco 809',
    },
    {
      first_name: 'Liliana Rosario',
      last_name: 'Rivera Geranio',
      date_birth: '1985-06-10',
      email: 'lili.rivera@google.com',
      gender: 'female',
      marital_status: 'widowed',
      number_children: 1,
      phone: '+1-400-1602',
      date_joining: '2006-06-10',
      origin_country: 'Peru',
      roles: ['copastor', 'member'],
      district: 'Independencia',
      address: 'Av. Antisuyo 241',
    },
    {
      first_name: 'Melisa Eva',
      last_name: 'Camarena Ventura',
      date_birth: '1978-12-05',
      email: 'melisa.camarena@google.com',
      gender: 'female',
      marital_status: 'widowed',
      number_children: 2,
      phone: '+1-208-2065',
      date_joining: '2008-12-05',
      origin_country: 'Peru',
      roles: ['copastor', 'member'],
      district: 'Comas',
      address: 'Av. San felipe 1200',
    },
    {
      first_name: 'Dylan Caleb',
      last_name: 'Gonzales Quispe',
      date_birth: '1982-02-18',
      email: 'dylan.gonzales@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 1,
      phone: '+1-156-2061',
      date_joining: '2011-02-18',
      origin_country: 'Peru',
      roles: ['copastor', 'member'],
      district: 'Comas',
      address: 'Av. Pascana 200',
    },
    {
      first_name: 'Alberto Julian',
      last_name: 'Fuentes Fiestas',
      date_birth: '1975-11-30',
      email: 'alberto.fuentes@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 3,
      phone: '+1-201-5260',
      date_joining: '2009-11-30',
      origin_country: 'Peru',
      roles: ['copastor', 'member'],
      district: 'Carabayllo',
      address: 'Jr. Rosales Nieto 125',
    },
    {
      first_name: 'Marcelo Benito',
      last_name: 'Palomares Garcia',
      date_birth: '1972-02-22',
      email: 'marcelo.palomares@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-202-1055',
      date_joining: '2011-04-15',
      origin_country: 'Peru',
      roles: ['copastor', 'member'],
      district: 'Carabayllo',
      address: 'Av. Mercado Central 2200',
    },
  ],
};
