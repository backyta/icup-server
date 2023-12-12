import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFamilyHomeDto } from './dto/create-family-home.dto';
import { UpdateFamilyHomeDto } from './dto/update-family-home.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preacher } from 'src/preacher/entities/preacher.entity';
import { Member } from 'src/members/entities/member.entity';
import { Pastor } from 'src/pastor/entities/pastor.entity';
import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { FamilyHome } from './entities/family-home.entity';
import { PaginationDto, SearchTypeAndPaginationDto } from 'src/common/dtos';
import { isUUID } from 'class-validator';
import { SearchType } from 'src/common/enums/search-types.enum';

@Injectable()
export class FamilyHomeService {
  private readonly logger = new Logger('FamilyHomeService');

  constructor(
    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(FamilyHome)
    private readonly familyHousesRepository: Repository<FamilyHome>,
  ) {}

  //NOTE: en member debo actiualizar y setear a cada miembro su casa, despues de crear estas casas.
  //NOTE : cuando se cree una casa y se asigne un preacher, se busca en tabla member el pracher.member.id que sea igual
  //NOTE : para que setee en la tabla miembro su casa asignada.
  //* CREATE FAMILY HOME
  async create(createFamilyHomeDto: CreateFamilyHomeDto) {
    const { their_preacher } = createFamilyHomeDto;

    //* Validation Preacher
    const preacher = await this.preacherRepository.findOneBy({
      id: their_preacher,
    });

    if (!preacher) {
      throw new NotFoundException(
        `Not faound CoPastor with id ${their_preacher}`,
      );
    }

    if (!preacher.is_active) {
      throw new BadRequestException(
        `The property is_active in Preacher must be a true value"`,
      );
    }

    //* Validation pastor
    const pastor = await this.pastorRepository.findOneBy({
      id: preacher.their_pastor.id,
    });

    if (!pastor) {
      throw new NotFoundException(
        `Not faound Pastor with id ${preacher.their_pastor.id}`,
      );
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //* Validation copastor
    const copastor = await this.coPastorRepository.findOneBy({
      id: preacher.their_copastor.id,
    });

    if (!copastor) {
      throw new NotFoundException(
        `Not faound CoPastor with id ${preacher.their_copastor.id}`,
      );
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    //* Create instance
    try {
      const preacherInstance = this.familyHousesRepository.create({
        ...createFamilyHomeDto,
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      return await this.familyHousesRepository.save(preacherInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* Busca Todos (activo o inactive)
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.familyHousesRepository.find({
      take: limit,
      skip: offset,
    });
    //! Revisar si se cargan las relaciones o afecta, para cargarlas aqui
  }

  //* Busca por ID (activo o inactivo)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let familyHome: FamilyHome | FamilyHome[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      familyHome = await this.familyHousesRepository.findOneBy({ id: term });

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro FamilyHome con este UUID`,
        );
      }

      //* Conteo y asignacion de cantidad de miembros(id-familyHome tabla member)
      const allMembers = (await this.memberRepository.find()) ?? [];
      const membersFamilyHome = allMembers.filter(
        (members) => members.their_family_home.id === term,
      );

      const listMembersId = membersFamilyHome.map((member) => member.id);

      familyHome.count_members = membersFamilyHome.length;
      familyHome.members = listMembersId;

      await this.familyHousesRepository.save(familyHome);
    }

    //! Aqui si busca solo por active
    //* Find Code --> One
    if (term && type === SearchType.code) {
      familyHome = await this.familyHousesRepository.findOneBy({
        code: term,
        is_active: true,
      });

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro FamilyHome con este code ${term}`,
        );
      }
    }

    //* Find Address --> One
    if (term && type === SearchType.address) {
      familyHome = await this.familyHousesRepository
        .createQueryBuilder('fh')
        .where('fh.address LIKE :term', { term: `%${term}%` })
        .andWhere('fh.is_active = :isActive', { isActive: true })
        .getOne();

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro una FamilyHome con este address : ${term} `,
        );
      }
    }

    //* Find Preacher --> One
    if (isUUID(term) && type === SearchType.their_preacher) {
      familyHome = await this.familyHousesRepository
        .createQueryBuilder('fh')
        .where('fh.their_preacher = :term', { term })
        .andWhere('fh.is_active = :isActive', { isActive: true })
        .getOne();

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro una FamilyHome con este their_preacher : ${term} `,
        );
      }
    }

    //* Find CoPastor --> Many
    if (isUUID(term) && type === SearchType.their_copastor) {
      familyHome = await this.familyHousesRepository
        .createQueryBuilder('fh')
        .where('fh.their_copastor = :term', { term })
        .andWhere('fh.is_active = :isActive', { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (familyHome.length === 0) {
        throw new BadRequestException(
          `No se encontro ninguna FamilyHome con este their_copastor : ${term} `,
        );
      }
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const familyHouses = await this.preacherRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
        });

        if (familyHouses.length === 0) {
          throw new NotFoundException(
            `Not found Preachers with these names: ${term}`,
          );
        }
        return familyHouses;
      } catch (error) {
        throw new BadRequestException(`This term is not a valid boolean value`);
      }
    }

