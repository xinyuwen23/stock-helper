import { retrieveStockData } from './main';
import { testJSON } from './shared/util';

function main() {
  retrieveStockData().subscribe();
}

main();

function test() {
  testJSON();
}

// test();
