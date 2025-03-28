import { FILE_PATH } from './shared/constants';
import { saveMACDToJSON } from './shared/util';

function test() {
  saveMACDToJSON(FILE_PATH.TEST);
}

test();
