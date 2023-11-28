import { Repository } from 'typeorm';
import { SearchType } from '../enums/search-types.enum';

export interface SearchPersonOptions<T> {
  term: string;
  searchType: SearchType;
  limit: number;
  offset: number;
  repository: Repository<T>;
}
