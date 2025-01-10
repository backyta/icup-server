import * as bcrypt from 'bcrypt';

export const generateCodeChurch = (name: string) => {
  const baseCode = name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' - ')
    .map((part) => part.trim())
    .map((part, index) => {
      if (index === 0) return part.toUpperCase();
      const words = part.split(' ');
      if (words.length === 1) return part.toUpperCase();
      return words.map((word) => word.charAt(0).toUpperCase()).join('');
    })
    .join('-')
    .toUpperCase();

  const hash = bcrypt.hashSync(baseCode, 10);

  const shortHash = hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);

  return `${baseCode}-${shortHash}`;
};
