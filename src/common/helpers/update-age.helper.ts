import { Disciple } from '@/modules/disciple/entities';

export const updateAge = (member: Disciple) => {
  const ageMiliSeconds =
    Date.now() - new Date(`${member}.date_birth`).getTime();
  const ageDate = new Date(ageMiliSeconds);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  return age;
};
