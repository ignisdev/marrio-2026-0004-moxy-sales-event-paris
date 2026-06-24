import * as migration_20260624_110437_initial from './20260624_110437_initial';

export const migrations = [
  {
    up: migration_20260624_110437_initial.up,
    down: migration_20260624_110437_initial.down,
    name: '20260624_110437_initial'
  },
];
