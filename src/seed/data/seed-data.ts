import * as bcrypt from 'bcrypt';
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

  //* Info Member address
  residence_country?: string;
  department?: string;
  province?: string;
  district: string;
  address: string;

  //* Relations
  their_family_home?: string;
  their_pastor?: string;
  their_copastor?: string;
  their_preacher?: string;
}
interface SeedFamilyHome {
  //* General Info
  zone: string;
  name_home?: string;

  //* Info Home address
  province?: string;
  district: string;
  address: string;
  is_active?: boolean;

  //* Relations
  their_preacher: string;
}
interface SeedOffering {
  //* General Info
  type: string;
  sub_type?: string;
  amount: number;
  currency: string;
  comments?: string;
  url_file?: string;

  //* Relations
  member_id?: string;
  family_home_id?: string;
  copastor_id?: string;
}

interface SeedUser {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  roles: string[];
}

interface SeedDataUser {
  users: SeedUser[];
}
interface SeedDataMember {
  members: SeedMember[];
}

interface SeedDataHouses {
  houses: SeedFamilyHome[];
}
interface SeedDataOffering {
  offerings: SeedOffering[];
}

//! Data Users
export const dataUsers: SeedDataUser = {
  users: [
    {
      email: 'luisa@google.com',
      first_name: 'Luisa Maria',
      last_name: 'Torres Zapata',
      password: bcrypt.hashSync('Abc1234', 10),
      roles: ['admin-user'],
    },
    {
      email: 'eva@google.com',
      first_name: 'Eva Daniela',
      last_name: 'Carranza Valle',
      password: bcrypt.hashSync('Abc1234', 10),
      roles: ['treasurer-user'],
    },
    {
      email: 'luz@google.com',
      first_name: 'Luz Estrella',
      last_name: 'Vallejo Zambrano',
      password: bcrypt.hashSync('Abc1234', 10),
      roles: ['user'],
    },
  ],
};

