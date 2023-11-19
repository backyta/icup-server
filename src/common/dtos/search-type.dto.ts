import { IsString } from 'class-validator';

export class QueryTypeDto {
  @IsString()
  type: string;
}
