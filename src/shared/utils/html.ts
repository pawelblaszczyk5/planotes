import sanitize from 'sanitize-html';

const SANITIZE_OPTIONS: sanitize.IOptions = {
	allowedAttributes: {
		'*': ['style'],
	},
	allowedStyles: {
		'*': {
			'text-align': [/^left$/u, /^right$/u, /^center$/u],
		},
	},
	allowedTags: ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'code', 'mark', 'pre', 'blockquote', 'strong', 'em', 's'],
};

const noop = (() => {
	throw new Error("This method shouldn't be called");
}) as never;

export const sanitizeHtml = (html: string) => (import.meta.env.SSR ? sanitize(html, SANITIZE_OPTIONS) : noop);

export const countHtmlCharacters = import.meta.env.SSR
	? (html: string) => {
			if (!import.meta.env.SSR) return 0;

			let count = 0;

			sanitize(html, {
				...SANITIZE_OPTIONS,
				textFilter: text => {
					count += text.length;

					return text;
				},
			});

			return count;
	  }
	: noop;
