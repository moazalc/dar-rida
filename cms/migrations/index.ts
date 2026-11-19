import * as migration_20261107_191856_initial from './20261107_191856_initial';
import * as migration_20261119_101833_measurement_units_and_details from './20261119_101833_measurement_units_and_details';
import * as migration_20261119_110608_market_prices_and_shipping from './20261119_110608_market_prices_and_shipping';
import * as migration_20261119_124000_customer_accounts from './20261119_124000_customer_accounts';
import * as migration_20261119_140437_admin_fulfilment from './20261119_140437_admin_fulfilment';

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
    name: '20261119_140437_admin_fulfilment'
  },
];
