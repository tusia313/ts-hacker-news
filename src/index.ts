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
  
  const parsedUrl = url.parse(req.url || '');
  // Przygotowujemy zmienne na zawartość pliku oraz domyślny kod sukcesu HTTP (200 OK).
  let data = '';
  let statusCode = 200;

  // 4. ROUTING I ODCZYT PLIKÓW Z DYSKU (BLOK TRY / CATCH)
  try {
    let pathName = parsedUrl.pathname || '/';

    // Jeśli użytkownik wchodzi na stronę główną ('/'), wskazujemy plik '/index.html'.
    if (pathName === '/') {
      pathName = '/index.html';
    } 
    // Jeśli w ścieżce nie ma kropki (czyli to np. '/about', a nie '/style.css'), 
    // automatycznie doklejamy końcówkę '.html' (tzw. Clean URLs).
    else if (!pathName.includes('.')) {
      pathName = `${pathName}.html`;
    }

    // Sklejamy pełną ścieżkę do pliku w folderze 'src/static/' i wczytujemy go jako tekst UTF-8.
    const filePath = path.join(__dirname, 'static', pathName);
    data = await fs.promises.readFile(filePath, 'utf-8');
  } catch {
    // KOŁO RATUNKOWE (BŁĄD 404): Jeśli szukany plik nie istnieje na dysku, 
    // przechwytujemy błąd, wczytujemy stronę 404.html i ustawiamy kod statusu na 404.
    data = await fs.promises.readFile(path.join(__dirname, 'static', '404.html'), 'utf-8');
    statusCode = 404;
  }

  // 5. INTEGRACJA Z ZEWNĘTRZNYM API (TYLKO DLA ŚCIEŻKI /dad-joke)
  if (parsedUrl.pathname === '/dad-joke') {
    // Wysyłamy zapytanie do API z nagłówkami wymuszającymi format JSON zamiast HTML.
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        'Accept': 'application/json',
        'user-agent': 'Node.js Server'
      }
    });

    // Odczytujemy odpowiedź i przypisujemy jej nasz interfejs 'Joke'.
    const joke: Joke = await response.json();

    // Podmieniamy znacznik {{joke}} w kodzie HTML na prawdziwy żart pobrany z serwera.
    data = data.replace(/{{joke}}/gm, joke.joke);
  }

  // 6. ROZPOZNANIE TYPU PLIKU (MIME TYPE)
  // Domyślnie wysyłamy dokument HTML, ale jeśli przeglądarka prosiła o plik '.css',
  // zmieniamy nagłówek na 'text/css', aby przeglądarka poprawnie zaaplikowała style.
  let contentType = 'text/html';
  if (parsedUrl.pathname?.endsWith('.css')) {
    contentType = 'text/css';
  }

  // 7. WYSŁANIE ODPOWIEDZI DO PRZEGLĄDARKI
  // Ustawiamy kod statusu (200 lub 404), typ zawartości oraz dokładny rozmiar danych w bajtach.
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(data, 'utf-8')
  });

  // Przesyłamy gotową treść i zamykamy połączenie.
  res.write(data);
  res.end();
}

// 8. URUCHOMIENIE SERWERA NA PORCIE 3000
http.createServer(requestListener).listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});