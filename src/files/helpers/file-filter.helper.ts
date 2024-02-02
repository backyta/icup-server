/* eslint-disable @typescript-eslint/ban-types */
export const fileFiler = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];

  const validExtension = ['jpeg', 'jpg', 'png'];

  if (validExtension.includes(fileExtension)) {
    return callback(null, true);
  }

  return callback(new Error('File is not valid'), false);
};
