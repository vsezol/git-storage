# GitStorage

A TypeScript library that provides Git-based persistent storage with automatic synchronization. Store your application data in a Git repository with full version control, automatic commits, and seamless data persistence.

## Features

- 🚀 **Git-based Storage**: Store data directly in Git repositories
- 🔄 **Auto Synchronization**: Automatic pull/push operations
- 📝 **Type Safety**: Full TypeScript support with generics
- 🔒 **Version Control**: Every change is tracked with Git commits
- 🌐 **Remote Backup**: Data is automatically backed up to remote repositories
- 🔧 **Flexible Configuration**: Customizable branches, file names, and authors

## Use Cases

- **Configuration Management**: Store application settings with version history
- **User Data Persistence**: Maintain user profiles and preferences
- **Content Management**: Store and version content data
- **Backup Solutions**: Automatic data backup with Git history
- **Distributed Data**: Share data across multiple applications
- **Audit Trails**: Track all data changes with Git commits

## Installation

```bash
npm install @vsezol/git-storage
```

## Quick Start

```typescript
import { GitStorage } from '@vsezol/git-storage';

// Define your data structure
interface MyData {
  users: User[];
  settings: AppSettings;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
}

// Initialize GitStorage
const storage = new GitStorage<MyData>({
  repositoryUrl: 'https://github.com/your-username/your-data-repo',
  fileName: 'app-data',
  branch: 'main',
});

async function main() {
  // Initialize the storage
  await storage.init();

  // Store data
  await storage.set('users', [{ id: 1, name: 'John Doe', email: 'john@example.com' }]);

  await storage.set('settings', {
    theme: 'dark',
    language: 'en',
  });

  // Read data
  const users = storage.get('users');
  console.log('Users:', users);

  // Update data
  await storage.patch('settings', { theme: 'light' });

  // Synchronize with remote repository
  await storage.sync();
}

main().catch(console.error);
```

## Configuration Options

```typescript
interface GitStorageOptions {
  repositoryUrl: string; // Git repository URL (required)
  branch?: string; // Git branch (default: 'main')
  fileName?: string; // JSON file name (default: 'root')
  localPath?: string; // Local repository path (auto-generated)
  author?: GitAuthor; // Git commit author
}

interface GitAuthor {
  name: string; // Author name
  email: string; // Author email
}
```

### Example with Full Configuration

```typescript
const storage = new GitStorage<MyData>({
  repositoryUrl: 'https://github.com/your-username/your-data-repo',
  branch: 'data-storage',
  fileName: 'production-data',
  author: {
    name: 'Your App',
    email: 'app@yourcompany.com',
  },
});
```

## API Reference

| Method                         | Description                                                 | Parameters                                                   | Returns             |
| ------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------ | ------------------- |
| `init()`                       | Initialize storage and clone/sync repository                | -                                                            | `Promise<void>`     |
| `get<K>(key)`                  | Retrieve data by key                                        | `key: K`                                                     | `T[K] \| undefined` |
| `set<K>(key, data, commit?)`   | Store data with key                                         | `key: K`, `data: T[K]`, `commit?: string`                    | `Promise<void>`     |
| `patch<K>(key, data, commit?)` | Update existing data (merge for objects, append for arrays) | `key: K`, `data: Partial<T[K]> \| T[K][]`, `commit?: string` | `Promise<void>`     |
| `delete<K>(key, commit?)`      | Delete data by key                                          | `key: K`, `commit?: string`                                  | `Promise<boolean>`  |
| `clear(commit?)`               | Clear all data                                              | `commit?: string`                                            | `Promise<void>`     |
| `sync()`                       | Synchronize with remote repository (pull + push)            | -                                                            | `Promise<void>`     |

## Advanced Examples

### Working with Arrays

```typescript
interface BlogData {
  posts: BlogPost[];
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
}

const blogStorage = new GitStorage<BlogData>({
  repositoryUrl: 'https://github.com/your-username/blog-data',
});

await blogStorage.init();

// Set initial posts
await blogStorage.set('posts', [{ id: 1, title: 'First Post', content: 'Hello World!', createdAt: new Date() }]);

// Add new posts (patch appends to arrays)
await blogStorage.patch('posts', [{ id: 2, title: 'Second Post', content: 'More content...', createdAt: new Date() }]);
```

### Working with Objects

```typescript
interface UserProfile {
  profile: {
    name: string;
    email: string;
    preferences: {
      theme: string;
      notifications: boolean;
    };
  };
}

const userStorage = new GitStorage<UserProfile>({
  repositoryUrl: 'https://github.com/your-username/user-data',
});

await userStorage.init();

// Set initial profile
await userStorage.set('profile', {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'light',
    notifications: true,
  },
});

// Update only preferences (patch merges objects)
await userStorage.patch('profile', {
  preferences: {
    theme: 'dark',
  },
});
```

### Custom Commit Messages

```typescript
// Custom commit messages for better tracking
await storage.set('users', userData, 'Added new user registration');
await storage.patch('settings', newSettings, 'Updated theme preferences');
await storage.delete('tempData', 'Cleaned up temporary data');
```

### Error Handling

```typescript
try {
  await storage.init();

  // Attempt to patch non-existent data
  await storage.patch('nonExistent', { some: 'data' });
} catch (error) {
  if (error.message.includes('does not exist')) {
    console.log('Key does not exist, using set() instead');
    await storage.set('nonExistent', { some: 'data' });
  }
}
```

## Repository Structure

GitStorage creates a simple file structure in your Git repository:

```
your-data-repo/
├── your-file-name.json    # Your data in JSON format
└── .git/                  # Git metadata
```

The JSON file contains your data in a flat key-value structure:

```json
{
  "users": [...],
  "settings": {...},
  "posts": [...]
}
```

## Requirements

- Node.js 16+
- Git installed on the system
- Write access to the specified Git repository

## License

MIT License - see [LICENSE](LICENSE) file for details.
