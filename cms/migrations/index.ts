import * as migration_20261107_191856_initial from './20261107_191856_initial';
import * as migration_20261119_101833_measurement_units_and_details from './20261119_101833_measurement_units_and_details';

export const migrations = [
  {
    up: migration_20261107_191856_initial.up,
    down: migration_20261107_191856_initial.down,
    name: '20261107_191856_initial',
  },
  {
    up: migration_20261119_101833_measurement_units_and_details.up,
    down: migration_20261119_101833_measurement_units_and_details.down,
    name: '20261119_101833_measurement_units_and_details'
  },
];
