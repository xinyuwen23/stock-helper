import { tap } from 'rxjs';
import { calculateIndicators, retrieveStockData } from './main';

function main() {
  retrieveStockData()
    .pipe(tap(() => calculateIndicators()))
    .subscribe();
}

main();
