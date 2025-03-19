import sqlite3 from 'sqlite3';
import { open, Database, ISqlite } from 'sqlite';
import { from, mergeMap, Observable } from 'rxjs';

export function initDB(dbPath: string): Observable<Database> {
  return from(
    open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  );
}

export function createTable(db: Database, tableName: string, schema: string): Observable<void> {
  return from(db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (${schema});`));
}

export function alterTable(db: Database, tableName: string, newColumn: string): Observable<void> {
  return from(db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${newColumn};`));
}

export function dropTable(db: Database, tableName: string): Observable<void> {
  return from(db.exec(`DROP TABLE IF EXISTS ${tableName};`));
}

export function insertData(db: Database, tableName: string, columns: string[], values: any[]): Observable<ISqlite.RunResult<sqlite3.Statement>> {
  const placeholders = values.map(() => '?').join(', ');
  return from(db.run(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders});`, values));
}

export function updateData(
  db: Database,
  tableName: string,
  updates: string[],
  condition: string,
  values: any[]
): Observable<ISqlite.RunResult<sqlite3.Statement>> {
  return from(db.run(`UPDATE ${tableName} SET ${updates.join(', ')} WHERE ${condition};`, values));
}

export function deleteData(db: Database, tableName: string, condition: string, values: any[]): Observable<ISqlite.RunResult<sqlite3.Statement>> {
  return from(db.run(`DELETE FROM ${tableName} WHERE ${condition};`, values));
}

export async function testDB() {
  initDB('test.db')
    .pipe(mergeMap(db => createTable(db, 'users', 'id INTEGER PRIMARY KEY, name TEXT, age INTEGER')))
    .subscribe();
  // await createTable(db, 'users', 'id INTEGER PRIMARY KEY, name TEXT, age INTEGER');
  // await insertData(db, 'users', ['name', 'age'], ['Alice', 25]);
  // await updateData(db, 'users', ['age = ?'], 'name = ?', [26, 'Alice']);
  // await deleteData(db, 'users', 'name = ?', ['Alice']);
  // await dropTable(db, 'users');
  // await db.close();
}
