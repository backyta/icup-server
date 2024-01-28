import { Repository } from 'typeorm';

export interface SearchFullNameOptions<T> {
  term: string;
  limit: number;
  offset: number;
  search_repository: Repository<T>;
}
