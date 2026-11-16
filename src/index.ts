//sam serwer HTTP, odczyt szablonów HTML i przekazywanie gotowego widoku do przeglądarki
import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fetchMainPosts, fetchItem, fetchUser, fetchComments } from './api';
import { HNItem, HNUser } from './types';

// Pomocnicza funkcja zamieniająca Unix Timestamp na czytelną datę
function formatDate(timeInSeconds: number): string {
    const date = new Date(timeInSeconds * 1000);
    return date.toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });
}

// 1. GENEROWANIE HTML DLA LISTY ARTYKUŁÓW (Widoki Top i New)
function renderStoriesList(posts: HNItem[]): string {
    const listItems = posts.map(post => {
        // Wyciągamy domenę z adresu URL (np. "getdropbox.com" z "http://www.getdropbox.com/u/2/...")
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
                    on ${formatDate(post.time)} with 
                    <a href="/item?id=${post.id}">${post.descendants || 0} comments</a>
                </div>
            </li>
        `;
    }).join('');

    return `<ul class="stories-list">${listItems}</ul>`;
}

// Główna funkcja obsługująca ruch sieciowy
async function requestListener(req: IncomingMessage, res: ServerResponse) {
    const parsedUrl = url.parse(req.url || '', true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Obsługa pliku CSS
    if (pathname === '/style.css') {
        try {
            const cssPath = path.join(__dirname, 'static', 'style.css');
            const cssContent = await fs.promises.readFile(cssPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(cssContent);
            return;
        } catch {
            res.writeHead(404);
            res.end('CSS not found');
            return;
        }
    }

    try {
        // Wczytujemy nasz bazowy szablon HTML
        const templatePath = path.join(__dirname, 'static', 'index.html');
        let template = await fs.promises.readFile(templatePath, 'utf-8');
        let content = '';

        // ROUTING: Sprawdzamy, na jaką ścieżkę wszedł użytkownik
        if (pathname === '/' || pathname === '/top') {
            const posts = await fetchMainPosts('top');
            content = renderStoriesList(posts);
        } 
        else if (pathname === '/new') {
            const posts = await fetchMainPosts('new');
            content = renderStoriesList(posts);
        }
        else {
            content = `<h1>404 - Page Not Found</h1><p>The requested page does not exist.</p>`;
        }

        // Wstrzykiwaniu wygenerowanego HTML-a w miejsce {{content}} w szablonie
        const finalHtml = template.replace('{{content}}', content);

        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': Buffer.byteLength(finalHtml, 'utf-8')
        });
        res.end(finalHtml);

    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 Internal Server Error</h1>');
    }
}

// Uruchomienie serwera
http.createServer(requestListener).listen(3000, () => {
    console.log('🚀 Hacker News Server running at http://localhost:3000/');
});