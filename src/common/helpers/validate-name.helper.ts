import { BadRequestException } from '@nestjs/common';

export const validateName = (name: string): string => {
  let wordString: string;

  if (/^[^+]+(?:\+[^+]+)*\+$/.test(name)) {
    const sliceWord = name.slice(0, -1);
    wordString = sliceWord.split('+').join(' ');
  } else {
    throw new BadRequestException(
      `${
        !name ? 'Empty value' : name
      } not valid, use letters and '+' to finally string`,
    );
  }
  return wordString;
};

//? What does this?
//? /^[^+]+(?:\+[^+]+)*\+$/.

//! This Regex validates:
//* No comienze con signo +
//* termina con signo +
//* Puede tener múltiples secciones que consisten en un "+" seguido de uno o más caracteres que no sean un "+".

//! For example:
//* hola+mundo+
//* a+b+c+d+
//* 123+456+789+