    //! General Exceptions
    if (!isUUID(term) && type === SearchType.id) {
      throw new BadRequestException(`Not valid UUID`);
    }

    if (term && !Object.values(SearchType).includes(type as SearchType)) {
      throw new BadRequestException(
        `Type not valid, should be: ${Object.values(SearchType).join(', ')}`,
      );
    }

    return familyHome;
  }

  //TODO : esperar hacer lo de member para moldificar aqui cuando se suba de nivel y se tenga que asignar un nuevo preacher o copastor
  //* Si se actualize un nuevo copastor, de este se debe sacar Pastor y se setea
  //* Si se actualiza un nuevo preacher, de este se saca el Copastor y Pastor.
  //TODO : cuando se suba denivel un preacher a copastor, en casa familiar se eliminara el preacher, aqui se deve
  //* actualizar un nuevo preacher para esa casa o setear directo desde el member con rol preacher
  //! Al actualizar se setea el preacher aca y en tabla member su casa referenciado a este.\
  //! Y en member tmb cuando se asgina una nueva casa y es preacher en tabla casa-familiar tmb se setea el nuevo prewacher
  //! para guardar referencia
  async update(id: string, updateFamilyHomeDto: UpdateFamilyHomeDto) {
    const { their_preacher, is_active } = updateFamilyHomeDto;

    if (is_active === undefined) {
      throw new BadRequestException(
        `Debe asignar un valor booleano a is_Active`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataFamilyHome = await this.familyHousesRepository.findOneBy({ id });

    if (!dataFamilyHome) {
      throw new NotFoundException(`Preacher not found with id: ${id}`);
    }

    //* Asignacion y validacion de Preacher
    let preacher: Preacher;
    if (!their_preacher) {
      preacher = await this.preacherRepository.findOneBy({
        id: dataFamilyHome.their_preacher.id,
      });
    } else {
      preacher = await this.preacherRepository.findOneBy({
        id: their_preacher,
      });
    }

    if (!preacher) {
      throw new NotFoundException(
        `CoPastor Not found with id ${their_preacher}`,
      );
    }

    if (!preacher.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Validation pastor
    const pastor = await this.pastorRepository.findOneBy({
      id: preacher.their_pastor.id,
    });

    if (!pastor) {
      throw new NotFoundException(
        `Not faound Pastor with id ${preacher.their_pastor.id}`,
      );
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Validation coPastor
    const copastor = await this.coPastorRepository.findOneBy({
      id: preacher.their_copastor.id,
    });

    if (!copastor) {
      throw new NotFoundException(
        `Not faound Pastor with id ${preacher.their_copastor.id}`,
      );
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Conteo y asignacion de cantidad de miembros(id-familyHome tabla member)
    const allMembers = (await this.memberRepository.find()) ?? [];
    const membersFamilyHome = allMembers.filter(
      (members) => members.their_family_home.id === id,
    );

    const listMembersId = membersFamilyHome.map((member) => member.id);

    const familyHome = await this.familyHousesRepository.preload({
      id: id,
      ...updateFamilyHomeDto,
      their_pastor: pastor,
      their_copastor: copastor,
      their_preacher: preacher,
      members: listMembersId,
      count_members: listMembersId.length,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    try {
      await this.familyHousesRepository.save(familyHome);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return familyHome;
  }

  //* DELETE FOR ID
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataFamilyHome = await this.familyHousesRepository.findOneBy({ id });

    if (!dataFamilyHome) {
      throw new NotFoundException(`Preacher with id: ${id} not exits`);
    }

    const familyHome = await this.familyHousesRepository.preload({
      id: dataFamilyHome.id,
      is_active: false,
    });

    try {
      await this.familyHousesRepository.save(familyHome);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //! PRIVATE METHODS
  //* Para futuros errores de indices o constrains con code.
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }
}
