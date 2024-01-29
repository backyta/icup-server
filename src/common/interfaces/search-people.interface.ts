import { Repository } from 'typeorm';
import { SearchType } from '../enums/search-types.enum';
import { SearchTypeOfName } from '../enums/search-type-by-name';
import { TypeEntity } from '../enums/type-entity.enum';

export interface SearchPeopleOptions {
  term: string;
  search_type: SearchType;
  limit: number;
  offset: number;
  type_entity: TypeEntity;
  type_of_name: SearchTypeOfName;
  search_repository: Repository<any>;
  entity_repository: Repository<any>;
}
