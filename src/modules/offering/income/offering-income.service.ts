import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  Not,
  ILike,
  IsNull,
  Between,
  Repository,
  FindOptionsOrderValue,
} from 'typeorm';
import { format } from 'date-fns';
import { isUUID } from 'class-validator';

import { ExternalDonor } from '@/modules/external-donor/entities/external-donor.entity';

import {
  OfferingInactivationReason,
  OfferingInactivationReasonNames,
} from '@/modules/offering/shared/enums/offering-inactivation-reason.enum';
import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';

import {
  MemberType,
  MemberTypeNames,
} from '@/modules/offering/income/enums/member-type.enum';
import {
  ExchangeCurrencyTypes,
  ExchangeCurrencyTypesNames,
} from '@/modules/offering/income/enums/exchange-currency-type.enum';
import {
  OfferingIncomeSearchType,
  OfferingIncomeSearchTypeNames,
} from '@/modules/offering/income/enums/offering-income-search-type.enum';
import {
  OfferingIncomeCreationSubType,
  OfferingIncomeCreationSubTypeNames,
} from '@/modules/offering/income/enums/offering-income-creation-sub-type.enum';
import {
  OfferingIncomeCreationCategory,
  OfferingIncomeCreationCategoryNames,
} from '@/modules/offering/income/enums/offering-income-creation-category.enum';
import {
  OfferingIncomeCreationType,
  OfferingIncomeCreationTypeNames,
} from '@/modules/offering/income/enums/offering-income-creation-type.enum';
import { OfferingIncomeSearchSubType } from '@/modules/offering/income/enums/offering-income-search-sub-type.enum';
import { OfferingIncomeCreationShiftTypeNames } from '@/modules/offering/income/enums/offering-income-creation-shift-type.enum';

import { RecordStatus } from '@/common/enums/record-status.enum';
import { dateFormatterToDDMMYYYY } from '@/common/helpers/date-formatter-to-ddmmyyy.helper';

import { PaginationDto } from '@/common/dtos/pagination.dto';
import { SearchAndPaginationDto } from '@/common/dtos/search-and-pagination.dto';

import { InactivateOfferingDto } from '@/modules/offering/shared/dto/inactivate-offering.dto';

import { CreateOfferingIncomeDto } from '@/modules/offering/income/dto/create-offering-income.dto';
import { UpdateOfferingIncomeDto } from '@/modules/offering/income/dto/update-offering-income.dto';

import { offeringIncomeDataFormatter } from '@/modules/offering/income/helpers/offering-income-data-formatter.helper';

import { Zone } from '@/modules/zone/entities/zone.entity';
import { User } from '@/modules/user/entities/user.entity';
import { Church } from '@/modules/church/entities/church.entity';
import { Pastor } from '@/modules/pastor/entities/pastor.entity';
import { Copastor } from '@/modules/copastor/entities/copastor.entity';
import { Preacher } from '@/modules/preacher/entities/preacher.entity';
import { Disciple } from '@/modules/disciple/entities/disciple.entity';
import { Supervisor } from '@/modules/supervisor/entities/supervisor.entity';
import { FamilyGroup } from '@/modules/family-group/entities/family-group.entity';
import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';

@Injectable()
export class OfferingIncomeService {
  private readonly logger = new Logger('OfferingIncomeService');

  constructor(
    @InjectRepository(Church)
    private readonly churchRepository: Repository<Church>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(Copastor)
    private readonly copastorRepository: Repository<Copastor>,

    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,

    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyGroup)
    private readonly familyGroupRepository: Repository<FamilyGroup>,

    @InjectRepository(Disciple)
    private readonly discipleRepository: Repository<Disciple>,

    @InjectRepository(ExternalDonor)
    private readonly externalDonorRepository: Repository<ExternalDonor>,

