import { FILE_PATH } from '../constants';
import { saveMACDToJSON } from '../indicators';

export function calculateIndicators() {
  saveMACDToJSON(FILE_PATH.STOCK);
}
