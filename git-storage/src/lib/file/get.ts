import * as fs from 'fs/promises';

export async function getFromFile<T>(filePath: string): Promise<T | undefined> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    return jsonData || undefined;
  } catch {
    return undefined;
  }
}