    @InjectRepository(OfferingIncome)
    private readonly offeringIncomeRepository: Repository<OfferingIncome>,
  ) {}

  //* CREATE OFFERING INCOME
  async create(
    createOfferingIncomeDto: CreateOfferingIncomeDto,
    user: User,
  ): Promise<OfferingIncome> {
    const {
      type,
      shift,
      date,
      zoneId,
      amount,
      subType,
      category,
      memberId,
      externalDonorId,
      isNewExternalDonor,
      externalDonorFirstNames,
      externalDonorLastNames,
      externalDonorGender,
      externalDonorBirthDate,
      externalDonorPhoneNumber,
      externalDonorEmail,
      externalDonorOriginCountry,
      externalDonorResidenceCountry,
      externalDonorResidenceCity,
      externalDonorPostalCode,
      churchId,
      currency,
      imageUrls,
      memberType,
      familyGroupId,
    } = createOfferingIncomeDto;

    //* Validations
    if (type === OfferingIncomeCreationType.Offering) {
      //? Family group
      if (subType === OfferingIncomeCreationSubType.FamilyGroup) {
        if (!churchId) {
          throw new NotFoundException(`La iglesia es requerida.`);
        }

        const church = await this.churchRepository.findOne({
          where: { id: churchId },
          relations: ['theirMainChurch'],
        });

        if (!church) {
          throw new NotFoundException(
            `Iglesia con id: ${churchId}, no fue encontrado.`,
          );
        }

        if (!church?.recordStatus) {
          throw new BadRequestException(
            `La propiedad "Estado de registro" en Iglesia debe ser "Activo".`,
          );
        }

        if (!familyGroupId) {
          throw new NotFoundException(`El Grupo Familiar es requerido.`);
        }

        const familyGroup = await this.familyGroupRepository.findOne({
          where: { id: familyGroupId },
          relations: [
            'theirChurch',
            'theirPastor.member',
            'theirCopastor.member',
            'theirSupervisor.member',
            'theirZone',
            'theirPreacher.member',
          ],
        });

        if (!familyGroup) {
          throw new NotFoundException(
            `Grupo familiar con id: ${familyGroupId}, no fue encontrado.`,
          );
        }

        if (!familyGroup?.recordStatus) {
          throw new BadRequestException(
            `La propiedad "Estado de registro" en Grupo familiar debe ser "Activo".`,
          );
        }

        //* Validate if exists record already
        const existsOffering = await this.offeringIncomeRepository.find({
          where: {
            subType: subType,
            category: category,
            church: church,
            familyGroup: familyGroup,
            date: new Date(date),
            currency: currency,
            recordStatus: RecordStatus.Active,
          },
        });

        if (existsOffering.length > 0) {
          const offeringDate = dateFormatterToDDMMYYYY(
            new Date(date).getTime(),
          );

          throw new NotFoundException(
            `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]} (mismos datos), Iglesia: ${church.abbreviatedChurchName}, Categoría: ${OfferingIncomeCreationCategoryNames[category]}, Divisa: ${currency} y Fecha: ${offeringDate}.`,
          );
        }

        try {
          const newOfferingIncome = this.offeringIncomeRepository.create({
            ...createOfferingIncomeDto,
            amount: +amount,
            church: church,
            disciple: null,
            preacher: null,
            supervisor: null,
            copastor: null,
            pastor: null,
            zone: null,
            memberType: null,
            shift: null,
            category: category,
            imageUrls: imageUrls,
            familyGroup: familyGroup,
            createdAt: new Date(),
            createdBy: user,
          });

          return await this.offeringIncomeRepository.save(newOfferingIncome);
        } catch (error) {
          this.handleDBExceptions(error);
        }
      }

      //? Sunday service
      if (subType === OfferingIncomeCreationSubType.SundayService) {
        if (!churchId) {
          throw new NotFoundException(`La iglesia es requerida.`);
        }

        const church = await this.churchRepository.findOne({
          where: { id: churchId },
          relations: ['theirMainChurch'],
        });

        if (!church) {
          throw new NotFoundException(
            `Iglesia con id: ${churchId}, no fue encontrado.`,
          );
        }

        if (!church?.recordStatus) {
          throw new BadRequestException(
            `La propiedad "Estado de registro" en Iglesia debe ser "Activo".`,
          );
        }

        //* Validate if exists record already
        const existsOffering = await this.offeringIncomeRepository.find({
          where: {
            subType: subType,
            category: category,
            church: church,
            shift: shift,
            date: new Date(date),
            currency: currency,
            recordStatus: RecordStatus.Active,
          },
        });

        if (existsOffering.length > 0) {
          const offeringDate = dateFormatterToDDMMYYYY(
            new Date(date).getTime(),
          );

          throw new NotFoundException(
            `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]} (mismos datos), Iglesia: ${church.abbreviatedChurchName}, Categoría: ${OfferingIncomeCreationCategoryNames[category]}, Divisa: ${currency}, Turno: ${OfferingIncomeCreationShiftTypeNames[shift]} y Fecha: ${offeringDate}.`,
          );
        }

        if (!shift) {
          throw new NotFoundException(`El turno es requerido.`);
        }

        if (
          !Object.keys(OfferingIncomeCreationShiftTypeNames).includes(shift)
        ) {
          throw new NotFoundException(
            `El turno debe ser uno de los siguientes valores:${Object.values(OfferingIncomeCreationShiftTypeNames).join(', ')} `,
          );
        }

        try {
          const newOfferingIncome = this.offeringIncomeRepository.create({
            ...createOfferingIncomeDto,
            amount: +amount,
            church: church,
            disciple: null,
            preacher: null,
            supervisor: null,
            copastor: null,
            pastor: null,
            zone: null,
            familyGroup: null,
            memberType: null,
            category: category,
            shift: shift,
            imageUrls: imageUrls,
            createdAt: new Date(),
            createdBy: user,
          });

          return await this.offeringIncomeRepository.save(newOfferingIncome);
        } catch (error) {
          this.handleDBExceptions(error);
        }
      }

      //? Sunday School, Youth service
      if (
        subType === OfferingIncomeCreationSubType.SundaySchool ||
        subType === OfferingIncomeCreationSubType.YouthService ||
        subType === OfferingIncomeCreationSubType.ChurchGround ||
        subType === OfferingIncomeCreationSubType.Special
      ) {
        if (!churchId) {
          throw new NotFoundException(`La iglesia es requerida.`);
        }

        const church = await this.churchRepository.findOne({
          where: { id: churchId },
          relations: ['theirMainChurch'],
        });

        if (!church) {
          throw new NotFoundException(
            `Iglesia con id: ${churchId}, no fue encontrado.`,
          );
        }

        if (!church?.recordStatus) {
          throw new BadRequestException(
            `La propiedad "Estado de registro" en Iglesia debe ser "Activo".`,
          );
        }

        let externalDonor: ExternalDonor;
        if (externalDonorId) {
          externalDonor = await this.externalDonorRepository.findOne({
            where: { id: externalDonorId },
          });

          if (!externalDonor) {
            throw new NotFoundException(
              `Donador externo con id: ${externalDonorId}, no fue encontrado.`,
            );
          }
        }

        //* Validate if exists record already
        let existsOffering: OfferingIncome[];
        if (category === OfferingIncomeCreationCategory.OfferingBox) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              subType: subType,
              category: category,
              church: church,
              shift: shift,
              date: new Date(date),
              currency: currency,
              recordStatus: RecordStatus.Active,
            },
          });
        }

        if (
          category === OfferingIncomeCreationCategory.OfferingBox &&
          subType === OfferingIncomeCreationSubType.YouthService
        ) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              subType: subType,
              category: category,
              church: church,
              date: new Date(date),
              currency: currency,
              recordStatus: RecordStatus.Active,
            },
          });
        }

        if (
          category ===
            OfferingIncomeCreationCategory.FundraisingProChurchGround ||
          category === OfferingIncomeCreationCategory.FundraisingProMinistry
        ) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              subType: subType,
              category: category,
              church: church,
              date: new Date(date),
              currency: currency,
              recordStatus: RecordStatus.Active,
            },
          });
        }

        if (category === OfferingIncomeCreationCategory.ExternalDonation) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              subType: subType,
              category: category,
              externalDonor: externalDonor,
              church: church,
              date: new Date(date),
              currency: currency,
              recordStatus: RecordStatus.Active,
            },
          });
        }

        let pastor: Pastor;
        let copastor: Copastor;
        let supervisor: Supervisor;
        let preacher: Preacher;
        let disciple: Disciple;

        if (category === OfferingIncomeCreationCategory.InternalDonation) {
          if (memberType === MemberType.Pastor) {
            pastor = await this.pastorRepository.findOne({
              where: { id: memberId },
              relations: ['member', 'theirChurch'],
            });

            existsOffering = await this.offeringIncomeRepository.find({
              where: {
                church: church,
                subType: subType,
                category: category,
                memberType: memberType,
                pastor: pastor,
                date: new Date(date),
                currency: currency,
                recordStatus: RecordStatus.Active,
              },
            });
          }

          if (memberType === MemberType.Copastor) {
            copastor = await this.copastorRepository.findOne({
              where: { id: memberId },
              relations: ['member', 'theirPastor', 'theirChurch'],
            });

            existsOffering = await this.offeringIncomeRepository.find({
              where: {
                church: church,
                subType: subType,
                category: category,
                memberType: memberType,
                copastor: copastor,
                date: new Date(date),
                currency: currency,
                recordStatus: RecordStatus.Active,
              },
            });
          }
          if (memberType === MemberType.Supervisor) {
            supervisor = await this.supervisorRepository.findOne({
              where: { id: memberId },
              relations: [
                'member',
                'theirPastor',
                'theirCopastor',
                'theirZone',
                'theirChurch',
              ],
            });

            existsOffering = await this.offeringIncomeRepository.find({
              where: {
                church: church,
                subType: subType,
                category: category,
                memberType: memberType,
                supervisor: supervisor,
                date: new Date(date),
                currency: currency,
                recordStatus: RecordStatus.Active,
              },
            });
          }

          if (memberType === MemberType.Preacher) {
            preacher = await this.preacherRepository.findOne({
              where: { id: memberId },
              relations: [
                'member',
                'theirCopastor',
                'theirPastor',
                'theirZone',
                'theirSupervisor',
                'theirChurch',
              ],
            });

            existsOffering = await this.offeringIncomeRepository.find({
              where: {
                church: church,
                subType: subType,
                category: category,
                memberType: memberType,
                preacher: preacher,
                date: new Date(date),
                currency: currency,
                recordStatus: RecordStatus.Active,
              },
            });
          }

          if (memberType === MemberType.Disciple) {
            disciple = await this.discipleRepository.findOne({
              where: { id: memberId },
              relations: [
                'member',
                'theirPastor',
                'theirCopastor',
                'theirZone',
                'theirSupervisor',
                'theirPreacher',
                'theirChurch',
              ],
            });

            existsOffering = await this.offeringIncomeRepository.find({
              where: {
                church: church,
                subType: subType,
                category: category,
                memberType: memberType,
                disciple: disciple,
                date: new Date(date),
                currency: currency,
                recordStatus: RecordStatus.Active,
              },
            });
          }
        }

        if (existsOffering?.length > 0) {
          const offeringDate = dateFormatterToDDMMYYYY(
            new Date(date).getTime(),
          );

          if (
            category === OfferingIncomeCreationCategory.OfferingBox &&
            subType !== OfferingIncomeCreationSubType.YouthService
          ) {
            throw new NotFoundException(
              `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]} (mismos datos), Iglesia: ${church.abbreviatedChurchName}, Categoría: ${OfferingIncomeCreationCategoryNames[category]}, Divisa: ${currency}, Turno: ${OfferingIncomeCreationShiftTypeNames[shift]} y Fecha: ${offeringDate}.`,
            );
          }

          if (
            category === OfferingIncomeCreationCategory.OfferingBox &&
            subType === OfferingIncomeCreationSubType.YouthService
          ) {
            throw new NotFoundException(
              `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]} (mismos datos), Iglesia: ${church.abbreviatedChurchName}, Categoría: ${OfferingIncomeCreationCategoryNames[category]}, y Fecha: ${offeringDate}.`,
            );
          }

          if (
            category ===
              OfferingIncomeCreationCategory.FundraisingProChurchGround ||
            category === OfferingIncomeCreationCategory.FundraisingProMinistry
          ) {
            throw new NotFoundException(
              `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]}, Iglesia: ${church.abbreviatedChurchName}, Categoría: ${OfferingIncomeCreationCategoryNames[category]}, Divisa: ${currency} y Fecha: ${offeringDate}.`,
            );
          }

          if (category === OfferingIncomeCreationCategory.ExternalDonation) {
            throw new NotFoundException(
              `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]}, Iglesia: ${church.abbreviatedChurchName}, Categoría: ${OfferingIncomeCreationCategoryNames[category]} (mismos nombres y apellidos), Divisa: ${currency} y Fecha: ${offeringDate}.`,
            );
          }

          if (category === OfferingIncomeCreationCategory.InternalDonation) {
            throw new NotFoundException(
              `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]}, Iglesia: ${church.abbreviatedChurchName}, Categoría: ${OfferingIncomeCreationCategoryNames[category]}, Divisa: ${currency}, Tipo de miembro: ${MemberTypeNames[memberType]} (mismos nombres y apellidos) y Fecha: ${offeringDate}.`,
            );
          }
        }

        if (
          subType === OfferingIncomeCreationSubType.SundaySchool &&
          category === OfferingIncomeCreationCategory.OfferingBox &&
          !shift
        ) {
          throw new NotFoundException(`El turno es requerido.`);
        }

        if (
          subType === OfferingIncomeCreationSubType.SundaySchool &&
          category === OfferingIncomeCreationCategory.OfferingBox &&
          !Object.keys(OfferingIncomeCreationShiftTypeNames).includes(shift)
        ) {
          throw new NotFoundException(
            `El turno debe ser uno de los siguientes valores:${Object.values(OfferingIncomeCreationShiftTypeNames).join(', ')} `,
          );
        }

        //? If is new donor, then create record
        if (isNewExternalDonor) {
          try {
            const newDonor = this.externalDonorRepository.create({
              firstNames: externalDonorFirstNames,
              lastNames: externalDonorLastNames,
              birthDate: externalDonorBirthDate ?? new Date(1900, 0, 1),
              gender: externalDonorGender,
              email: externalDonorEmail,
              phoneNumber: externalDonorPhoneNumber,
              originCountry: externalDonorOriginCountry,
              residenceCountry: externalDonorResidenceCountry,
              residenceCity: externalDonorResidenceCity,
              postalCode: externalDonorPostalCode,
              createdAt: new Date(),
              createdBy: user,
              recordStatus: RecordStatus.Active,
            });

            await this.externalDonorRepository.save(newDonor);

            const newOfferingIncome = this.offeringIncomeRepository.create({
              ...createOfferingIncomeDto,
              amount: +amount,
              pastor: null,
              copastor: null,
              supervisor: null,
              preacher: null,
              disciple: null,
              church: church ?? null,
              zone: null,
              familyGroup: null,
              shift: null,
              memberType: MemberType.ExternalDonor,
              category: category,
              externalDonor: newDonor,
              imageUrls: imageUrls,
              createdAt: new Date(),
              createdBy: user,
            });

            return await this.offeringIncomeRepository.save(newOfferingIncome);
          } catch (error) {
            this.handleDBExceptions(error);
          }
        }

        //? If not is new donor, search and assign donor
        try {
          const newOfferingIncome = this.offeringIncomeRepository.create({
            ...createOfferingIncomeDto,
            amount: +amount,
            pastor: pastor ?? null,
            copastor: copastor ?? null,
            supervisor: supervisor ?? null,
            preacher: preacher ?? null,
            disciple: disciple ?? null,
            church: church ?? null,
            zone: null,
            familyGroup: null,
            memberType:
              (!memberType || memberType === '') &&
              createOfferingIncomeDto.category !==
                OfferingIncomeCreationCategory.ExternalDonation &&
              createOfferingIncomeDto.category !==
                OfferingIncomeCreationCategory.InternalDonation
                ? null
                : memberType
                  ? memberType
                  : MemberType.ExternalDonor,
            shift: !shift || shift === '' ? null : shift,
            category: category,
            externalDonor: externalDonor ?? null,
            imageUrls: imageUrls,
            createdAt: new Date(),
            createdBy: user,
          });

          return await this.offeringIncomeRepository.save(newOfferingIncome);
        } catch (error) {
          this.handleDBExceptions(error);
        }
      }

      //? Zonal fasting and Zonal vigil
      if (
        subType === OfferingIncomeCreationSubType.ZonalFasting ||
        subType === OfferingIncomeCreationSubType.ZonalVigil
      ) {
        if (!churchId) {
          throw new NotFoundException(`La iglesia es requerida.`);
        }

        const church = await this.churchRepository.findOne({
          where: { id: churchId },
          relations: ['theirMainChurch'],
        });

        if (!church) {
          throw new NotFoundException(
            `Iglesia con id: ${churchId}, no fue encontrado.`,
          );
        }

        if (!church?.recordStatus) {
          throw new BadRequestException(
            `La propiedad "Estado de registro" en Iglesia debe ser "Activo".`,
          );
        }

        if (!zoneId) {
          throw new NotFoundException(`La Zona es requerida.`);
        }

        const zone = await this.zoneRepository.findOne({
          where: { id: zoneId },
          relations: [
            'theirChurch',
            'theirPastor.member',
            'theirCopastor.member',
            'theirSupervisor.member',
          ],
        });

        if (!zone) {
          throw new NotFoundException(
            `Zona con id: ${familyGroupId}, no fue encontrada.`,
          );
        }

        if (!zone?.recordStatus) {
          throw new BadRequestException(
            `La propiedad "Estado de registro" en Zona debe ser "Activo".`,
          );
        }

        //* Validate if exists record already
        const existsOffering = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            category: category,
            subType: subType,
            zone: zone,
            date: new Date(date),
            currency: currency,
            recordStatus: RecordStatus.Active,
          },
        });

        if (existsOffering.length > 0) {
          const offeringDate = dateFormatterToDDMMYYYY(
            new Date(date).getTime(),
          );

          throw new NotFoundException(
            `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]} (mismos datos), Iglesia: ${church.abbreviatedChurchName}, Divisa: ${currency} y Fecha: ${offeringDate}.`,
          );
        }

        try {
          const newOfferingIncome = this.offeringIncomeRepository.create({
            ...createOfferingIncomeDto,
            amount: +amount,
            church: church,
            disciple: null,
            preacher: null,
            supervisor: null,
            copastor: null,
            pastor: null,
            zone: zone,
            memberType: null,
            shift: null,
            imageUrls: imageUrls,
            familyGroup: null,
            createdAt: new Date(),
            createdBy: user,
          });

          return await this.offeringIncomeRepository.save(newOfferingIncome);
        } catch (error) {
          this.handleDBExceptions(error);
        }
      }

      //? General fasting, vigil, united service, activities
      if (
        subType === OfferingIncomeCreationSubType.GeneralVigil ||
        subType === OfferingIncomeCreationSubType.GeneralFasting ||
        subType === OfferingIncomeCreationSubType.UnitedService ||
        subType === OfferingIncomeCreationSubType.Activities
      ) {
        if (!churchId) {
          throw new NotFoundException(`La iglesia es requerida.`);
        }

        const church = await this.churchRepository.findOne({
          where: { id: churchId },
          relations: ['theirMainChurch'],
        });

        if (!church) {
          throw new NotFoundException(
            `Iglesia con id: ${churchId}, no fue encontrado.`,
          );
        }

        if (!church?.recordStatus) {
          throw new BadRequestException(
            `La propiedad "Estado de registro" en Iglesia debe ser "Activo".`,
          );
        }

        //* Validate if exists record already
        const existsOffering = await this.offeringIncomeRepository.find({
          where: {
            subType: subType,
            category: category,
            church: church,
            date: new Date(date),
            currency: currency,
            recordStatus: RecordStatus.Active,
          },
        });

        if (existsOffering.length > 0) {
          const offeringDate = dateFormatterToDDMMYYYY(
            new Date(date).getTime(),
          );

          throw new NotFoundException(
            `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]} (mismos datos), Divisa: ${currency} y Fecha: ${offeringDate}.`,
          );
        }

        try {
          const newOfferingIncome = this.offeringIncomeRepository.create({
            ...createOfferingIncomeDto,
            amount: +amount,
            church: church,
            disciple: null,
            preacher: null,
            supervisor: null,
            copastor: null,
            pastor: null,
            zone: null,
            familyGroup: null,
            memberType: null,
            shift: null,
            imageUrls: imageUrls,
            createdAt: new Date(),
            createdBy: user,
          });

          return await this.offeringIncomeRepository.save(newOfferingIncome);
        } catch (error) {
          this.handleDBExceptions(error);
        }
      }
    }

    //? Income adjustment
    if (type === OfferingIncomeCreationType.IncomeAdjustment) {
      if (!churchId) {
        throw new NotFoundException(`La iglesia es requerida.`);
      }

      const church = await this.churchRepository.findOne({
        where: { id: churchId },
        relations: ['theirMainChurch'],
      });

      if (!church) {
        throw new NotFoundException(
          `Iglesia con id: ${churchId}, no fue encontrado.`,
        );
      }

      if (!church?.recordStatus) {
        throw new BadRequestException(
          `La propiedad "Estado de registro" en Iglesia debe ser "Activo".`,
        );
      }

      //* Validate if exists record already
      const existsOffering = await this.offeringIncomeRepository.find({
        where: {
          type: type,
          church: church,
          date: new Date(date),
          currency: currency,
          recordStatus: RecordStatus.Active,
        },
      });

      if (existsOffering.length > 0) {
        const offeringDate = dateFormatterToDDMMYYYY(new Date(date).getTime());

        throw new NotFoundException(
          `Ya existe un registro con este Tipo: ${OfferingIncomeCreationTypeNames[type]} (mismos datos), Divisa: ${currency} y Fecha: ${offeringDate}.`,
        );
      }

      try {
        const newOfferingIncome = this.offeringIncomeRepository.create({
          ...createOfferingIncomeDto,
          amount: +amount,
          subType: null,
          church: church,
          disciple: null,
          preacher: null,
          supervisor: null,
          copastor: null,
          pastor: null,
          zone: null,
          memberType: null,
          shift: null,
          imageUrls: imageUrls,
          familyGroup: null,
          createdAt: new Date(),
          createdBy: user,
        });

        return await this.offeringIncomeRepository.save(newOfferingIncome);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<any[]> {
    const { limit, offset = 0, order = 'ASC', churchId } = paginationDto;

    try {
      let church: Church;
      if (churchId) {
        church = await this.churchRepository.findOne({
          where: { id: churchId, recordStatus: RecordStatus.Active },
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (!church) {
          throw new NotFoundException(
            `Iglesia con id ${churchId} no fue encontrada.`,
          );
        }
      }

      const offeringIncome = await this.offeringIncomeRepository.find({
        where: { church: church, recordStatus: RecordStatus.Active },
        take: limit,
        skip: offset,
        relations: [
          'updatedBy',
          'createdBy',
          'church',
          'pastor.member',
          'copastor.member',
          'supervisor.member',
          'preacher.member',
          'disciple.member',
          'familyGroup',
          'zone',
          'externalDonor',
        ],
        order: { createdAt: order as FindOptionsOrderValue },
      });

      if (offeringIncome.length === 0) {
        throw new NotFoundException(
          `No existen registros disponibles para mostrar.`,
        );
      }

      return offeringIncomeDataFormatter({
        offeringIncome: offeringIncome,
      }) as any;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.handleDBExceptions(error);
    }
  }

  //* FIND BY TERM
  async findByTerm(
    term: string,
    searchTypeAndPaginationDto: SearchAndPaginationDto,
  ): Promise<OfferingIncome[]> {
    const {
      'search-type': searchType,
      'search-sub-type': searchSubType,
      limit,
      offset = 0,
      order,
      churchId,
    } = searchTypeAndPaginationDto;

    if (!term) {
      throw new BadRequestException(`El termino de búsqueda es requerido.`);
    }

    if (!searchType) {
      throw new BadRequestException(`El tipo de búsqueda es requerido.`);
    }

    //* Search Church
    let church: Church;
    if (churchId) {
      church = await this.churchRepository.findOne({
        where: { id: churchId, recordStatus: RecordStatus.Active },
        order: { createdAt: order as FindOptionsOrderValue },
      });

      if (!church) {
        throw new NotFoundException(
          `Iglesia con id ${churchId} no fue encontrada.`,
        );
      }
    }

    //? Find by all types
    //* By date
    if (
      term &&
      (searchType === OfferingIncomeSearchType.SundayService ||
        searchType === OfferingIncomeSearchType.SundaySchool ||
        searchType === OfferingIncomeSearchType.FamilyGroup ||
        searchType === OfferingIncomeSearchType.ZonalFasting ||
        searchType === OfferingIncomeSearchType.ZonalVigil ||
        searchType === OfferingIncomeSearchType.GeneralFasting ||
        searchType === OfferingIncomeSearchType.GeneralVigil ||
        searchType === OfferingIncomeSearchType.YouthService ||
        searchType === OfferingIncomeSearchType.UnitedService ||
        searchType === OfferingIncomeSearchType.Activities ||
        searchType === OfferingIncomeSearchType.Special ||
        searchType === OfferingIncomeSearchType.ChurchGround ||
        searchType === OfferingIncomeSearchType.IncomeAdjustment) &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByDate
    ) {
      const [fromTimestamp, toTimestamp] = term.split('+').map(Number);

      try {
        if (isNaN(fromTimestamp)) {
          throw new NotFoundException('Formato de marca de tiempo invalido.');
        }

        const fromDate = new Date(fromTimestamp);
        const toDate = toTimestamp ? new Date(toTimestamp) : fromDate;

        let offeringIncome: OfferingIncome[];
        if (searchType !== OfferingIncomeSearchType.IncomeAdjustment) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              date: Between(fromDate, toDate),
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (searchType === OfferingIncomeSearchType.IncomeAdjustment) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              type: searchType,
              date: Between(fromDate, toDate),
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (offeringIncome.length === 0) {
          const fromDate = dateFormatterToDDMMYYYY(fromTimestamp);
          const toDate = dateFormatterToDDMMYYYY(toTimestamp);

          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este rango de fechas: ${fromDate} - ${toDate} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //? Offerings Sunday Service and Sunday School --> Many
    //* By shift
    if (
      term &&
      (searchType === OfferingIncomeSearchType.SundayService ||
        searchType === OfferingIncomeSearchType.SundaySchool) &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByShift
    ) {
      const shiftTerm = term.toLowerCase();
      const validShifts = ['day', 'afternoon'];

      try {
        if (!validShifts.includes(shiftTerm)) {
          throw new BadRequestException(`Turno no válido: ${term}`);
        }

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            shift: shiftTerm,
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          const shiftInSpanish =
            OfferingIncomeCreationShiftTypeNames[term.toLowerCase()] ?? term;

          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este turno: ${shiftInSpanish} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By shift and date
    if (
      term &&
      (searchType === OfferingIncomeSearchType.SundayService ||
        searchType === OfferingIncomeSearchType.SundaySchool) &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByShiftDate
    ) {
      const [shift, date] = term.split('&');

      const shiftTerm = shift.toLowerCase();
      const validShifts = ['day', 'afternoon'];

      try {
        if (!validShifts.includes(shiftTerm)) {
          throw new BadRequestException(`Turno no válido: ${term}`);
        }

        const [fromTimestamp, toTimestamp] = date.split('+').map(Number);

        if (isNaN(fromTimestamp)) {
          throw new NotFoundException('Formato de marca de tiempo invalido.');
        }

        const fromDate = new Date(fromTimestamp);
        const toDate = toTimestamp ? new Date(toTimestamp) : fromDate;

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            date: Between(fromDate, toDate),
            shift: shiftTerm,
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          const fromDate = dateFormatterToDDMMYYYY(fromTimestamp);
          const toDate = dateFormatterToDDMMYYYY(toTimestamp);

          const shiftInSpanish =
            OfferingIncomeCreationShiftTypeNames[shiftTerm.toLowerCase()] ??
            term;

          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este rango de fechas: ${fromDate} - ${toDate}, con este turno: ${shiftInSpanish} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //? Offerings Family Group --> Many
    //* By Zone
    if (
      term &&
      searchType === OfferingIncomeSearchType.FamilyGroup &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByZone
    ) {
      try {
        const zones = await this.zoneRepository.find({
          where: {
            theirChurch: church,
            zoneName: ILike(`%${term}%`),
          },
          relations: ['familyGroups'],
        });

        const familyGroupsByZone = zones
          .map((zone) => zone.familyGroups)
          .flat();

        const familyGroupsId = familyGroupsByZone.map(
          (familyGroup) => familyGroup?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            familyGroup: In(familyGroupsId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con esta zona: ${term} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Zone and date
    if (
      term &&
      searchType === OfferingIncomeSearchType.FamilyGroup &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByZoneDate
    ) {
      const [zone, date] = term.split('&');

      const [fromTimestamp, toTimestamp] = date.split('+').map(Number);

      try {
        if (isNaN(fromTimestamp)) {
          throw new NotFoundException('Formato de marca de tiempo invalido.');
        }

        const fromDate = new Date(fromTimestamp);
        const toDate = toTimestamp ? new Date(toTimestamp) : fromDate;

        const zones = await this.zoneRepository.find({
          where: {
            theirChurch: church,
            zoneName: ILike(`%${zone}%`),
          },
          relations: ['familyGroups'],
        });

        const familyGroupsByZone = zones
          .map((zone) => zone?.familyGroups)
          .flat();

        const familyGroupsId = familyGroupsByZone.map(
          (familyGroup) => familyGroup.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            date: Between(fromDate, toDate),
            familyGroup: In(familyGroupsId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          const fromDate = dateFormatterToDDMMYYYY(fromTimestamp);
          const toDate = dateFormatterToDDMMYYYY(toTimestamp);

          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este rango de fechas: ${fromDate} - ${toDate}, con esta zona: ${zone} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Group Code
    if (
      term &&
      searchType === OfferingIncomeSearchType.FamilyGroup &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByGroupCode
    ) {
      try {
        const familyGroups = await this.familyGroupRepository.find({
          where: {
            theirChurch: church,
            familyGroupCode: ILike(`%${term}%`),
          },
        });

        const familyGroupsId = familyGroups.map(
          (familyGroup) => familyGroup?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            familyGroup: In(familyGroupsId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con esta código de grupo familiar: ${term} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Group Code and date
    if (
      term &&
      searchType === OfferingIncomeSearchType.FamilyGroup &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByGroupCodeDate
    ) {
      const [code, date] = term.split('&');

      const [fromTimestamp, toTimestamp] = date.split('+').map(Number);

      try {
        if (isNaN(fromTimestamp)) {
          throw new NotFoundException('Formato de marca de tiempo invalido.');
        }

        const fromDate = new Date(fromTimestamp);
        const toDate = toTimestamp ? new Date(toTimestamp) : fromDate;

        const familyGroups = await this.familyGroupRepository.find({
          where: {
            theirChurch: church,
            familyGroupCode: ILike(`%${code}%`),
          },
        });

        const familyGroupsId = familyGroups.map(
          (familyGroup) => familyGroup?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            date: Between(fromDate, toDate),
            familyGroup: In(familyGroupsId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          const fromDate = dateFormatterToDDMMYYYY(fromTimestamp);
          const toDate = dateFormatterToDDMMYYYY(toTimestamp);

          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este rango de fechas: ${fromDate} - ${toDate}, este código de grupo: ${code} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Preacher names
    if (
      term &&
      searchType === OfferingIncomeSearchType.FamilyGroup &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByPreacherFirstNames
    ) {
      const firstNames = term.replace(/\+/g, ' ');

      try {
        const preachers = await this.preacherRepository.find({
          where: {
            theirChurch: church,
            member: {
              firstNames: ILike(`%${firstNames}%`),
            },
          },
          relations: ['theirFamilyGroup'],
        });

        const familyGroupsId = preachers.map(
          (preacher) => preacher?.theirFamilyGroup?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            familyGroup: In(familyGroupsId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con estos nombres de predicador: ${firstNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Preacher last names
    if (
      term &&
      searchType === OfferingIncomeSearchType.FamilyGroup &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByPreacherLastNames
    ) {
      const lastNames = term.replace(/\+/g, ' ');

      try {
        const preachers = await this.preacherRepository.find({
          where: {
            theirChurch: church,
            member: {
              lastNames: ILike(`%${lastNames}%`),
            },
          },
          relations: ['theirFamilyGroup'],
        });

        const familyGroupsId = preachers.map(
          (preacher) => preacher?.theirFamilyGroup?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            familyGroup: In(familyGroupsId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con estos apellidos de predicador: ${lastNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Preacher full names
    if (
      term &&
      searchType === OfferingIncomeSearchType.FamilyGroup &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByPreacherFullNames
    ) {
      const firstNames = term.split('-')[0].replace(/\+/g, ' ');
      const lastNames = term.split('-')[1].replace(/\+/g, ' ');

      try {
        const preachers = await this.preacherRepository.find({
          where: {
            theirChurch: church,
            member: {
              firstNames: ILike(`%${firstNames}%`),
              lastNames: ILike(`%${lastNames}%`),
            },
          },
          relations: ['theirFamilyGroup'],
        });

        const familyGroupsId = preachers.map(
          (preacher) => preacher?.theirFamilyGroup?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            familyGroup: In(familyGroupsId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con estos nombres y apellidos de predicador: ${firstNames} ${lastNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //? Offering Zonal Fasting and Zonal Vigil --> Many
    //* By Zone
    if (
      term &&
      (searchType === OfferingIncomeSearchType.ZonalFasting ||
        searchType === OfferingIncomeSearchType.ZonalVigil) &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByZone
    ) {
      try {
        const zones = await this.zoneRepository.find({
          where: {
            theirChurch: church,
            zoneName: ILike(`%${term}%`),
          },
        });

        const zonesId = zones.map((zone) => zone?.id);

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            zone: In(zonesId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con esta zona: ${term} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Zone and date
    if (
      term &&
      (searchType === OfferingIncomeSearchType.ZonalFasting ||
        searchType === OfferingIncomeSearchType.ZonalVigil) &&
      searchSubType === OfferingIncomeSearchSubType.OfferingByZoneDate
    ) {
      const [zone, date] = term.split('&');

      const [fromTimestamp, toTimestamp] = date.split('+').map(Number);

      try {
        if (isNaN(fromTimestamp)) {
          throw new NotFoundException('Formato de marca de tiempo invalido.');
        }

        const fromDate = new Date(fromTimestamp);
        const toDate = toTimestamp ? new Date(toTimestamp) : fromDate;

        const zones = await this.zoneRepository.find({
          where: {
            theirChurch: church,
            zoneName: ILike(`%${zone}%`),
          },
        });

        const zonesId = zones.map((zone) => zone?.id);

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            date: Between(fromDate, toDate),
            zone: In(zonesId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          const fromDate = dateFormatterToDDMMYYYY(fromTimestamp);
          const toDate = dateFormatterToDDMMYYYY(toTimestamp);

          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este rango de fechas: ${fromDate} - ${toDate}, con esta zona: ${zone} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Supervisor names
    if (
      term &&
      (searchType === OfferingIncomeSearchType.ZonalFasting ||
        searchType === OfferingIncomeSearchType.ZonalVigil) &&
      searchSubType ===
        OfferingIncomeSearchSubType.OfferingBySupervisorFirstNames
    ) {
      const firstNames = term.replace(/\+/g, ' ');

      try {
        const supervisors = await this.supervisorRepository.find({
          where: {
            theirChurch: church,
            member: {
              firstNames: ILike(`%${firstNames}%`),
            },
          },
          relations: ['theirZone'],
        });

        const zonesId = supervisors.map(
          (supervisor) => supervisor?.theirZone?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            zone: In(zonesId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con estos  nombres de supervisor: ${firstNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Supervisor last names
    if (
      term &&
      (searchType === OfferingIncomeSearchType.ZonalFasting ||
        searchType === OfferingIncomeSearchType.ZonalVigil) &&
      searchSubType ===
        OfferingIncomeSearchSubType.OfferingBySupervisorLastNames
    ) {
      const lastNames = term.replace(/\+/g, ' ');

      try {
        const supervisors = await this.supervisorRepository.find({
          where: {
            theirChurch: church,
            member: {
              lastNames: ILike(`%${lastNames}%`),
            },
          },
          relations: ['theirZone'],
        });

        const zonesId = supervisors.map(
          (supervisor) => supervisor?.theirZone?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            zone: In(zonesId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con estos apellidos de supervisor: ${lastNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By Supervisor full names
    if (
      term &&
      (searchType === OfferingIncomeSearchType.ZonalFasting ||
        searchType === OfferingIncomeSearchType.ZonalVigil) &&
      searchSubType ===
        OfferingIncomeSearchSubType.OfferingBySupervisorFullNames
    ) {
      const firstNames = term.split('-')[0].replace(/\+/g, ' ');
      const lastNames = term.split('-')[1].replace(/\+/g, ' ');

      try {
        const supervisors = await this.supervisorRepository.find({
          where: {
            theirChurch: church,
            member: {
              firstNames: ILike(`%${firstNames}%`),
              lastNames: ILike(`%${lastNames}%`),
            },
          },
          relations: ['theirZone'],
        });

        const zonesId = supervisors.map(
          (supervisor) => supervisor?.theirZone?.id,
        );

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            subType: searchType,
            zone: In(zonesId),
            recordStatus: RecordStatus.Active,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con estos nombres y apellidos de supervisor: ${firstNames} ${lastNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //? Special and Church ground --> Many
    //* By Contributor names
    if (
      term &&
      (searchType === OfferingIncomeSearchType.Special ||
        searchType === OfferingIncomeSearchType.ChurchGround ||
        searchType === OfferingIncomeSearchType.YouthService ||
        searchType === OfferingIncomeSearchType.SundaySchool) &&
      searchSubType ===
        OfferingIncomeSearchSubType.OfferingByContributorFirstNames
    ) {
      const [memberType, names] = term.split('&');
      const firstNames = names.replace(/\+/g, ' ');

      try {
        let offeringIncome: OfferingIncome[];

        if (memberType === MemberType.ExternalDonor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              externalDonor: firstNames
                ? {
                    firstNames: ILike(`%${firstNames}%`),
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Pastor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              pastor: firstNames
                ? {
                    member: {
                      firstNames: ILike(`%${firstNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Copastor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              copastor: firstNames
                ? {
                    member: {
                      firstNames: ILike(`%${firstNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Supervisor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              supervisor: firstNames
                ? {
                    member: {
                      firstNames: ILike(`%${firstNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Preacher) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              preacher: firstNames
                ? {
                    member: {
                      firstNames: ILike(`%${firstNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Disciple) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              disciple: firstNames
                ? {
                    member: {
                      firstNames: ILike(`%${firstNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (offeringIncome.length === 0) {
          const memberTypeInSpanish =
            MemberTypeNames[memberType.toLowerCase()] ?? memberType;
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este tipo de miembro: ${memberTypeInSpanish}, con estos nombres: ${firstNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By contributor last names
    if (
      term &&
      (searchType === OfferingIncomeSearchType.Special ||
        searchType === OfferingIncomeSearchType.ChurchGround ||
        searchType === OfferingIncomeSearchType.YouthService ||
        searchType === OfferingIncomeSearchType.SundaySchool) &&
      searchSubType ===
        OfferingIncomeSearchSubType.OfferingByContributorLastNames
    ) {
      const [memberType, names] = term.split('&');
      const lastNames = names.replace(/\+/g, ' ');

      try {
        let offeringIncome: OfferingIncome[];

        if (memberType === MemberType.ExternalDonor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              externalDonor: lastNames
                ? {
                    lastNames: ILike(`%${lastNames}%`),
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Pastor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              pastor: lastNames
                ? {
                    member: {
                      lastNames: ILike(`%${lastNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Copastor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              copastor: lastNames
                ? {
                    member: {
                      lastNames: ILike(`%${lastNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Supervisor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              supervisor: lastNames
                ? {
                    member: {
                      lastNames: ILike(`%${lastNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Preacher) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              preacher: lastNames
                ? {
                    member: {
                      lastNames: ILike(`%${lastNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Disciple) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              disciple: lastNames
                ? {
                    member: {
                      lastNames: ILike(`%${lastNames}%`),
                    },
                  }
                : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (offeringIncome.length === 0) {
          const memberTypeInSpanish =
            MemberTypeNames[memberType.toLowerCase()] ?? memberType;
          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este tipo de miembro: ${memberTypeInSpanish}, con estos apellidos: ${lastNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //* By contributor full names
    if (
      term &&
      (searchType === OfferingIncomeSearchType.Special ||
        searchType === OfferingIncomeSearchType.ChurchGround ||
        searchType === OfferingIncomeSearchType.YouthService ||
        searchType === OfferingIncomeSearchType.SundaySchool) &&
      searchSubType ===
        OfferingIncomeSearchSubType.OfferingByContributorFullNames
    ) {
      const [memberType, names] = term.split('&');

      const firstNames = names.split('-')[0].replace(/\+/g, ' ');
      const lastNames = names.split('-')[1].replace(/\+/g, ' ');

      try {
        let offeringIncome: OfferingIncome[];

        if (memberType === MemberType.ExternalDonor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              externalDonor:
                firstNames && lastNames
                  ? {
                      firstNames: ILike(`%${firstNames}%`),
                      lastNames: ILike(`%${lastNames}%`),
                    }
                  : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Pastor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              pastor:
                firstNames && lastNames
                  ? {
                      member: {
                        firstNames: ILike(`%${firstNames}%`),
                        lastNames: ILike(`%${lastNames}%`),
                      },
                    }
                  : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Copastor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              copastor:
                firstNames && lastNames
                  ? {
                      member: {
                        firstNames: ILike(`%${firstNames}%`),
                        lastNames: ILike(`%${lastNames}%`),
                      },
                    }
                  : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Supervisor) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              supervisor:
                firstNames && lastNames
                  ? {
                      member: {
                        firstNames: ILike(`%${firstNames}%`),
                        lastNames: ILike(`%${lastNames}%`),
                      },
                    }
                  : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Preacher) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              preacher:
                firstNames && lastNames
                  ? {
                      member: {
                        firstNames: ILike(`%${firstNames}%`),
                        lastNames: ILike(`%${lastNames}%`),
                      },
                    }
                  : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (memberType === MemberType.Disciple) {
          offeringIncome = await this.offeringIncomeRepository.find({
            where: {
              church: church,
              subType: searchType,
              memberType: memberType,
              disciple:
                firstNames && lastNames
                  ? {
                      member: {
                        firstNames: ILike(`%${firstNames}%`),
                        lastNames: ILike(`%${lastNames}%`),
                      },
                    }
                  : undefined,
              recordStatus: RecordStatus.Active,
            },
            take: limit,
            skip: offset,
            relations: [
              'updatedBy',
              'createdBy',
              'familyGroup',
              'church',
              'zone',
              'pastor.member',
              'copastor.member',
              'supervisor.member',
              'preacher.member',
              'disciple.member',
              'externalDonor',
            ],
            order: { createdAt: order as FindOptionsOrderValue },
          });
        }

        if (offeringIncome.length === 0) {
          const memberTypeInSpanish =
            MemberTypeNames[memberType.toLowerCase()] ?? memberType;

          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este tipo de miembro: ${memberTypeInSpanish}, con estos nombres y apellidos: ${firstNames} ${lastNames} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    // ? Offerings by record status --> Many
    if (term && searchType === OfferingIncomeSearchType.RecordStatus) {
      const recordStatusTerm = term.toLowerCase();
      const validRecordStatus = ['active', 'inactive'];

      try {
        if (!validRecordStatus.includes(recordStatusTerm)) {
          throw new BadRequestException(
            `Estado de registro no válido: ${term}`,
          );
        }

        const offeringIncome = await this.offeringIncomeRepository.find({
          where: {
            church: church,
            recordStatus: recordStatusTerm,
          },
          take: limit,
          skip: offset,
          relations: [
            'updatedBy',
            'createdBy',
            'familyGroup',
            'church',
            'zone',
            'pastor.member',
            'copastor.member',
            'supervisor.member',
            'preacher.member',
            'disciple.member',
            'externalDonor',
          ],
          order: { createdAt: order as FindOptionsOrderValue },
        });

        if (offeringIncome.length === 0) {
          const value = term === RecordStatus.Inactive ? 'Inactivo' : 'Activo';

          throw new NotFoundException(
            `No se encontraron ingresos de ofrendas (${OfferingIncomeSearchTypeNames[searchType]}) con este estado de registro: ${value} y con esta iglesia: ${church ? church?.abbreviatedChurchName : 'Todas las iglesias'}`,
          );
        }

        return offeringIncomeDataFormatter({
          offeringIncome: offeringIncome,
        }) as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        this.handleDBExceptions(error);
      }
    }

    //! General Exceptions
    if (
      term &&
      !Object.values(OfferingIncomeSearchType).includes(
        searchType as OfferingIncomeSearchType,
      )
    ) {
      throw new BadRequestException(
        `Tipos de búsqueda no validos, solo son validos: ${Object.values(OfferingIncomeSearchTypeNames).join(', ')}`,
      );
    }

    if (
      term &&
      (OfferingIncomeSearchType.SundayService ||
        OfferingIncomeSearchType.SundaySchool ||
        OfferingIncomeSearchType.FamilyGroup ||
        OfferingIncomeSearchType.ZonalFasting ||
        OfferingIncomeSearchType.ZonalVigil ||
        OfferingIncomeSearchType.GeneralFasting ||
        OfferingIncomeSearchType.GeneralVigil ||
        OfferingIncomeSearchType.YouthService ||
        OfferingIncomeSearchType.UnitedService ||
        OfferingIncomeSearchType.Activities ||
        OfferingIncomeSearchType.Special ||
        OfferingIncomeSearchType.ChurchGround ||
        OfferingIncomeSearchType.IncomeAdjustment) &&
      !searchSubType
    ) {
      throw new BadRequestException(
        `Para hacer búsquedas por ingresos de ofrendas el sub-tipo es requerido`,
      );
    }
  }

  //* UPDATE OFFERING INCOME
  async update(
    id: string,
    updateOfferingIncomeDto: UpdateOfferingIncomeDto,
    user: User,
  ) {
    const {
      date,
      type,
      shift,
      amount,
      zoneId,
      subType,
      churchId,
      memberId,
      currency,
      imageUrls,
      memberType,
      recordStatus,
      familyGroupId,
    } = updateOfferingIncomeDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`UUID no valido.`);
    }

    //* Validations
    const offering = await this.offeringIncomeRepository.findOne({
      where: { id: id },
      relations: [
        'church',
        'zone',
        'familyGroup',
        'pastor.member',
        'copastor.member',
        'supervisor.member',
        'preacher.member',
        'disciple.member',
      ],
    });

    if (!offering) {
      throw new NotFoundException(
        `Ingreso de Ofrenda con id: ${id} no fue encontrado`,
      );
    }

    if (
      offering?.recordStatus === RecordStatus.Active &&
      recordStatus === RecordStatus.Inactive
    ) {
      throw new BadRequestException(
        `No se puede actualizar un registro a "Inactivo", se debe eliminar.`,
      );
    }

    if (type && type !== offering?.type) {
      throw new BadRequestException(
        `No se puede actualizar el tipo de este registro.`,
      );
    }

    if (subType && subType !== offering?.subType) {
      throw new BadRequestException(
        `No se puede actualizar el sub-tipo de este registro.`,
      );
    }

    if (shift && shift !== offering?.shift) {
      throw new BadRequestException(
        `No se puede actualizar el turno de este registro.`,
      );
    }

    if (memberType && memberType !== offering?.memberType) {
      throw new BadRequestException(
        `No se puede actualizar el tipo de miembro de este registro.`,
      );
    }

    if (churchId && churchId !== offering?.church?.id) {
      throw new BadRequestException(
        `No se puede actualizar la Iglesia a la que pertenece este registro.`,
      );
    }

    if (familyGroupId && familyGroupId !== offering?.familyGroup?.id) {
      throw new BadRequestException(
        `No se puede actualizar el Grupo Familiar al que pertenece este registro.`,
      );
    }

    if (zoneId && zoneId !== offering?.zone?.id) {
      throw new BadRequestException(
        `No se puede actualizar la Zona al  que pertenece este registro.`,
      );
    }

    if (
      memberType === MemberType.Disciple &&
      memberId !== offering?.disciple?.id
    ) {
      throw new BadRequestException(
        `No se puede actualizar el Discípulo que pertenece este registro.`,
      );
    }

    if (memberType === MemberType.Pastor && memberId !== offering?.pastor?.id) {
      throw new BadRequestException(
        `No se puede actualizar el Pastor que pertenece este registro.`,
      );
    }

    if (
      memberType === MemberType.Copastor &&
      memberId !== offering?.copastor?.id
    ) {
      throw new BadRequestException(
        `No se puede actualizar el Co-Pastor que pertenece este registro.`,
      );
    }

    if (
      memberType === MemberType.Supervisor &&
      memberId !== offering?.supervisor?.id
    ) {
      throw new BadRequestException(
        `No se puede actualizar el Supervisor que pertenece este registro.`,
      );
    }

    if (
      memberType === MemberType.Preacher &&
      memberId !== offering?.preacher?.id
    ) {
      throw new BadRequestException(
        `No se puede actualizar el Predicador que pertenece este registro.`,
      );
    }

    try {
      //? Validate if exists record already
      const zone = await this.zoneRepository.findOne({
        where: {
          id: zoneId,
        },
      });

      const familyGroup = await this.familyGroupRepository.findOne({
        where: {
          id: familyGroupId,
        },
      });

      const church = await this.churchRepository.findOne({
        where: {
          id: churchId,
        },
      });

      let memberValue: Pastor | Copastor | Supervisor | Preacher | Disciple;
      if (memberType === MemberType.Pastor) {
        memberValue = await this.pastorRepository.findOne({
          where: {
            id: memberId,
          },
        });
      }
      if (memberType === MemberType.Copastor) {
        memberValue = await this.copastorRepository.findOne({
          where: {
            id: memberId,
          },
        });
      }
      if (memberType === MemberType.Supervisor) {
        memberValue = await this.supervisorRepository.findOne({
          where: {
            id: memberId,
          },
        });
      }
      if (memberType === MemberType.Preacher) {
        memberValue = await this.preacherRepository.findOne({
          where: {
            id: memberId,
          },
        });
      }
      if (memberType === MemberType.Disciple) {
        memberValue = await this.discipleRepository.findOne({
          where: {
            id: memberId,
          },
        });
      }

      let existsOffering: OfferingIncome[];

      //* Sunday school and sunday service
      if (
        subType === OfferingIncomeCreationSubType.SundaySchool ||
        subType === OfferingIncomeCreationSubType.SundayService
      ) {
        existsOffering = await this.offeringIncomeRepository.find({
          where: {
            id: Not(id),
            type: type,
            subType: subType,
            church: church,
            date: new Date(date),
            currency: currency,
            shift: shift,
            recordStatus: RecordStatus.Active,
          },
        });
      }

      //* Family group
      if (subType === OfferingIncomeCreationSubType.FamilyGroup) {
        existsOffering = await this.offeringIncomeRepository.find({
          where: {
            id: Not(id),
            type: type,
            subType: subType,
            date: new Date(date),
            currency: currency,
            familyGroup: familyGroup,
            recordStatus: RecordStatus.Active,
          },
        });
      }

      //* Zonal fasting and vigil
      if (
        subType === OfferingIncomeCreationSubType.ZonalVigil ||
        subType === OfferingIncomeCreationSubType.ZonalFasting
      ) {
        existsOffering = await this.offeringIncomeRepository.find({
          where: {
            id: Not(id),
            type: type,
            subType: subType,
            date: new Date(date),
            currency: currency,
            zone: zone,
            recordStatus: RecordStatus.Active,
          },
        });
      }

      //* General fasting, general vigil, youth service, united services, activities
      if (
        subType === OfferingIncomeCreationSubType.GeneralFasting ||
        subType === OfferingIncomeCreationSubType.GeneralVigil ||
        subType === OfferingIncomeCreationSubType.YouthService ||
        subType === OfferingIncomeCreationSubType.UnitedService ||
        subType === OfferingIncomeCreationSubType.Activities
      ) {
        existsOffering = await this.offeringIncomeRepository.find({
          where: {
            id: Not(id),
            type: type,
            subType: subType,
            date: new Date(date),
            church: church,
            currency: currency,
            recordStatus: RecordStatus.Active,
          },
        });
      }

      //* Special and church ground
      if (
        subType === OfferingIncomeCreationSubType.Special ||
        subType === OfferingIncomeCreationSubType.ChurchGround
      ) {
        if (memberType === MemberType.Pastor) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              id: Not(id),
              type: type,
              subType: subType,
              date: new Date(date),
              currency: currency,
              memberType: memberType,
              pastor: memberValue as Pastor,
              recordStatus: RecordStatus.Active,
            },
          });
        }
        if (memberType === MemberType.Copastor) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              id: Not(id),
              type: type,
              subType: subType,
              date: new Date(date),
              currency: currency,
              memberType: memberType,
              copastor: memberValue as Copastor,
              recordStatus: RecordStatus.Active,
            },
          });
        }
        if (memberType === MemberType.Supervisor) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              id: Not(id),
              type: type,
              subType: subType,
              date: new Date(date),
              currency: currency,
              memberType: memberType,
              supervisor: memberValue as Supervisor,
              disciple: memberValue as Disciple,
              recordStatus: RecordStatus.Active,
            },
          });
        }
        if (memberType === MemberType.Preacher) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              id: Not(id),
              type: type,
              subType: subType,
              date: new Date(date),
              currency: currency,
              memberType: memberType,
              preacher: memberValue as Preacher,
              recordStatus: RecordStatus.Active,
            },
          });
        }
        if (memberType === MemberType.Disciple) {
          existsOffering = await this.offeringIncomeRepository.find({
            where: {
              id: Not(id),
              type: type,
              subType: subType,
              date: new Date(date),
              currency: currency,
              memberType: memberType,
              disciple: memberValue as Disciple,
              recordStatus: RecordStatus.Active,
            },
          });
        }
      }

      //* Income adjustment
      if (type === OfferingIncomeCreationType.IncomeAdjustment) {
        existsOffering = await this.offeringIncomeRepository.find({
          where: {
            id: Not(id),
            type: type,
            date: new Date(date),
            currency: currency,
            memberType: memberType ?? IsNull(),
            pastor: (memberValue as Pastor) ?? IsNull(),
            copastor: (memberValue as Copastor) ?? IsNull(),
            supervisor: (memberValue as Supervisor) ?? IsNull(),
            preacher: (memberValue as Preacher) ?? IsNull(),
            disciple: (memberValue as Disciple) ?? IsNull(),
            recordStatus: RecordStatus.Active,
          },
        });
      }

      if (existsOffering.length > 0) {
        const newDate = dateFormatterToDDMMYYYY(new Date(date).getTime());

        throw new NotFoundException(
          `Ya existe un registro con este Tipo: ${OfferingIncomeCreationSubTypeNames[subType]} (mismos datos), Divisa: ${currency} y Fecha: ${newDate}.\nSi desea hacer cambio de divisa, debe hacerlo desde el modulo Eliminar Ingreso.`,
        );
      }

      const updatedOfferingIncome = await this.offeringIncomeRepository.preload(
        {
          id: offering?.id,
          ...updateOfferingIncomeDto,
          shift: shift === '' ? null : shift,
          memberType: !memberType ? null : memberType,
          amount: +amount,
          imageUrls: [...offering.imageUrls, ...imageUrls],
          updatedAt: new Date(),
          updatedBy: user,
          recordStatus: recordStatus,
        },
      );

      return await this.offeringIncomeRepository.save(updatedOfferingIncome);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.handleDBExceptions(error);
    }
  }

  //! INACTIVATE OFFERING INCOME
  async remove(
    id: string,
    inactivateOfferingIncomeDto: InactivateOfferingDto,
    user: User,
  ): Promise<void> {
    const { offeringInactivationReason, exchangeRate, exchangeCurrencyTypes } =
      inactivateOfferingIncomeDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`UUID no valido.`);
    }

    const offeringIncome = await this.offeringIncomeRepository.findOne({
      where: { id: id },
      relations: [
        'church',
        'zone',
        'familyGroup',
        'pastor.member',
        'copastor.member',
        'supervisor.member',
        'preacher.member',
        'disciple.member',
        'externalDonor',
      ],
    });

    if (!offeringIncome) {
      throw new NotFoundException(
        `Ingreso de Ofrenda con id: ${id} no fue encontrado.`,
      );
    }

    //? Actualizar ofrenda de destino con el monto convertido
    try {
      if (
        offeringInactivationReason ===
        OfferingInactivationReason.CurrencyExchange
      ) {
        let offeringDestiny: OfferingIncome;

        if (
          offeringIncome.subType ===
            OfferingIncomeCreationSubType.SundayService ||
          offeringIncome.subType === OfferingIncomeCreationSubType.SundaySchool
        ) {
          offeringDestiny = await this.offeringIncomeRepository.findOne({
            where: {
              type: offeringIncome.type,
              category: offeringIncome.category,
              subType: offeringIncome.subType,
              date: offeringIncome.date,
              church: offeringIncome.church,
              shift:
                offeringIncome.category ===
                OfferingIncomeCreationCategory.OfferingBox
                  ? offeringIncome.shift
                  : IsNull(),
              currency:
                exchangeCurrencyTypes === ExchangeCurrencyTypes.USDtoPEN ||
                exchangeCurrencyTypes === ExchangeCurrencyTypes.EURtoPEN
                  ? CurrencyType.PEN
                  : exchangeCurrencyTypes === ExchangeCurrencyTypes.PENtoEUR
                    ? CurrencyType.EUR
                    : CurrencyType.USD,
              memberType: offeringIncome.memberType ?? IsNull(),
              pastor: offeringIncome.pastor ?? IsNull(),
              copastor: offeringIncome.copastor ?? IsNull(),
              supervisor: offeringIncome.supervisor ?? IsNull(),
              preacher: offeringIncome.preacher ?? IsNull(),
              disciple: offeringIncome.disciple ?? IsNull(),
              recordStatus: RecordStatus.Active,
            },
          });
        }

        if (
          offeringIncome.subType === OfferingIncomeCreationSubType.FamilyGroup
        ) {
          offeringDestiny = await this.offeringIncomeRepository.findOne({
            where: {
              type: offeringIncome.type,
              subType: offeringIncome.subType,
              category: offeringIncome.category,
              date: offeringIncome.date,
              church: offeringIncome.church,
              familyGroup: offeringIncome.familyGroup,
              currency:
                exchangeCurrencyTypes === ExchangeCurrencyTypes.USDtoPEN ||
                exchangeCurrencyTypes === ExchangeCurrencyTypes.EURtoPEN
                  ? CurrencyType.PEN
                  : exchangeCurrencyTypes === ExchangeCurrencyTypes.PENtoEUR
                    ? CurrencyType.EUR
                    : CurrencyType.USD,
              recordStatus: RecordStatus.Active,
            },
          });
        }

        if (
          offeringIncome.subType ===
            OfferingIncomeCreationSubType.ZonalFasting ||
          offeringIncome.subType === OfferingIncomeCreationSubType.ZonalVigil
        ) {
          offeringDestiny = await this.offeringIncomeRepository.findOne({
            where: {
              type: offeringIncome.type,
              subType: offeringIncome.subType,
              category: offeringIncome.category,
              church: offeringIncome.church,
              date: offeringIncome.date,
              zone: offeringIncome.zone,
              currency:
                exchangeCurrencyTypes === ExchangeCurrencyTypes.USDtoPEN ||
                exchangeCurrencyTypes === ExchangeCurrencyTypes.EURtoPEN
                  ? CurrencyType.PEN
                  : exchangeCurrencyTypes === ExchangeCurrencyTypes.PENtoEUR
                    ? CurrencyType.EUR
                    : CurrencyType.USD,
              recordStatus: RecordStatus.Active,
            },
          });
        }

        if (
          offeringIncome.subType ===
            OfferingIncomeCreationSubType.GeneralFasting ||
          offeringIncome.subType ===
            OfferingIncomeCreationSubType.GeneralVigil ||
          offeringIncome.subType ===
            OfferingIncomeCreationSubType.UnitedService ||
          offeringIncome.subType ===
            OfferingIncomeCreationSubType.YouthService ||
          offeringIncome.subType === OfferingIncomeCreationSubType.Activities
        ) {
          offeringDestiny = await this.offeringIncomeRepository.findOne({
            where: {
              type: offeringIncome.type,
              subType: offeringIncome.subType,
              category: offeringIncome.category,
              date: offeringIncome.date,
              church: offeringIncome.church,
              currency:
                exchangeCurrencyTypes === ExchangeCurrencyTypes.USDtoPEN ||
                exchangeCurrencyTypes === ExchangeCurrencyTypes.EURtoPEN
                  ? CurrencyType.PEN
                  : exchangeCurrencyTypes === ExchangeCurrencyTypes.PENtoEUR
                    ? CurrencyType.EUR
                    : CurrencyType.USD,
              recordStatus: RecordStatus.Active,
            },
          });
        }

        if (
          offeringIncome.subType ===
            OfferingIncomeCreationSubType.ChurchGround ||
          offeringIncome.subType === OfferingIncomeCreationSubType.Special
        ) {
          offeringDestiny = await this.offeringIncomeRepository.findOne({
            where: {
              type: offeringIncome.type,
              category: offeringIncome.category,
              subType: offeringIncome.subType,
              date: offeringIncome.date,
              church: offeringIncome.church,
              currency:
                exchangeCurrencyTypes === ExchangeCurrencyTypes.USDtoPEN ||
                exchangeCurrencyTypes === ExchangeCurrencyTypes.EURtoPEN
                  ? CurrencyType.PEN
                  : exchangeCurrencyTypes === ExchangeCurrencyTypes.PENtoEUR
                    ? CurrencyType.EUR
                    : CurrencyType.USD,
              memberType: offeringIncome.memberType ?? IsNull(),
              pastor: offeringIncome.pastor ?? IsNull(),
              copastor: offeringIncome.copastor ?? IsNull(),
              supervisor: offeringIncome.supervisor ?? IsNull(),
              preacher: offeringIncome.preacher ?? IsNull(),
              disciple: offeringIncome.disciple ?? IsNull(),
              recordStatus: RecordStatus.Active,
            },
          });
        }

        //* If it exists, the transformed amount is added to the existing record.
        if (offeringDestiny) {
          const currentComments = offeringDestiny.comments || '';
          const newComments = `💲 Monto anterior: ${offeringDestiny.amount} ${offeringDestiny.currency}\n💲 Monto añadido: ${(offeringIncome.amount * +exchangeRate).toFixed(2)} ${offeringDestiny.currency} (${offeringIncome.amount} ${offeringIncome.currency})\n💰Tipo de cambio (precio): ${exchangeRate}`;
          const updatedComments = currentComments
            ? `${currentComments}\n\n${newComments}`
            : `${newComments}`;

          const updatedOffering = await this.offeringIncomeRepository.preload({
            id: offeringDestiny.id,
            comments: updatedComments,
            amount: parseFloat(
              (
                +offeringDestiny.amount +
                offeringIncome.amount * +exchangeRate
              ).toFixed(2),
            ),
            updatedAt: new Date(),
            updatedBy: user,
          });

          await this.offeringIncomeRepository.save(updatedOffering);
        }

        //* If there is no record to add the change to, it is created.
        if (!offeringDestiny) {
          const newComments = `💲 Monto convertido: ${(+offeringIncome.amount * +exchangeRate).toFixed(2)} ${
            exchangeCurrencyTypes === ExchangeCurrencyTypes.USDtoPEN ||
            exchangeCurrencyTypes === ExchangeCurrencyTypes.EURtoPEN
              ? CurrencyType.PEN
              : exchangeCurrencyTypes === ExchangeCurrencyTypes.PENtoEUR
                ? CurrencyType.EUR
                : CurrencyType.USD
          } (${offeringIncome.amount} ${offeringIncome?.currency})\n💰Tipo de cambio (precio): ${exchangeRate}`;

          offeringDestiny = this.offeringIncomeRepository.create({
            type: offeringIncome.type,
            subType: offeringIncome.subType,
            category: offeringIncome.category,
            amount: parseFloat(
              (offeringIncome.amount * +exchangeRate).toFixed(2),
            ),
            currency:
              exchangeCurrencyTypes === ExchangeCurrencyTypes.USDtoPEN ||
              exchangeCurrencyTypes === ExchangeCurrencyTypes.EURtoPEN
                ? CurrencyType.PEN
                : exchangeCurrencyTypes === ExchangeCurrencyTypes.PENtoEUR
                  ? CurrencyType.EUR
                  : CurrencyType.USD,
            date: offeringIncome.date,
            comments: newComments,
            church: offeringIncome.church,
            pastor: offeringIncome.pastor,
            copastor: offeringIncome.copastor,
            supervisor: offeringIncome.supervisor,
            preacher: offeringIncome.preacher,
            disciple: offeringIncome.disciple,
            zone: offeringIncome.zone,
            memberType: offeringIncome.memberType,
            shift: offeringIncome.shift,
            imageUrls: offeringIncome.imageUrls,
            familyGroup: offeringIncome.familyGroup,
            createdAt: new Date(),
            createdBy: user,
          });

          await this.offeringIncomeRepository.save(offeringDestiny);
        }
      }

      //* Update and set in Inactive and info comments on Offering Income
      const existingComments = offeringIncome.comments || '';
      const exchangeRateComments = `Tipo de cambio(precio): ${exchangeRate}\nTipo de cambio(moneda): ${ExchangeCurrencyTypesNames[exchangeCurrencyTypes]}\nTotal monto cambiado: ${(offeringIncome.amount * +exchangeRate).toFixed(2)} ${
        (exchangeCurrencyTypes === ExchangeCurrencyTypes.USDtoPEN ||
          exchangeCurrencyTypes === ExchangeCurrencyTypes.EURtoPEN) &&
        CurrencyType.PEN
      }`;
      const removalInfoComments: string = `Fecha de inactivación: ${format(new Date(), 'dd/MM/yyyy')}\nMotivo de inactivación: ${OfferingInactivationReasonNames[offeringInactivationReason as OfferingInactivationReason]}\nUsuario responsable: ${user.firstNames} ${user.lastNames}`;

      const updatedComments =
        exchangeRate && exchangeCurrencyTypes && existingComments
          ? `${existingComments}\n\n${exchangeRateComments}\n\n${removalInfoComments}`
          : exchangeRate && exchangeCurrencyTypes && !existingComments
            ? `${exchangeRateComments}\n\n${removalInfoComments}`
            : !exchangeRate && !exchangeCurrencyTypes && existingComments
              ? `${existingComments}\n\n${removalInfoComments}`
              : `${removalInfoComments}`;

      const deletedOfferingIncome = await this.offeringIncomeRepository.preload(
        {
          id: offeringIncome.id,
          comments: updatedComments,
          inactivationReason: offeringInactivationReason,
          updatedAt: new Date(),
          updatedBy: user,
          recordStatus: RecordStatus.Inactive,
        },
      );

      await this.offeringIncomeRepository.save(deletedOfferingIncome);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? PRIVATE METHODS
  // For future index errors or constrains with code.
  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      const detail = error.detail;

      if (detail.includes('email')) {
        throw new BadRequestException('El correo electrónico ya está en uso.');
      }
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Sucedió un error inesperado, hable con el administrador.',
    );
  }
}
