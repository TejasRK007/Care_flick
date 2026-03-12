import axios from 'axios';
import type { User } from '../types/user';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
  return response.data;
};
