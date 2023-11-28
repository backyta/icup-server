import { Repository } from 'typeorm';

export interface SearchFullnameOptions<T> {
  term: string;
  limit: number;
  offset: number;
  repository: Repository<T>;
}
