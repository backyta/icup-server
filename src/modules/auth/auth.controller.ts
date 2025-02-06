import {
  Get,
  Req,
  Res,
  Body,
  Post,
  HttpCode,
  Controller,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

import { AuthService } from '@/modules/auth/auth.service';
import { LoginUserDto } from '@/modules/auth/dto/login-user.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    '🔒 Unauthorized: Missing or invalid Bearer Token. Please provide a valid token to access this resource.',
})
@ApiInternalServerErrorResponse({
  description:
    '🚨 Internal Server Error: An unexpected error occurred on the server. Please check the server logs for more details.',
})
@ApiBadRequestResponse({
  description:
    '❌ Bad Request: The request contains invalid data or parameters. Please verify the input and try again.',
})
@ApiForbiddenResponse({
  description:
    '🚫 Forbidden: You do not have the necessary permissions to access this resource.',
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //* Login
  @Post('login')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(200)
  @ApiOkResponse({
    description:
      '✅ Operation Successful: The login process was completed successfully, and the response includes the authentication token and user details.',
  })
  loginUser(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    return this.authService.login(loginUserDto, res);
  }

  //* Refresh token
  @Get('renew-token')
  @ApiOkResponse({
    description: '✅ Success: The new access token was successfully generated.',
  })
  @SkipThrottle()
  async renewAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = await req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('No se encontró el refresh token.');
    }

    const newAccessToken =
      await this.authService.renewAccessToken(refreshToken);

    return res.json({ accessToken: newAccessToken });
  }
}
