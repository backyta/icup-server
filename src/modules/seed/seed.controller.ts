import { BadRequestException, Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';

import { UserRole } from '@/modules/auth/enums/user-role.enum';
import { Auth } from '@/modules/auth/decorators/auth.decorator';

import { SeedService } from '@/modules/seed/seed.service';

@ApiTags('Seed')
@ApiBearerAuth()
@ApiOkResponse({
  description: 'SEED executed Successful.',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized Bearer Auth.',
})
@ApiForbiddenResponse({
  description: 'Forbidden.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error, check logs.',
})
@SkipThrottle()
@Controller('seed')
export class SeedController {
  constructor(
    private readonly seedService: SeedService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Auth(UserRole.SuperUser)
  executeSeed(): Promise<string> {
    // if (this.configService.get('STAGE') === 'prod') {
    //   throw new BadRequestException('Cannot run seed in production.');
    // }

    return this.seedService.runSeed();
  }
}
