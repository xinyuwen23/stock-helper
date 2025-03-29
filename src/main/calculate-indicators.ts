import { FILE_PATH } from '../constants';
import { saveMACDToJSON, saveRSIToJSON } from '../indicators';

const filePath = FILE_PATH.STOCK;

export function calculateIndicators() {
  saveMACDToJSON(filePath);
  saveRSIToJSON(filePath);
}
