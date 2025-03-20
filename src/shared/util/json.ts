import * as fs from 'fs';
import { FILE_PATH } from '../constants';

export const createOrReadJSON = (filePath: FILE_PATH): any[] => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }

    const data = fs.readFileSync(filePath, 'utf8');

    return JSON.parse(data);
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

export const readDataFromJSON = (filePath: FILE_PATH): any[] => {
  try {
    const data = createOrReadJSON(filePath);
    return data;
  } catch (err) {
    console.error('Error reading data:', err);
    return [];
  }
};

export function testJSON() {
  const filePath = FILE_PATH.SP500;

  const dataToAdd: any = { id: 1, name: 'Item 1' };
  const data = createOrReadJSON(filePath);

  console.log(data);
  // data.push(dataToAdd);
  // saveDataToJSON(filePath, data);

  // updateDataInJSON(
  //   filePath,
  //   item => item.id === 1,
  //   item => ({ ...item, name: 'Updated Item 1' })
  // );

  // deleteDataInJSON(filePath, item => item.id === 1);

  const allData = readDataFromJSON(filePath);
  console.log(allData);
}
