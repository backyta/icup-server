import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrderValue, Repository } from 'typeorm';

import { PaginationDto } from '@/common/dtos/pagination.dto';

import { User } from '@/modules/user/entities/user.entity';

import { UpdateExternalDonorDto } from '@/modules/external-donor/dto/update-external-donor.dto';

import { ExternalDonor } from '@/modules/external-donor/entities/external-donor.entity';

@Injectable()
export class ExternalDonorService {
  private readonly logger = new Logger('ExternalDonorService');

  constructor(
    @InjectRepository(ExternalDonor)
    private readonly externalDonorRepository: Repository<ExternalDonor>,
  ) {}

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<any[]> {
    const { order = 'ASC' } = paginationDto;

    try {
      const externalDonors = await this.externalDonorRepository.find({
        order: { createdAt: order as FindOptionsOrderValue },
      });

      if (externalDonors.length === 0) {
        throw new NotFoundException(
          `No existen registros disponibles para mostrar.`,
        );
      }

      return externalDonors;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.handleDBExceptions(error);
    }
  }

  //* UPDATE EXTERNAL DONOR
  async update(
    id: string,
    updateExternalDonorDto: UpdateExternalDonorDto,
    user: User,
  ): Promise<ExternalDonor> {
    const {
      externalDonorEmail,
      externalDonorGender,
      externalDonorLastNames,
      externalDonorBirthDate,
      externalDonorFirstNames,
      externalDonorPostalCode,
      externalDonorPhoneNumber,
      externalDonorOriginCountry,
      externalDonorResidenceCity,
      externalDonorResidenceCountry,
    } = updateExternalDonorDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`UUID no valido.`);
    }

    const externalDonor = await this.externalDonorRepository.findOne({
      where: { id: id },
    });

    if (!externalDonor) {
      throw new NotFoundException(
        `Donador Externo con id: ${id} no fue encontrado.`,
      );
    }

    try {
      const updatedExternalDonor = await this.externalDonorRepository.preload({
        id: externalDonor.id,
        firstNames: externalDonorFirstNames,
        lastNames: externalDonorLastNames,
        gender: externalDonorGender,
        birthDate: externalDonorBirthDate ?? null,
        originCountry:
          externalDonorOriginCountry !== '' ? externalDonorOriginCountry : null,
        email: externalDonorEmail !== '' ? externalDonorEmail : null,
        phoneNumber:
          externalDonorPhoneNumber !== '' ? externalDonorPhoneNumber : null,
        residenceCountry:
          externalDonorResidenceCountry !== ''
            ? externalDonorResidenceCountry
            : null,
        residenceCity:
          externalDonorResidenceCity !== '' ? externalDonorResidenceCity : null,
        postalCode:
          externalDonorPostalCode !== '' ? externalDonorPostalCode : null,
        updatedBy: user,
        updatedAt: new Date(),
      });

      return await this.externalDonorRepository.save(updatedExternalDonor);
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
