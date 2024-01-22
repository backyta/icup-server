import { join } from 'path';
import { existsSync } from 'fs';
import { BadGatewayException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  getStaticOfferingFile(imageName: string) {
    const path = join(__dirname, '../../uploads/offering-file', imageName);

    if (!existsSync(path)) {
      throw new BadGatewayException(`No product found with image ${imageName}`);
    }
    return path;
  }
}
