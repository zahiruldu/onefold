/** Simulated data layer. Replace with real DB calls. */
import type { User } from '../shared/types';

const USERS: User[] = [
  { id: 1, name: 'Alice Johnson', role: 'Admin', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', role: 'Developer', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Brown', role: 'Designer', email: 'charlie@example.com' },
  { id: 4, name: 'Diana Prince', role: 'PM', email: 'diana@example.com' },
  { id: 5, name: 'Eve Wilson', role: 'DevOps', email: 'eve@example.com' },
];

export async function getUsers(): Promise<User[]> {
  // Simulate async DB call
  await new Promise(r => setTimeout(r, 20));
  return USERS;
}
