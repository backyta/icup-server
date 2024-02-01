import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { OfferingsService } from './offerings.service';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { UpdateOfferingDto } from './dto/update-offering.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';
import { Auth, GetUser } from '../auth/decorators';

import { User } from '../users/entities/user.entity';
import { Offering } from './entities/offering.entity';

@ApiTags('Offerings')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized Bearer Auth.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error, check logs.',
})
@ApiBadRequestResponse({
  description: 'Bad request.',
})
@Controller('offerings')
export class OfferingsController {
  constructor(private readonly offeringsService: OfferingsService) {}

  //* Create
  @Post()
  @Auth(
    ValidUserRoles.superUser,
    ValidUserRoles.adminUser,
    ValidUserRoles.treasurerUser,
  )
  @ApiCreatedResponse({
    description: 'Offering record has been successfully created.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  create(
    @Body() createOfferingDto: CreateOfferingDto,
    @GetUser() user: User,
  ): Promise<Offering> {
    return this.offeringsService.create(createOfferingDto, user);
  }

  //* Fin All
  @Get()
  @Auth()
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiNotFoundResponse({
    description: 'Not found resource.',
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<Offering[]> {
    return this.offeringsService.findAll(paginationDto);
  }

  //* Find By Term
  @Get(':term')
  @Auth()
  @ApiParam({
    name: 'term',
    description: 'Could be id, names, code, roles, etc.',
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiNotFoundResponse({
    description: 'Not found resource.',
  })
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Offering | Offering[]> {
    return this.offeringsService.findTerm(term, searchTypeAndPaginationDto);
  }

  //* Update
  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  @ApiOkResponse({
    description: 'Successful operation',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @Auth(
    ValidUserRoles.superUser,
    ValidUserRoles.adminUser,
    ValidUserRoles.treasurerUser,
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOfferingDto: UpdateOfferingDto,
    @GetUser() user: User,
  ): Promise<Offering> {
    return this.offeringsService.update(id, updateOfferingDto, user);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.offeringService.remove(+id);
  // }
}
