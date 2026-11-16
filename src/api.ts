//funkcje odpowiedzialne za odpytywanie serwerów Hacker News (fetch, Promise.all)

import { HNItem, HNUser } from './types';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';
// asynchroniczna funkcja, która przyjmuje numer id (np. 8863), pobiera z API pojedynczy artykuł lub komentarz i zwraca go jako obiekt typu HNItem
export async function fetchItem(id: number): Promise<HNItem> {
    const response = await fetch(`${BASE_URL}/item/${id}.json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch item with ID ${id}`);
    }
    const data: HNItem = await response.json();
    return data;
}
export async function fetchMainPosts(type: 'top' | 'new'): Promise<HNItem[]> {
    const response = await fetch(`${BASE_URL}/${type}stories.json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch main posts`);
    }
    const ids: number[] = await response.json();
    const topIds = ids.slice(0, 30);
    // zamieniamy każdy numer ID na wywołanie Twojej funkcji fetchItem i odpalamy je wszystkie równolegle za pomocą Promise.all:
    const posts = await Promise.all(topIds.map((id) => fetchItem(id)));
return posts;
}
export async function fetchUser(id: string): Promise<HNUser> {
    const response = await fetch(`${BASE_URL}/user/${id}.json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch user with ID ${id}`);
    }
    const data: HNUser = await response.json();
    return data;
}
export async function fetchComments(ids: number[]): Promise<HNItem[]> {
    return Promise.all(ids.slice(0, 30).map((id) => fetchItem(id)));
}

