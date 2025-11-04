import fs from 'fs';
import path from 'path';

export class DatabaseService {
  private dataDir: string;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private getFilePath(filename: string): string {
    return path.join(this.dataDir, `${filename}.json`);
  }

  async read<T>(filename: string): Promise<T[]> {
    const filePath = this.getFilePath(filename);
    
    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  async write<T>(filename: string, data: T[]): Promise<void> {
    const filePath = this.getFilePath(filename);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      throw error;
    }
  }

  async findOne<T extends { id: string }>(
    filename: string,
    predicate: (item: T) => boolean
  ): Promise<T | null> {
    const items = await this.read<T>(filename);
    return items.find(predicate) || null;
  }

  async findMany<T>(
    filename: string,
    predicate?: (item: T) => boolean
  ): Promise<T[]> {
    const items = await this.read<T>(filename);
    return predicate ? items.filter(predicate) : items;
  }

  async create<T extends { id: string }>(
    filename: string,
    item: T
  ): Promise<T> {
    const items = await this.read<T>(filename);
    items.push(item);
    await this.write(filename, items);
    return item;
  }

  async update<T extends { id: string }>(
    filename: string,
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    const items = await this.read<T>(filename);
    const index = items.findIndex((item) => item.id === id);
    
    if (index === -1) {
      return null;
    }

    items[index] = { ...items[index], ...updates };
    await this.write(filename, items);
    return items[index];
  }

  async delete<T extends { id: string }>(
    filename: string,
    id: string
  ): Promise<boolean> {
    const items = await this.read<T>(filename);
    const filteredItems = items.filter((item) => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false;
    }

    await this.write(filename, filteredItems);
    return true;
  }
}

export const db = new DatabaseService();
