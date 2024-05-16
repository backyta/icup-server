import { Repository } from 'typeorm';
import { SearchType } from '@/common/enums';

export interface SearchNamesOptions<T> {
  term: string;
  search_type: SearchType;
  limit: number;
  offset: number;
  search_repository: Repository<T>;
}
