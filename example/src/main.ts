import { GitStorage } from '@vsezol/git-storage';

async function main() {
  const gitStorage = new GitStorage<GitStorageState>({
    repositoryUrl: 'https://github.com/vsezol/git-storage-data',
    fileName: 'vsezol',
  });
  try {
    await gitStorage.init();
    await gitStorage.set('user', {
      id: 1,
      name: `Vsevolod`,
      age: 23,
    });
    await gitStorage.patch('user', {
      name: `Vsevolod Zolotov`,
    });
    await gitStorage.set('posts', [
      {
        authorId: 1,
        text: 'First post',
      },
    ]);
    await gitStorage.patch('posts', [
      {
        authorId: 1,
        text: 'Second post',
      },
      {
        authorId: 1,
        text: 'Third post',
      },
    ]);
    await gitStorage.delete('user');
    await gitStorage.delete('posts');
    await gitStorage.sync();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

interface GitStorageState {
  user: User;
  posts: Post[];
}

interface User {
  id: number;
  name: string;
  age: number;
}

interface Post {
  text: string;
  authorId: number;
}
