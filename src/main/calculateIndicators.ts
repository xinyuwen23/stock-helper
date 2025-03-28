import { FILE_PATH } from '../shared/constants';
import { saveMACDToJSON } from '../shared/util';

export function calculateIndicators() {
  saveMACDToJSON(FILE_PATH.STOCK);
}
