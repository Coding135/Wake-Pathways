/** Must match `storageKey` on `ThemeProvider` (next-themes). */
export const THEME_STORAGE_KEY = 'wake-pathways-theme';

/** Before hydration: default light; only `dark` applies class; migrate legacy `system` to light. */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var d=document.documentElement;if(t==='system'){localStorage.setItem(k,'light');}if(t==='dark')d.classList.add('dark');else d.classList.remove('dark');}catch(e){}})();`;
