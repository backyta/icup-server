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
    {
      zoneName: 'Rubén',
      district: 'Independencia',
    },
    {
      zoneName: 'Simeón',
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
      zoneName: 'Isacar',
      district: 'Independencia',
    },
    {
      zoneName: 'Zabulón',
      district: 'Independencia',
    },
  ],
};
