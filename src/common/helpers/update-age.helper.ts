import { Member } from 'src/members/entities/member.entity';

export const updateAge = (member: Member) => {
  const ageMiliSeconds =
    Date.now() - new Date(`${member}.date_birth`).getTime();
  const ageDate = new Date(ageMiliSeconds);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  return age;
};
