import * as fs from 'fs';
import { merge } from 'lodash';
import { FILE_PATH } from '../constants';

export const createOrReadJSON = (filePath: FILE_PATH): any[] => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }

    const data = fs.readFileSync(filePath, 'utf8');

    if (!data) {
      fs.writeFileSync(filePath, JSON.stringify([]));

      return [];
    }

    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading or creating file:', err);

    return [];
  }
};

export const addDataToJSON = (filePath: FILE_PATH, data: any[]): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Data added successfully');
  } catch (err) {
    console.error('Error saving data:', err);
  }
};

export const patchDataToJSON = (filePath: FILE_PATH, newData: any[], primaryKey: string): void => {
  try {
    const existingData = createOrReadJSON(filePath);

    const dataMap = new Map(existingData.map(item => [item[primaryKey], item]));

    newData.forEach(newItem => {
      if (dataMap.has(newItem[primaryKey])) {
        const existingItem = dataMap.get(newItem[primaryKey]);

        merge(existingItem, newItem);

        dataMap.set(newItem[primaryKey], existingItem);
      } else {
        dataMap.set(newItem[primaryKey], newItem);
      }
    });

    const updatedData = Array.from(dataMap.values());

    addDataToJSON(filePath, updatedData);
  } catch (err) {
    console.error('Error patching data:', err);
  }
};

export function testJSON() {
  const filePath = FILE_PATH.TEST;

  const data1 = { id: 1, data: 'data 1' };
  const data2 = { id: 2, data: 'data 2' };
  const data3 = { id: 3, data: 'data 3' };
  const updateData3 = { id: 3, data: 'updated data 3' };

  const data = createOrReadJSON(filePath);

  data.push(data1);
  data.push(data2);
  data.push(data3);
  data.push(updateData3);

  // saveDataToJSON(filePath, data);

  patchDataToJSON(filePath, data, 'id');

  const allData = createOrReadJSON(filePath);
  console.log(allData);
}
