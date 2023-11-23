import { BadRequestException } from '@nestjs/common';

export const validateName = (name: string): string => {
  let wordString: string;

  if (/^[^+]+(?:\+[^+]+)*\+$/.test(name)) {
    const sliceWord = name.slice(0, -1);
    wordString = sliceWord.split('+').join(' ');
  } else {
    throw new BadRequestException(
      `${name} not valid use '+' to finally string`,
    );
  }
  return wordString;
};
