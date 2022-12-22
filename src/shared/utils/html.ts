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

export const transformHtml = (html: string) => {
	let charactersCount = 0;
	let textContent = '';

	const htmlContent = sanitize(html, {
		...SANITIZE_OPTIONS,
		textFilter: text => {
			charactersCount += text.length;
			textContent += text;

			return text;
		},
	});

	return { charactersCount, htmlContent, textContent };
};
