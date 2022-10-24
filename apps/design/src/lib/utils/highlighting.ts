import { loadTheme, getHighlighter } from 'shiki';

const THEME_SRC = '../../../../../apps/design/public/vitesse-dark-soft.json';
const theme = await loadTheme(THEME_SRC);
const highlighter = await getHighlighter({ theme });

export const highlightCode = (src: string) => highlighter.codeToHtml(src, { lang: 'tsx' });
