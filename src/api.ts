const TOP_POSTS_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const NEW_POSTS_URL = "https://hacker-news.firebaseio.com/v0/newstories.json";
const USER_URL_BASE = "https://hacker-news.firebaseio.com/v0/user/";
const STORY_URL_BASE = "https://hacker-news.firebaseio.com/v0/item/";

function getStoryUrl(story: number): string {
    return `${STORY_URL_BASE}${story}.json`;
}
function getUserUrl(user: string): string {
    return `${USER_URL_BASE}${user}.json`;
}

export interface Story {
    id: number;
    deleted?: boolean;
    type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
    by?: string;
    time: number;
    text?: string;
    dead?: boolean;
    parent?: number;
    poll?: number;
    kids?: number[];
    url?: string;
    score?: number;
    title?: string;
    parts?: number[];
    descendants?: number;
}

export interface User {
    id: string;
    created: number;
    karma: number;
    about?: string;
    submitted?: number[];
}