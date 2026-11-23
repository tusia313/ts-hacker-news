// Typ wyliczeniowy dla wszystkich możliwych rodzajów elementów w Hacker News
export type ItemType = 'job' | 'story' | 'comment' | 'poll' | 'pollopt';

// Interfejs reprezentujący dowolny element (artykuł, komentarz, ofertę pracy, ankietę itp.)
export interface HNItem {
  id: number;           // Unikalne ID elementu
  deleted?: boolean;    // True, jeśli element został usunięty
  type: ItemType;       // Rodzaj elementu
  by?: string;          // Nazwa użytkownika (autora)
  time: number;         // Data utworzenia w formacie Unix Time
  text?: string;        // Treść (komentarza, story lub ankiety) w formacie HTML
  dead?: boolean;       // True, jeśli element jest martwy/ukryty
  parent?: number;      // ID rodzica (dla komentarzy - odpowiedź na komentarz lub artykuł)
  poll?: number;        // ID ankiety powiązanej z opcją (dla pollopt)
  kids?: number[];      // Tablica ID komentarzy w kolejności wyświetlania
  url?: string;         // Adres URL artykułu (dla 'story')
  score?: number;       // Liczba punktów artykułu lub głosów w ankiecie
  title?: string;       // Tytuł (artykułu, ankiety lub oferty pracy) w formacie HTML
  parts?: number[];     // Lista powiązanych opcji ankiety (dla 'poll')
  descendants?: number; // Łączna liczba komentarzy (dla 'story' lub 'poll')
}

// Interfejs reprezentujący profil użytkownika Hacker News
export interface HNUser {
  id: string;           // Unikalna nazwa użytkownika (uwzględnia wielkość liter)
  created: number;      // Data założenia konta w formacie Unix Time
  karma: number;        // Liczba punktów karmy użytkownika
  about?: string;       // Opcjonalny opis profilu w formacie HTML
  submitted?: number[]; // Lista ID wszystkich nadesłanych historii, ankiet i komentarzy
}

// Wszystko ma słówko export, ponieważ pliki takie jak api.ts czy index.ts będą mogły te typy bez problemu zaimportować (np. import { HNItem } from './types')
//