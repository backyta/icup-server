import { Repository } from 'typeorm';

export interface SearchFullnameOptions {
  term: string;
  limit: number;
  offset: number;
  repository: Repository<any>;
}
