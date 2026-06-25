import * as migration_20260624_110437_initial from './20260624_110437_initial';
import * as migration_20260625_134347_qr_external_urls from './20260625_134347_qr_external_urls';

export const migrations = [
  {
    up: migration_20260624_110437_initial.up,
    down: migration_20260624_110437_initial.down,
    name: '20260624_110437_initial',
  },
  {
    up: migration_20260625_134347_qr_external_urls.up,
    down: migration_20260625_134347_qr_external_urls.down,
    name: '20260625_134347_qr_external_urls'
  },
];
