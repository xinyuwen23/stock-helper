import * as fs from 'fs';
import { FILE_PATH } from '../constants';

export const createOrReadJSON = (filePath: FILE_PATH): any[] => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }

    const data = fs.readFileSync(filePath, 'utf8');

    if (data) {
      return JSON.parse(data);
    }

    return [];
  } catch (err) {
    console.error('Error reading or creating file:', err);

    return [];
  }
};

export const saveDataToJSON = (filePath: FILE_PATH, data: any[]): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Data saved successfully');
  } catch (err) {
    console.error('Error saving data:', err);
  }
};

export const patchDataToJSON = (filePath: FILE_PATH, newData: any[]): void => {
  try {
    const existingData = createOrReadJSON(filePath);

    const existingDataSet = new Set(existingData.map(item => JSON.stringify(item)));

    const filteredData = newData.filter(item => !existingDataSet.has(JSON.stringify(item)));

    if (filteredData.length > 0) {
      saveDataToJSON(filePath, [...existingData, ...filteredData]);
    } else {
      console.log('No new data to patch');
    }
  } catch (err) {
    console.error('Error patching data:', err);
  }
};

export const updateDataInJSON = (filePath: FILE_PATH, conditionFn: (item: any) => boolean, updateFn: (item: any) => any): void => {
  try {
    const data = createOrReadJSON(filePath);
    const updatedData = data.map(item => (conditionFn(item) ? updateFn(item) : item));
    saveDataToJSON(filePath, updatedData);
    console.log('Data updated successfully');
  } catch (err) {
    console.error('Error updating data:', err);
  }
};

export const deleteDataInJSON = (filePath: FILE_PATH, conditionFn: (item: any) => boolean): void => {
  try {
    const data = createOrReadJSON(filePath);
    const filteredData = data.filter(item => !conditionFn(item));
    saveDataToJSON(filePath, filteredData);
    console.log('Data deleted successfully');
  } catch (err) {
    console.error('Error deleting data:', err);
  }
};

export function testJSON() {
  const filePath = FILE_PATH.TEST;

  const data1 = { id: 1, name: 'data 1' };

  const data = createOrReadJSON(filePath);

  data.push(data1);

  // saveDataToJSON(filePath, data);

  patchDataToJSON(filePath, data);

  // updateDataInJSON(
  //   filePath,
  //   item => item.id === 1,
  //   item => ({ ...item, name: 'updated data 1' })
  // );

  // deleteDataInJSON(filePath, item => item.id === 1);

  const allData = createOrReadJSON(filePath);
  console.log(allData);
}
