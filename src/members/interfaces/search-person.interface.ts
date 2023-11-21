import { SearchType } from '../enums/search-types.enum';

export interface SearchPersonOptions {
  term: string;
  searchType: SearchType;
  limit: number;
  offset: number;
}
