import * as migration_20261107_191856_initial from './20261107_191856_initial';
import * as migration_20261119_101833_measurement_units_and_details from './20261119_101833_measurement_units_and_details';
import * as migration_20261119_110608_market_prices_and_shipping from './20261119_110608_market_prices_and_shipping';
import * as migration_20261119_124000_customer_accounts from './20261119_124000_customer_accounts';
import * as migration_20261119_140437_admin_fulfilment from './20261119_140437_admin_fulfilment';
import * as migration_20261122_071203_team_notes from './20261122_071203_team_notes';
import * as migration_20261122_074311_waist_replaces_height from './20261122_074311_waist_replaces_height';
import * as migration_20261123_080316_seven_locales from './20261123_080316_seven_locales';

export const migrations = [
  {
    up: migration_20261107_191856_initial.up,
    down: migration_20261107_191856_initial.down,
    name: '20261107_191856_initial',
  },
  {
    up: migration_20261119_101833_measurement_units_and_details.up,
    down: migration_20261119_101833_measurement_units_and_details.down,
    name: '20261119_101833_measurement_units_and_details',
  },
  {
    up: migration_20261119_110608_market_prices_and_shipping.up,
    down: migration_20261119_110608_market_prices_and_shipping.down,
    name: '20261119_110608_market_prices_and_shipping',
  },
  {
    up: migration_20261119_124000_customer_accounts.up,
    down: migration_20261119_124000_customer_accounts.down,
    name: '20261119_124000_customer_accounts',
  },
  {
    up: migration_20261119_140437_admin_fulfilment.up,
    down: migration_20261119_140437_admin_fulfilment.down,
    name: '20261119_140437_admin_fulfilment',
  },
  {
    up: migration_20261122_071203_team_notes.up,
    down: migration_20261122_071203_team_notes.down,
    name: '20261122_071203_team_notes',
  },
  {
    up: migration_20261122_074311_waist_replaces_height.up,
    down: migration_20261122_074311_waist_replaces_height.down,
    name: '20261122_074311_waist_replaces_height',
  },
  {
    up: migration_20261123_080316_seven_locales.up,
    down: migration_20261123_080316_seven_locales.down,
    name: '20261123_080316_seven_locales'
  },
];
