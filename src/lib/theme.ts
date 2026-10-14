export const themeStorageKey = "aurevia-theme";
// Runs in the head before paint; storage may be blocked by browser privacy settings.
export const themeInitScript = `(()=>{let t='system';try{const s=localStorage.getItem('${themeStorageKey}');if(['light','dark','system'].includes(s))t=s}catch{}const d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t==='system'?'light dark':t})()`;
