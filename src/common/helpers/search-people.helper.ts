import { NotFoundException } from '@nestjs/common';

import { SearchPeopleOptions } from '@/common/interfaces';
import { searchByFullname, searchByNames } from '@/common/helpers';
import { SearchTypeOfName, TypeEntity, SearchType } from '@/common/enums';

import { Pastor } from '@/modules/pastor/entities';
import { Disciple } from '@/modules/disciple/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Preacher } from '@/modules/preacher/entities';
import { Offering } from '@/modules/offering/entities';
import { FamilyHouse } from '@/modules/family-house/entities';

export const searchPeopleBy = async ({
  term,
  search_type,
  limit,
  offset,
  type_entity,
  type_of_name,
  search_repository,
  entity_repository,
}: SearchPeopleOptions): Promise<any | any[]> => {
  //* FOR FIND BY FIRST NAME AND LAST NAME
  if (
    search_type === SearchType.firstName ||
    search_type === SearchType.lastName
  ) {
    const members = await searchByNames({
      term,
      search_type,
      limit,
      offset,
      search_repository,
    });

    //! Search in Module Offerings
    if (type_entity === TypeEntity.offeringEntity) {
      const offerings = await entity_repository.find();
      let offeringsByName: Offering[][];

      if (type_of_name === SearchTypeOfName.offeringMember) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) =>
              offering.member?.id === member.id &&
              offering.type === 'offering' &&
              offering.sub_type === 'special',
          );
          return filteredOfferings;
        });
      }

      if (type_of_name === SearchTypeOfName.titheMember) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) =>
              offering.member?.id === member.id && offering.type === 'tithe',
          );
          return filteredOfferings;
        });
      }

      if (type_of_name === SearchTypeOfName.offeringHousePreacher) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) =>
              offering.family_home?.their_preacher.member.id === member.id,
          );
          return filteredOfferings;
        });
      }

      if (type_of_name === SearchTypeOfName.offeringHouseCopastor) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) =>
              offering.family_home?.their_copastor?.member.id === member.id,
          );
          return filteredOfferings;
        });
      }

      if (type_of_name === SearchTypeOfName.offeringFastingCopastor) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) => offering.copastor?.member.id === member.id,
          );
          return filteredOfferings;
        });
      }

      if (!offeringsByName) {
        throw new NotFoundException(
          `Not found Offerings or Tithes with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayOfferingsFlattened = offeringsByName.flat();

      if (ArrayOfferingsFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Offerings or Tithes with these names '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayOfferingsFlattened;
    }

    //! Search in Module Family Home
    if (type_entity === TypeEntity.familyHomeEntity) {
      const familyHouses = await entity_repository.find();
      let familyHomeByName: FamilyHouse[][];

      if (type_of_name === SearchTypeOfName.familyHousePreacher) {
        familyHomeByName = members.map((member) => {
          const filteredFamilyHome = familyHouses.filter(
            (home) => home.their_preacher?.member?.id === member.id,
          );
          return filteredFamilyHome;
        });
      }

      if (type_of_name === SearchTypeOfName.familyHousePreacher) {
        familyHomeByName = members.map((member) => {
          const filteredFamilyHome = familyHouses.filter(
            (home) => home.their_copastor?.member?.id === member.id,
          );
          return filteredFamilyHome;
        });
      }

      if (!familyHomeByName) {
        throw new NotFoundException(
          `Not found Family Houses with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayFamilyHousesFlattened = familyHomeByName.flat();

      if (ArrayFamilyHousesFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Family Houses with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayFamilyHousesFlattened;
    }

    //! Search in Module Preacher

    if (type_entity === TypeEntity.preacherEntity) {
      const preachers = await entity_repository.find();

      let preachersByName: Preacher[][];
      if (type_of_name === SearchTypeOfName.preacherMember) {
        preachersByName = members.map((member) => {
          const filteredPreachers = preachers.filter(
            (preacher) =>
              preacher?.member.id === member.id && preacher?.is_active === true,
          );
          return filteredPreachers;
        });
      }

      if (type_of_name === SearchTypeOfName.preacherCopastor) {
        preachersByName = members.map((member) => {
          const filteredPreachers = preachers.filter(
            (preacher) =>
              preacher?.their_copastor?.member.id === member.id &&
              preacher?.is_active === true,
          );
          return filteredPreachers;
        });
      }

      if (!preachersByName) {
        throw new NotFoundException(
          `Not found Preacher with this names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayPreachersFlattened = preachersByName.flat();

      if (ArrayPreachersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Preacher with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayPreachersFlattened;
    }

    //! Search in Module Copastor
    if (type_entity === TypeEntity.copastorEntity) {
      const copastores = await entity_repository.find();

      let copastorByName: Copastor[][];

      if (type_of_name === SearchTypeOfName.copastorMember) {
        copastorByName = members.map((member) => {
          const filteredCopastores = copastores.filter(
            (copastor) =>
              copastor?.member.id === member.id && copastor?.is_active === true,
          );
          return filteredCopastores;
        });
      }

      if (type_of_name === SearchTypeOfName.copastorPastor) {
        copastorByName = members.map((member) => {
          const filteredCopastores = copastores.filter(
            (copastor) =>
              copastor?.their_pastor?.member.id === member.id &&
              copastor?.is_active === true,
          );
          return filteredCopastores;
        });
      }

      if (!copastorByName) {
        throw new NotFoundException(
          `Not found Copastor with this names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayCoPastoresFlattened = copastorByName.flat();

      if (ArrayCoPastoresFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Copastor with this names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayCoPastoresFlattened;
    }

    //! Search in Module Pastor
    if (type_entity === TypeEntity.pastorEntity) {
      const pastores = await entity_repository.find();

      let pastorByName: Pastor[][];

      if (type_of_name === SearchTypeOfName.copastorMember) {
        pastorByName = members.map((member) => {
          const filteredPastor = pastores.filter(
            (pastor) =>
              pastor?.member.id === member.id && pastor?.is_active === true,
          );
          return filteredPastor;
        });
      }

      if (pastorByName.length === 0) {
        throw new NotFoundException(
          `Not found Pastor with this name : ${term.slice(0, -1)}`,
        );
      }

      const ArrayPastoresFlattened = pastorByName.flat();

      if (ArrayPastoresFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Pastor with these names ${term.slice(0, -1)}`,
        );
      }

      return ArrayPastoresFlattened;
    }

    //! Search in Module Member
    if (type_entity === TypeEntity.memberEntity) {
      const allMembers = await entity_repository.find({
        relations: [
          'their_pastor',
          'their_copastor',
          'their_preacher',
          'their_family_home',
        ],
      });

      let membersByName: Disciple[][];

      if (type_of_name === SearchTypeOfName.memberPreacher) {
        const preacherMembers = members.filter((member) =>
          member.roles.includes('preacher'),
        );

        membersByName = preacherMembers.map((memberPreacher) => {
          const filteredMembersByPreacher = allMembers.filter(
            (member) =>
              member?.their_preacher?.member.id === memberPreacher.id &&
              member.is_active === true,
          );
          return filteredMembersByPreacher;
        });
      }

      if (type_of_name === SearchTypeOfName.memberCopastor) {
        const copastorMembers = members.filter((member) =>
          member.roles.includes('copastor'),
        );

        membersByName = copastorMembers.map((memberCopastor) => {
          const filteredMembersByCopastor = allMembers.filter(
            (member) =>
              member?.their_copastor?.member.id === memberCopastor.id &&
              member.is_active === true,
          );

          return filteredMembersByCopastor;
        });
      }

      //TODO : esquemetizar mejor agregar by, renombrar el type-of name esta HORRIBLE
      if (type_of_name === SearchTypeOfName.memberPastor) {
        const copastorMembers = members.filter((member) =>
          member.roles.includes('pastor'),
        );

        membersByName = copastorMembers.map((memberPastor) => {
          const filteredMembersByPastor = allMembers.filter(
            (member) =>
              member?.their_pastor?.member.id === memberPastor.id &&
              member.is_active === true,
          );

          return filteredMembersByPastor;
        });
      }

      if (type_of_name === SearchTypeOfName.memberMember) {
        return members;
      }

      if (!membersByName) {
        throw new NotFoundException(
          `Not found Members with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayMembersFlattened = membersByName.flat();

      if (ArrayMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Members with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayMembersFlattened;
    }
  }

  //* FOR FIND BY FULL NAME
  if (search_type === 'full_name') {
    const members = await searchByFullname({
      term,
      limit,
      offset,
      search_repository,
    });

    //! Search in Module Offerings
    if (type_entity === TypeEntity.offeringEntity) {
      const offerings = await entity_repository.find();
      let offeringsByName: Offering[][];

      if (type_of_name === SearchTypeOfName.offeringMember) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) =>
              offering.member?.id === member.id &&
              offering.type === 'offering' &&
              offering.sub_type === 'special',
          );
          return filteredOfferings;
        });
      }

      if (type_of_name === SearchTypeOfName.titheMember) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) =>
              offering.member?.id === member.id && offering.type === 'tithe',
          );
          return filteredOfferings;
        });
      }

      if (type_of_name === SearchTypeOfName.offeringHousePreacher) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) =>
              offering.family_home?.their_preacher.member.id === member.id,
          );
          return filteredOfferings;
        });
      }

      if (type_of_name === SearchTypeOfName.offeringHouseCopastor) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) =>
              offering.family_home?.their_copastor?.member.id === member.id,
          );
          return filteredOfferings;
        });
      }

      if (type_of_name === SearchTypeOfName.offeringFastingCopastor) {
        offeringsByName = members.map((member) => {
          const filteredOfferings = offerings.filter(
            (offering) => offering.copastor?.member.id === member.id,
          );
          return filteredOfferings;
        });
      }

      if (!offeringsByName) {
        throw new NotFoundException(
          `Not found Offerings or Tithes with these first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      const ArrayOfferingsFlattened = offeringsByName.flat();

      if (ArrayOfferingsFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Offerings or Tithes with these first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayOfferingsFlattened;
    }

    //! Search in Module Family Home
    if (type_entity === TypeEntity.familyHomeEntity) {
      const familyHouses = await entity_repository.find();
      let familyHomeByName: FamilyHouse[][];

      if (type_of_name === SearchTypeOfName.familyHousePreacher) {
        familyHomeByName = members.map((member) => {
          const filteredFamilyHome = familyHouses.filter(
            (home) => home.their_preacher?.member?.id === member.id,
          );
          return filteredFamilyHome;
        });
      }

      if (type_of_name === SearchTypeOfName.familyHousePreacher) {
        familyHomeByName = members.map((member) => {
          const filteredFamilyHome = familyHouses.filter(
            (home) => home.their_copastor?.member?.id === member.id,
          );
          return filteredFamilyHome;
        });
      }

      if (!familyHomeByName) {
        throw new NotFoundException(
          `Not found Family Houses with these first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }
      const ArrayFamilyHousesFlattened = familyHomeByName.flat();

      if (ArrayFamilyHousesFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Family Houses with these first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayFamilyHousesFlattened;
    }

    //! Search in Module Preacher

    if (type_entity === TypeEntity.preacherEntity) {
      const preachers = await entity_repository.find();

      let preachersByName: Preacher[][];
      if (type_of_name === SearchTypeOfName.preacherMember) {
        preachersByName = members.map((member) => {
          const filteredPreachers = preachers.filter(
            (preacher) =>
              preacher?.member.id === member.id && preacher?.is_active === true,
          );
          return filteredPreachers;
        });
      }

      if (type_of_name === SearchTypeOfName.preacherCopastor) {
        preachersByName = members.map((member) => {
          const filteredPreachers = preachers.filter(
            (preacher) =>
              preacher?.their_copastor?.member.id === member.id &&
              preacher?.is_active === true,
          );
          return filteredPreachers;
        });
      }

      if (!preachersByName) {
        throw new NotFoundException(
          `Not found Preachers with these first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      const ArrayPreachersFlattened = preachersByName.flat();

      if (ArrayPreachersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Preachers with these  first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayPreachersFlattened;
    }

    //! Search in Module Copastor
    if (type_entity === TypeEntity.copastorEntity) {
      const copastores = await entity_repository.find();

      let copastorByName: Copastor[][];

      if (type_of_name === SearchTypeOfName.copastorMember) {
        copastorByName = members.map((member) => {
          const filteredCopastores = copastores.filter(
            (copastor) =>
              copastor?.member.id === member.id && copastor?.is_active === true,
          );
          return filteredCopastores;
        });
      }

      if (type_of_name === SearchTypeOfName.copastorPastor) {
        copastorByName = members.map((member) => {
          const filteredCopastores = copastores.filter(
            (copastor) =>
              copastor?.their_pastor?.member.id === member.id &&
              copastor?.is_active === true,
          );
          return filteredCopastores;
        });
      }

      if (!copastorByName) {
        throw new NotFoundException(
          `Not found Copastor with this names of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      const ArrayCoPastoresFlattened = copastorByName.flat();

      if (ArrayCoPastoresFlattened.length === 0) {
        throw new NotFoundException(
          `Not found CoPastor with these names of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayCoPastoresFlattened;
    }

    //! Search in Module Pastor
    if (type_entity === TypeEntity.pastorEntity) {
      const pastores = await entity_repository.find();

      let pastorByName: Pastor[][];

      if (type_of_name === SearchTypeOfName.copastorMember) {
        pastorByName = members.map((member) => {
          const filteredPastor = pastores.filter(
            (pastor) =>
              pastor?.member.id === member.id && pastor?.is_active === true,
          );
          return filteredPastor;
        });
      }

      if (pastorByName.length === 0) {
        throw new NotFoundException(
          `Not found member with role Pastor and with this name : ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayPastoresFlattened = pastorByName.flat();

      if (ArrayPastoresFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Pastor with these first_name & last_name: ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayPastoresFlattened;
    }

    //! Search in Module Member
    if (type_entity === TypeEntity.memberEntity) {
      const allMembers = await entity_repository.find({
        relations: [
          'their_pastor',
          'their_copastor',
          'their_preacher',
          'their_family_home',
        ],
      });

      let membersByName: Disciple[][];

      if (type_of_name === SearchTypeOfName.memberPreacher) {
        const preacherMembers = members.filter((member) =>
          member.roles.includes('preacher'),
        );

        membersByName = preacherMembers.map((memberPreacher) => {
          const filteredMembersByPreacher = allMembers.filter(
            (member) =>
              member?.their_preacher?.member.id === memberPreacher.id &&
              member.is_active === true,
          );
          return filteredMembersByPreacher;
        });
      }

      if (type_of_name === SearchTypeOfName.memberCopastor) {
        const copastorMembers = members.filter((member) =>
          member.roles.includes('copastor'),
        );

        membersByName = copastorMembers.map((memberCopastor) => {
          const filteredMembersByCopastor = allMembers.filter(
            (member) =>
              member?.their_copastor?.member.id === memberCopastor.id &&
              member.is_active === true,
          );

          return filteredMembersByCopastor;
        });
      }

      if (type_of_name === SearchTypeOfName.memberPastor) {
        const copastorMembers = members.filter((member) =>
          member.roles.includes('pastor'),
        );

        membersByName = copastorMembers.map((memberPastor) => {
          const filteredMembersByPastor = allMembers.filter(
            (member) =>
              member?.their_pastor?.member.id === memberPastor.id &&
              member.is_active === true,
          );

          return filteredMembersByPastor;
        });
      }

      if (type_of_name === SearchTypeOfName.memberMember) {
        return members;
      }

      if (!membersByName) {
        throw new NotFoundException(
          `Not found Members with these names of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      const ArrayMembersFlattened = membersByName.flat();

      if (ArrayMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Members with these names of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayMembersFlattened;
    }
  }
};
