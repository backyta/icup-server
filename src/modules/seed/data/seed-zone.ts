interface SeedZone {
  //* General Info
  zoneName: string;
  country?: string;
  department?: string;
  province?: string;
  district: string;
  recordStatus?: string;

  //* Relations
  theirSupervisor?: string;
}

interface SeedDataZones {
  zones: SeedZone[];
}

export const dataZones: SeedDataZones = {
  zones: [
    //* Comas
    {
      zoneName: 'Jerusalén',
      district: 'Comas',
    },
    {
      zoneName: 'Belén',
      district: 'Comas',
    },
    {
      zoneName: 'Hebrón',
      district: 'Comas',
    },
    {
      zoneName: 'Jericó',
      district: 'Comas',
    },
    {
      zoneName: 'Siquem',
      district: 'Comas',
    },
    {
      zoneName: 'Betel',
      district: 'Comas',
    },

    //* Independencia
    {
      zoneName: 'Rubén',
      district: 'Independencia',
    },
    {
      zoneName: 'Dan',
      district: 'Independencia',
    },
    {
      zoneName: 'Leví',
      district: 'Independencia',
    },
    {
      zoneName: 'Judá',
      district: 'Independencia',
    },
    {
      zoneName: 'Gad',
      district: 'Independencia',
    },
    {
      zoneName: 'Aser',
      district: 'Independencia',
    },

    //* Los Olivos
    {
      zoneName: 'Sion',
      district: 'Los Olivos',
    },
    {
      zoneName: 'Sinaí',
      district: 'Los Olivos',
    },
    {
      zoneName: 'Hermón',
      district: 'Los Olivos',
    },
    {
      zoneName: 'Jezreel',
      district: 'Los Olivos',
    },
    {
      zoneName: 'Jordán',
      district: 'Los Olivos',
    },
    {
      zoneName: 'Galilea',
      district: 'Los Olivos',
    },
  ],
};
