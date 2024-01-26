import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException(`User not found (request)`);
    }

    return !data ? user : user[data];
  },
);

//! Este es un decordor personalizado de parametro, en la ruta, esto a diferencia de usar el @Req
//! Nos permite hacer validaciones y obtener data del contexto, que es el user que paso por el AuhtGuard

//* Con este decorador nos aseguramos de sacar el usario, del contexto y tmb de validar si paso por el
//* authguard, si no lanza error.

//* Lo que sea que retorne este docorador personalizado, createParamDecorator, va retonralo cuando lo llamemos
//* en la autenticacion de la ruta con el @GetUser.

//! Una de las ventajas del createParamDecorator, es que voy a tener la data y el contexto.
//! El contexto es el contexto en el momento que se esta ejecutando nest, y esta la request, de aqui take user.

//! El error de que no esta el user o no encuentra, is because, no paso por el AuthGuard
