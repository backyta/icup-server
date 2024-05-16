export enum SearchType {
  //* Basic
  id = 'id',
  gender = 'gender',
  marital_status = 'marital_is_active',
  firstName = 'first_name',
  lastName = 'last_name',
  fullName = 'full_name',
  isActive = 'is_active',
  roles = 'roles',

  // NOTE : esto no seria necesario porque se busca por nombre y no por ID
  //* Extras
  code = 'code',
  their_pastor = 'their_pastor', // not necessary
  their_copastor = 'their_copastor', // not necessary
  their_preacher = 'their_preacher', // not necessary
  their_family_home = 'their_family_home', // not necessary
  address = 'address',
  zone = 'zone',

  //* Offering and Tithe
  type_offering = 'type_offering', // cambiar por offering y tithe el type
  offering_sub_type = 'offering_sub_type', // subtipo
  offering_sub_type_date = 'offering_sub_type_date', // subtipo - ofrenda con nombre por fecha
  type_offering_date = 'type_offering_date', // subtipo diezmo u ofrenda por fecha

  date = 'date',
  copastor_id = 'copastor_id', // not necessary , usar nombres y apellidos
  family_home_id = 'family_home_id', // not necessary , usar nombres y apellidos
  member_id = 'member_id', // not necessary , usar nombres y apellidos
}

//TODO : AGREGAR indices para las busquedas mas rapidas, hacer lista y asignar indices.
