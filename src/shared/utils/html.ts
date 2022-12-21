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

export const sanitizeHtml = (html: string) => sanitize(html, SANITIZE_OPTIONS);

export const countHtmlCharacters = (html: string) => {
	let count = 0;

	sanitize(html, {
		...SANITIZE_OPTIONS,
		textFilter: text => {
			count += text.length;

			return text;
		},
	});

	return count;
};
