import { Repository } from 'typeorm';

import { SearchType, SearchTypeOfName, TypeEntity } from '@/common/enums';

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
