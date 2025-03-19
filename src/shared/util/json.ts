import * as fs from 'fs';

// 定义数据项的接口

export enum FilePath {
  SP500 = 'sp500.json',
}

// 创建或读取 JSON 文件
export const createOrReadJSON = (filePath: FilePath): unknown[] => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([])); // 如果文件不存在，则创建一个空数组
    }

    const data = fs.readFileSync(filePath, 'utf8');

    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading or creating file:', err);

    return [];
  }
};

// 存入数据
export const saveDataToJSON = (filePath: FilePath, data: unknown[]): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // 格式化输出
    console.log('Data saved successfully');
  } catch (err) {
    console.error('Error saving data:', err);
  }
};

// 更新数据
export const updateDataInJSON = (filePath: FilePath, conditionFn: (item: unknown) => boolean, updateFn: (item: unknown) => unknown): void => {
  try {
    const data = createOrReadJSON(filePath);
    const updatedData = data.map(item => (conditionFn(item) ? updateFn(item) : item)); // 更新符合条件的数据
    saveDataToJSON(filePath, updatedData);
    console.log('Data updated successfully');
  } catch (err) {
    console.error('Error updating data:', err);
  }
};

// 删除数据
export const deleteDataInJSON = (filePath: FilePath, conditionFn: (item: unknown) => boolean): void => {
  try {
    const data = createOrReadJSON(filePath);
    const filteredData = data.filter(item => !conditionFn(item)); // 删除符合条件的数据
    saveDataToJSON(filePath, filteredData);
    console.log('Data deleted successfully');
  } catch (err) {
    console.error('Error deleting data:', err);
  }
};

// 读取数据
export const readDataFromJSON = (filePath: FilePath): unknown[] => {
  try {
    const data = createOrReadJSON(filePath);
    return data; // 返回整个数据
  } catch (err) {
    console.error('Error reading data:', err);
    return [];
  }
};

export function testJSON() {
  // 示例用法
  const filePath = FilePath.SP500;

  // 添加数据
  const dataToAdd: unknown = { id: 1, name: 'Item 1' };
  const data = createOrReadJSON(filePath);

  console.log(data);
  // data.push(dataToAdd);
  // saveDataToJSON(filePath, data);

  // 更新数据
  // updateDataInJSON(
  //   filePath,
  //   item => item.id === 1,
  //   item => ({ ...item, name: 'Updated Item 1' })
  // );

  // 删除数据
  // deleteDataInJSON(filePath, item => item.id === 1);

  // 读取数据
  const allData = readDataFromJSON(filePath);
  console.log(allData);
}
