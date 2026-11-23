//sam serwer HTTP, odczyt szablonów HTML i przekazywanie gotowego widoku do przeglądarki - NAJWAZNIEJSZY plik w projekcie, bo to on łączy wszystkie elementy w całość
// 1. IMPORTY WBUDOWANYCH MODUŁÓW NODE.JS
import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fetchMainPosts, fetchItem, fetchUser, fetchComments } from './api';
import { HNItem, HNUser } from './types';

//// Pomocnicza funkcja zamieniająca Unix Timestamp na czytelną datę
function formatData(unixTimestamp: number): string {
    const data = new Date(unixTimestamp * 1000); // Unix Timestamp jest w sekundach, a JS używa milisekund
    return data.toLocaleString('en-US', 
        { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
}
// Generowanie htmlu dla Top i New
//Metoda .map() zwróciła nam tablicę 30 oddzielnych elementów HTML typu <li>...</li>.
//.join('') skleja je wszystkie jeden po drugim w jeden ciąg tekstowy (usuwając przecinki, które normalnie pojawiłyby się przy łączeniu tablic w JS).
//Na samym końcu funkcja owija te wszystkie elementy w główną listę HTML: <ul class="stories-list">${listItems}</ul> i zwraca gotowy kod.

const renderPosts = (posts: HNItem[]): string => {
  const listItems = posts.map(post => {
    let domain = '';
        if (post.url) {
            try {
                domain = `(${new URL(post.url).hostname.replace('www.', '')})`;
            } catch {}
        }
        return `
            <li class="story-card">
                <a href="${post.url || `/item?id=${post.id}`}" class="story-title" target="_blank" rel="noopener">
                    ${post.title}
                </a>
                <span style="font-size: 0.9rem; color: var(--text-muted); margin-left: 0.4rem;">${domain}</span>
                <div class="meta-info">
                    ${post.score || 0} points by 
                    <a href="/user?id=${post.by || ''}">${post.by || 'unknown'}</a> 
                    on ${formatData(post.time)} with 
                    <a href="/item?id=${post.id}">${post.descendants || 0} comments</a>
                </div>
            </li>
        `;
    }).join('');

    return `<ul class="stories-list">${listItems}</ul>`;
  }

  async function requestListener(req: IncomingMessage, res: ServerResponse) {
    // 1. Rozbijamy adres URL na ścieżkę (pathname) oraz parametry po znaku zapytania (query, np. ?id=123)
    const parsedUrl = url.parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '/'
    // 2. OBSŁUGA PLIKU CSS: Jeśli przeglądarka prosi o style.css, czytamy go i odsyłamy
    if (pathname === '/styles.css') {
      
    }
  }





