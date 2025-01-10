import { Repository } from 'typeorm';

import { Pastor } from '@/modules/pastor/entities/pastor.entity';
import { Copastor } from '@/modules/copastor/entities/copastor.entity';
import { Preacher } from '@/modules/preacher/entities/preacher.entity';
import { Disciple } from '@/modules/disciple/entities/disciple.entity';
import { Supervisor } from '@/modules/supervisor/entities/supervisor.entity';

export type RepositoryType =
  | Repository<Pastor>
  | Repository<Copastor>
  | Repository<Supervisor>
  | Repository<Preacher>
  | Repository<Disciple>;