//! Data Member-Pastor
export const dataMembersPastor: SeedDataMember = {
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
      last_name: 'Prado Torrealva',
      date_birth: '1978-05-20',
      email: 'carlos.prado@google.com',
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

//! Data Member-Copastor
export const dataMembersCopastor: SeedDataMember = {
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
      gender: 'male',
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
      gender: 'male',
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
      gender: 'male',
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

//! Data Member-Preacher
export const dataMembersPreacher: SeedDataMember = {
  members: [
    //* Independencia District
    {
      first_name: 'Juan Carlos',
      last_name: 'Diaz Rodriguez',
      date_birth: '1982-04-15',
      email: 'juan.diaz@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 3,
      phone: '+1-789-4567',
      date_joining: '2006-09-28',
      origin_country: 'Peru',
      roles: ['preacher', 'member'],
      district: 'Independencia',
      address: 'Av. Libertadores 123',
    },
    {
      first_name: 'Ana Maria',
      last_name: 'Lopez Fernandez',
      date_birth: '1989-12-08',
      email: 'ana.lopez@google.com',
      gender: 'female',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-987-6543',
      date_joining: '2010-02-14',
      origin_country: 'Peru',
      roles: ['preacher', 'member'],
      district: 'Independencia',
      address: 'Calle Los Olivos 789',
    },
    {
      first_name: 'Diego Alejandro',
      last_name: 'Fernandez Soto',
      date_birth: '1975-06-20',
      email: 'diego.fernandez@google.com',
      gender: 'male',
      marital_status: 'windowed',
      number_children: 1,
      phone: '+1-567-8901',
      date_joining: '2004-03-10',
      origin_country: 'Peru',
      roles: ['preacher', 'member'],
      district: 'Independencia',
      address: 'Av. Los Pinos 567',
    },

    //* Comas District
    {
      first_name: 'Eduardo Jose',
      last_name: 'Vega Castillo',
      date_birth: '1980-09-28',
      email: 'eduardo.vega@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-890-1234',
      date_joining: '2005-06-15',
      origin_country: 'Peru',
      roles: ['preacher', 'member'],
      district: 'Comas',
      address: 'Av. Los Pinos 567',
    },
    {
      first_name: 'Laura Patricia',
      last_name: 'Ramirez Torres',
      date_birth: '1987-04-22',
      email: 'laura.ramirez@google.com',
      gender: 'female',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-345-6789',
      date_joining: '2010-03-08',
      origin_country: 'Peru',
      roles: ['preacher', 'member'],
      district: 'Comas',
      address: 'Calle Lima 890',
    },

    //* Carabayllo District
    {
      first_name: 'Gabriela Sofia',
      last_name: 'Lopez Paredes',
      date_birth: '1983-05-18',
      email: 'gabriela.lopez@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-567-8901',
      date_joining: '2006-12-02',
      origin_country: 'Peru',
      roles: ['preacher', 'member'],
      district: 'Carabayllo',
      address: 'Av. Los Pinos 567',
    },
    {
      first_name: 'Alejandro',
      last_name: 'Torres Mendoza',
      date_birth: '1979-09-12',
      email: 'alejandro.torres@google.com',
      gender: 'male',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-123-4567',
      date_joining: '2005-07-22',
      origin_country: 'Peru',
      roles: ['preacher', 'member'],
      district: 'Carabayllo',
      address: 'Calle Lima 890',
    },
  ],
};

//! Data Family Houses
export const dataFamilyHouses: SeedDataHouses = {
  houses: [
    //* Houses Independencia
    {
      zone: 'A',
      name_home: 'Guardianes de la Fe',
      province: 'Lima',
      district: 'Independencia',
      address: 'Av. La Esperanza 234',
      their_preacher: 'id_test',
    },

    {
      zone: 'B',
      name_home: 'Siervos del Señor',
      province: 'Lima',
      district: 'Independencia',
      address: 'Av. La Bendición 456',
      their_preacher: 'id_test',
    },

    {
      zone: 'C',
      name_home: 'Testigos del Cielo',
      province: 'Lima',
      district: 'Independencia',
      address: 'Jr. La Devoción 202',
      their_preacher: 'id_test',
    },

    //* House Comas
    {
      zone: 'X',
      name_home: 'Guerreros del Amor',
      province: 'Lima',
      district: 'Comas',
      address: 'Av. La Paz 111',
      their_preacher: 'id_test',
    },

    {
      zone: 'Z',
      name_home: 'Soldados de la Justicia',
      province: 'Lima',
      district: 'Comas',
      address: 'Jr. La Victoria 444',
      their_preacher: 'id_test',
    },

    //* Hoses Carabayllo
    {
      zone: 'R',
      name_home: 'Guardianes de la Paz',
      province: 'Lima',
      district: 'Carabayllo',
      address: 'Av. La Solidaridad 111',
      their_preacher: 'id_test',
    },

    {
      zone: 'Q',
      name_home: 'Soldados del Horizonte',
      province: 'Lima',
      district: 'Carabayllo',
      address: 'Jr. La Esperanza 444',
      their_preacher: 'id_test',
    },
  ],
};

//! Data General Members
export const dataMembers: SeedDataMember = {
  members: [
    //* Members Indenpendencia
    {
      first_name: 'Maria Isabel',
      last_name: 'Lopez Sanchez',
      date_birth: '1990-04-12',
      email: 'maria.lopez@google.com',
      gender: 'female',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-1234',
      date_joining: '2005-11-20',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Av. Libertadores 234',
    },
    {
      first_name: 'Carlos Alberto',
      last_name: 'Torres Ramirez',
      date_birth: '1985-12-03',
      email: 'carlos.torres@google.com',
      gender: 'male',
      marital_status: 'windowed',
      number_children: 1,
      phone: '+1-555-5678',
      date_joining: '2018-09-15',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Jr. Los Pinos 567',
    },
    {
      first_name: 'Juan Carlos',
      last_name: 'Garcia Rodriguez',
      date_birth: '1975-09-28',
      email: 'juan.garcia@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 4,
      phone: '+1-555-1357',
      date_joining: '2015-07-10',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Jr. Los Alamos 789',
    },
    {
      first_name: 'Ana Maria',
      last_name: 'Fernandez Alva',
      date_birth: '1995-06-20',
      email: 'ana.fernandez@google.com',
      gender: 'female',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-7890',
      date_joining: '2003-12-01',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Av. Los Olivos 101',
    },
    {
      first_name: 'Pedro Alejandro',
      last_name: 'Martinez Chavez',
      date_birth: '1980-02-08',
      email: 'pedro.martinez@google.com',
      gender: 'male',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-2468',
      date_joining: '2002-10-25',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Jr. La Esperanza 202',
    },
    {
      first_name: 'Fabiola Estefania',
      last_name: 'Perez Gutierrez',
      date_birth: '1978-11-15',
      email: 'fabiola.perez@google.com',
      gender: 'female',
      marital_status: 'windowed',
      number_children: 1,
      phone: '+1-555-1122',
      date_joining: '2019-04-05',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Av. Los Sueños 303',
    },
    {
      first_name: 'Ricardo Alberto',
      last_name: 'Gomez Vera',
      date_birth: '1982-07-10',
      email: 'ricardo.gomez@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-555-3344',
      date_joining: '2010-02-18',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Jr. La Victoria 404',
    },
    {
      first_name: 'Laura Beatriz',
      last_name: 'Herrera Medina',
      date_birth: '1992-04-30',
      email: 'laura.herrera@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 3,
      phone: '+1-555-5566',
      date_joining: '2012-09-30',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Av. Los Angeles 505',
    },
    {
      first_name: 'Gonzalo Martin',
      last_name: 'Diaz Palacios',
      date_birth: '1983-12-10',
      email: 'gonzalo.diaz@google.com',
      gender: 'male',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-7890',
      date_joining: '2006-07-22',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Jr. Los Pinos 606',
    },
    {
      first_name: 'Carmen Rosa',
      last_name: 'Flores Huaman',
      date_birth: '1993-08-05',
      email: 'carmen.flores@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-555-1122',
      date_joining: '2013-03-18',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Independencia',
      address: 'Av. Los Olivos 707',
    },

    //* Members Comas
    {
      first_name: 'Roberto Carlos',
      last_name: 'Castillo Ramirez',
      date_birth: '1972-05-20',
      email: 'roberto.castillo@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 3,
      phone: '+1-555-3344',
      date_joining: '2015-11-10',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Comas',
      address: 'Jr. La Esperanza 808',
    },
    {
      first_name: 'Lucia Esperanza',
      last_name: 'Ortega Sanchez',
      date_birth: '1989-02-15',
      email: 'lucia.ortega@google.com',
      gender: 'female',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-5566',
      date_joining: '2004-09-27',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Comas',
      address: 'Av. La Victoria 909',
    },
    {
      first_name: 'Jorge Luis',
      last_name: 'Cordova Gomez',
      date_birth: '1986-11-08',
      email: 'jorge.cordova@google.com',
      gender: 'male',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-1020',
      date_joining: '2003-05-15',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Comas',
      address: 'Jr. La Ruta 1010',
    },
    {
      first_name: 'Rosa Maria',
      last_name: 'Hernandez Perez',
      date_birth: '1994-06-25',
      email: 'rosa.hernandez@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 1,
      phone: '+1-555-3040',
      date_joining: '2018-02-28',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Comas',
      address: 'Av. Los Angeles 1111',
    },
    {
      first_name: 'Hector Alberto',
      last_name: 'Vargas Gutierrez',
      date_birth: '1981-04-18',
      email: 'hector.vargas@google.com',
      gender: 'male',
      marital_status: 'windowed',
      number_children: 1,
      phone: '+1-555-5060',
      date_joining: '2019-08-05',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Comas',
      address: 'Jr. Los Sueños 1212',
    },
    {
      first_name: 'Maribel Alexandra',
      last_name: 'Sanchez Torres',
      date_birth: '1976-09-12',
      email: 'maribel.sanchez@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-555-7080',
      date_joining: '2012-01-10',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Comas',
      address: 'Av. Los Alamos 1313',
    },
    {
      first_name: 'Fernando Jesus',
      last_name: 'Martinez Silva',
      date_birth: '1984-03-30',
      email: 'fernando.martinez@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 3,
      phone: '+1-555-9090',
      date_joining: '2011-04-22',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Comas',
      address: 'Jr. La Aurora 1414',
    },

    //* Members Carabayllo
    {
      first_name: 'Mariana Beatriz',
      last_name: 'Gutierrez Castillo',
      date_birth: '1991-07-05',
      email: 'mariana.gutierrez@google.com',
      gender: 'female',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-1122',
      date_joining: '2005-11-30',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Carabayllo',
      address: 'Av. Los Pinos 1515',
    },
    {
      first_name: 'Patricia Milagros',
      last_name: 'Mendoza Torres',
      date_birth: '1990-12-15',
      email: 'patricia.mendoza@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 2,
      phone: '+1-555-3040',
      date_joining: '2014-06-28',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Carabayllo',
      address: 'Jr. Las Rosas 202',
    },
    {
      first_name: 'Eduardo Alejandro',
      last_name: 'Rodriguez Sanchez',
      date_birth: '1980-04-08',
      email: 'eduardo.rodriguez@google.com',
      gender: 'male',
      marital_status: 'windowed',
      number_children: 1,
      phone: '+1-555-5060',
      date_joining: '2016-09-15',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Carabayllo',
      address: 'Av. Los Olivos 303',
    },
    {
      first_name: 'Diana Carolina',
      last_name: 'Hernandez Gutierrez',
      date_birth: '1987-06-25',
      email: 'diana.hernandez@google.com',
      gender: 'female',
      marital_status: 'married',
      number_children: 1,
      phone: '+1-555-7080',
      date_joining: '2013-02-18',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Carabayllo',
      address: 'Jr. Los Pinos 404',
    },
    {
      first_name: 'Carlos Alberto',
      last_name: 'Martinez Rodriguez',
      date_birth: '1975-09-12',
      email: 'carlos.martinez@google.com',
      gender: 'male',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-9090',
      date_joining: '2015-01-10',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Carabayllo',
      address: 'Av. Los Alamos 505',
    },
    {
      first_name: 'Vanessa Alejandra',
      last_name: 'Gomez Medina',
      date_birth: '1995-03-30',
      email: 'vanessa.gomez@google.com',
      gender: 'female',
      marital_status: 'single',
      number_children: 0,
      phone: '+1-555-1122',
      date_joining: '2018-11-30',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Carabayllo',
      address: 'Av. La Aurora 606',
    },
    {
      first_name: 'Javier Eduardo',
      last_name: 'Gonzalez Rivera',
      date_birth: '1985-07-20',
      email: 'javier.gonzalez@google.com',
      gender: 'male',
      marital_status: 'married',
      number_children: 3,
      phone: '+1-555-1414',
      date_joining: '2010-05-22',
      origin_country: 'Peru',
      roles: ['member'],
      district: 'Carabayllo',
      address: 'Jr. Las Flores 707',
    },
  ],
};

//! Data Offerings and Tithes
export const dataOfferings: SeedDataOffering = {
  offerings: [
    {
      type: 'tithe',
      amount: 50,
      currency: 'Sol',
    },
    {
      type: 'offering',
      sub_type: 'zonal_fasting',
      amount: 22,
      currency: 'Sol',
    },
    {
      type: 'offering',
      sub_type: 'family_home',
      amount: 15,
      currency: 'Sol',
    },
    {
      type: 'offering',
      sub_type: 'special',
      amount: 100,
      currency: 'Dollar',
    },
    {
      type: 'offering',
      sub_type: 'sunday_wirship',
      amount: 85,
      currency: 'Sol',
    },
    {
      type: 'offering',
      sub_type: 'general_fasting',
      amount: 35,
      currency: 'Sol',
    },
    {
      type: 'offering',
      sub_type: 'vigil',
      amount: 28,
      currency: 'Sol',
    },
  ],
};

/* ------------------------------------------------------------------------------  */

//! DATA EXTRA

//! Set Rest FamilyHouses
// export const dataRestFamilyHouses: SeedDataHouses = {
//   houses: [
//     //* Houses Independencia
//     {
//       zone: 'A',
//       name_home: 'Soldados de la Verdad',
//       province: 'Lima',
//       district: 'Independencia',
//       address: 'Jr. La Paz 567',
//       their_preacher: 'id_test',
//     },
//     {
//       zone: 'A',
//       name_home: 'Hijos del Altísimo',
//       province: 'Lima',
//       district: 'Independencia',
//       address: 'Av. La Gracia 890',
//       their_preacher: 'id_test',
//     },
//     {
//       zone: 'A',
//       name_home: 'Centinelas Celestiales',
//       province: 'Lima',
//       district: 'Independencia',
//       address: 'Jr. La Victoria 123',
//       their_preacher: 'id_test',
//     },

//     {
//       zone: 'B',
//       name_home: 'Profetas del Amor',
//       province: 'Lima',
//       district: 'Independencia',
//       address: 'Jr. El Milagro 789',
//       their_preacher: 'id_test',
//     },
//     {
//       zone: 'B',
//       name_home: 'Ángeles Redentores',
//       province: 'Lima',
//       district: 'Independencia',
//       address: 'Av. La Misericordia 101',
//       their_preacher: 'id_test',
//     },

//     {
//       zone: 'C',
//       name_home: 'Adoradores del Altar',
//       province: 'Lima',
//       district: 'Independencia',
//       address: 'Av. La Gracia Divina 303',
//       their_preacher: 'id_test',
//     },
//     {
//       zone: 'C',
//       name_home: 'Seguidores de la Luz',
//       province: 'Lima',
//       district: 'Independencia',
//       address: 'Jr. El Éxito 404',
//       their_preacher: 'id_test',
//     },

//     //* House Comas
//     {
//       zone: 'X',
//       name_home: 'Hijos del Camino',
//       province: 'Lima',
//       district: 'Comas',
//       address: 'Jr. La Unión 222',
//       their_preacher: 'id_test',
//     },
//     {
//       zone: 'X',
//       name_home: 'Centinelas de la Esperanza',
//       province: 'Lima',
//       district: 'Comas',
//       address: 'Av. La Concordia 333',
//       their_preacher: 'id_test',
//     },

//     {
//       zone: 'Z',
//       name_home: 'Seguidores del Sendero',
//       province: 'Lima',
//       district: 'Comas',
//       address: 'Av. La Alegría 555',
//       their_preacher: 'id_test',
//     },
//     {
//       zone: 'Z',
//       name_home: 'Testigos del Renacer',
//       province: 'Lima',
//       district: 'Comas',
//       address: 'Jr. El Renacimiento 666',
//       their_preacher: 'id_test',
//     },

//     //* Hoses Carabayllo
//     {
//       zone: 'R',
//       name_home: 'Hijos del Sol',
//       province: 'Lima',
//       district: 'Carabayllo',
//       address: 'Jr. La Felicidad 222',
//       their_preacher: 'id_test',
//     },
//     {
//       zone: 'R',
//       name_home: 'Centinelas del Valle',
//       province: 'Lima',
//       district: 'Carabayllo',
//       address: 'Av. El Progreso 333',
//       their_preacher: 'id_test',
//     },

//     {
//       zone: 'Q',
//       name_home: 'Seguidores del Camino',
//       province: 'Lima',
//       district: 'Carabayllo',
//       address: 'Av. La Ruta 555',
//       their_preacher: 'id_test',
//     },
//     {
//       zone: 'Q',
//       name_home: 'Testigos del Amanecer',
//       province: 'Lima',
//       district: 'Carabayllo',
//       address: 'Jr. La Aurora 666',
//       their_preacher: 'id_test',
//     },
//   ],
// };

//! Set Rest Preachers

//* Independencia District
// {
//   first_name: 'Maria Jose',
//   last_name: 'Castillo Mendoza',
//   date_birth: '1986-09-12',
//   email: 'maria.castillo@google.com',
//   gender: 'female',
//   marital_status: 'married',
//   number_children: 2,
//   phone: '+1-123-4567',
//   date_joining: '2008-07-05',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Independencia',
//   address: 'Calle Lima 890',
// },
// {
//   first_name: 'Javier Antonio',
//   last_name: 'Torres Paredes',
//   date_birth: '1979-11-25',
//   email: 'javier.torres@google.com',
//   gender: 'male',
//   marital_status: 'married',
//   number_children: 4,
//   phone: '+1-345-6789',
//   date_joining: '2003-12-15',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Independencia',
//   address: 'Av. Los Robles 234',
// },
// {
//   first_name: 'Carla Patricia',
//   last_name: 'Hernandez Chavez',
//   date_birth: '1984-08-03',
//   email: 'carla.hernandez@google.com',
//   gender: 'female',
//   marital_status: 'single',
//   number_children: 0,
//   phone: '+1-890-1234',
//   date_joining: '2011-05-20',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Independencia',
//   address: 'Calle Las Flores 456',
// },
// {
//   first_name: 'Pedro Luis',
//   last_name: 'Rios Silva',
//   date_birth: '1981-02-18',
//   email: 'pedro.rios@google.com',
//   gender: 'male',
//   marital_status: 'single',
//   number_children: 0,
//   phone: '+1-678-9012',
//   date_joining: '2009-10-08',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Independencia',
//   address: 'Av. Los Laureles 789',
// },
// {
//   first_name: 'Susana Beatriz',
//   last_name: 'Ortiz Castillo',
//   date_birth: '1977-05-30',
//   email: 'susana.ortiz@google.com',
//   gender: 'female',
//   marital_status: 'windowed',
//   number_children: 1,
//   phone: '+1-345-6789',
//   date_joining: '2002-04-22',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Independencia',
//   address: 'Calle Los Tulipanes 123',
// },
// {
//   first_name: 'Ricardo Alberto',
//   last_name: 'Nuñez Villanueva',
//   date_birth: '1983-10-05',
//   email: 'ricardo.nunez@google.com',
//   gender: 'male',
//   marital_status: 'married',
//   number_children: 3,
//   phone: '+1-567-8901',
//   date_joining: '2006-11-18',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Independencia',
//   address: 'Av. Los Jazmines 234',
// },
// {
//   first_name: 'Fabiola Gabriela',
//   last_name: 'Jimenez Flores',
//   date_birth: '1976-07-12',
//   email: 'fabiola.jimenez@google.com',
//   gender: 'female',
//   marital_status: 'married',
//   number_children: 2,
//   phone: '+1-123-4567',
//   date_joining: '2004-08-25',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Independencia',
//   address: 'Calle Las Azucenas 890',
// },

//* Comas District
// {
//   first_name: 'Jorge Luis',
//   last_name: 'Fernandez Gutierrez',
//   date_birth: '1974-11-15',
//   email: 'jorge.fernandez@google.com',
//   gender: 'male',
//   marital_status: 'married',
//   number_children: 3,
//   phone: '+1-567-8901',
//   date_joining: '2003-09-20',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Comas',
//   address: 'Calle Los Robles 234',
// },
// {
//   first_name: 'Isabel Cristina',
//   last_name: 'Mendoza Garcia',
//   date_birth: '1986-07-05',
//   email: 'isabel.mendoza@google.com',
//   gender: 'female',
//   marital_status: 'windowed',
//   number_children: 1,
//   phone: '+1-123-4567',
//   date_joining: '2008-12-10',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Comas',
//   address: 'Av. Los Laureles 789',
// },
// {
//   first_name: 'Raul Alberto',
//   last_name: 'Soto Ramirez',
//   date_birth: '1982-01-30',
//   email: 'raul.soto@google.com',
//   gender: 'male',
//   marital_status: 'single',
//   number_children: 0,
//   phone: '+1-678-9012',
//   date_joining: '2011-08-05',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Comas',
//   address: 'Av. Los Jazmines 123',
// },
// {
//   first_name: 'Ana Maria',
//   last_name: 'Gutierrez Torres',
//   date_birth: '1985-06-30',
//   email: 'ana.gutierrez@google.com',
//   gender: 'female',
//   marital_status: 'married',
//   number_children: 2,
//   phone: '+1-234-5678',
//   date_joining: '2007-11-15',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Comas',
//   address: 'Av. Los Pinos 567',
// },

//* Carabayllo District
// {
//   first_name: 'Eva Maria',
//   last_name: 'Fernandez Gutierrez',
//   date_birth: '1988-03-25',
//   email: 'eva.fernandez@google.com',
//   gender: 'female',
//   marital_status: 'married',
//   number_children: 3,
//   phone: '+1-789-1234',
//   date_joining: '2009-05-10',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Carabayllo',
//   address: 'Calle Los Robles 234',
// },
// {
//   first_name: 'Ricardo',
//   last_name: 'Mendoza Garcia',
//   date_birth: '1976-12-08',
//   email: 'ricardo.mendoza@google.com',
//   gender: 'male',
//   marital_status: 'windowed',
//   number_children: 1,
//   phone: '+1-567-8901',
//   date_joining: '2002-10-18',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Carabayllo',
//   address: 'Av. Los Laureles 789',
// },
// {
//   first_name: 'Carmen Rosa',
//   last_name: 'Soto Ramirez',
//   date_birth: '1981-08-15',
//   email: 'carmen.soto@google.com',
//   gender: 'female',
//   marital_status: 'single',
//   number_children: 0,
//   phone: '+1-901-2345',
//   date_joining: '2010-02-05',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Carabayllo',
//   address: 'Av. Los Jazmines 123',
// },
// {
//   first_name: 'Carlos',
//   last_name: 'Mendez Paredes',
//   date_birth: '1982-03-12',
//   email: 'carlos.mendez@google.com',
//   gender: 'male',
//   marital_status: 'single',
//   number_children: 0,
//   phone: '+1-678-9012',
//   date_joining: '2004-08-28',
//   origin_country: 'Peru',
//   roles: ['preacher', 'member'],
//   district: 'Carabayllo',
//   address: 'Calle Lima 890',
// },
