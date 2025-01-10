import {
  Get,
  Body,
  Patch,
  Param,
  Query,
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { PaginationDto } from '@/common/dtos/pagination.dto';

import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';

import { User } from '@/modules/user/entities/user.entity';
import { UserRole } from '@/modules/auth/enums/user-role.enum';

import { UpdateExternalDonorDto } from '@/modules/external-donor/dto/update-external-donor.dto';

import { ExternalDonor } from '@/modules/external-donor/entities/external-donor.entity';
import { ExternalDonorService } from '@/modules/external-donor/external-donor.service';

@ApiTags('Donadores-Externos')
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
@SkipThrottle()
@Controller('external-donor')
export class ExternalDonorController {
  constructor(private readonly externalDonorService: ExternalDonorService) {}

  //* FIND ALL
  @Get()
  @Auth()
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiNotFoundResponse({
    description: 'Not found resource.',
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<ExternalDonor[]> {
    return this.externalDonorService.findAll(paginationDto);
  }

  //* UPDATE
  @Patch(':id')
  @Auth(UserRole.SuperUser, UserRole.AdminUser)
  @ApiOkResponse({
    description: 'Successful operation',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExternalDonorDto: UpdateExternalDonorDto,
    @GetUser() user: User,
  ): Promise<ExternalDonor> {
    return this.externalDonorService.update(id, updateExternalDonorDto, user);
  }
}
