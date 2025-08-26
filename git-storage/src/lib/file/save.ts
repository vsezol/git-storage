import * as fs from 'fs/promises';
import * as path from 'path';

export async function saveToFile(filePath: string, data: any): Promise<void> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to save data to file: ${error.message}`);
  }
}
