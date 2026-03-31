/** Must match `storageKey` on `ThemeProvider` (next-themes). */
export const THEME_STORAGE_KEY = 'wake-pathways-theme';

/** Inline, before-hydration, to avoid a flash of wrong theme on first paint. */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var d=document.documentElement;if(t==='dark')d.classList.add('dark');else if(t==='light')d.classList.remove('dark');else{if(window.matchMedia('(prefers-color-scheme: dark)').matches)d.classList.add('dark');else d.classList.remove('dark');}}catch(e){}})();`;
