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
	allowedTags: ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'code', 'mark', 'pre', 'blockquote', 'strong', 'em', 's', 'u'],
};

const BLOCK_TAGS = ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'pre', 'blockquote'];

export const transformHtml = (html: string) => {
	// TODO: This is kinda nasty, try to make it better later
	const textContent = sanitize(
		sanitize(html, {
			allowedTags: BLOCK_TAGS,
		}),
		{
			allowedTags: [],
			textFilter: text => ` ${text}`,
		},
	).slice(1);
	const charactersCount = textContent.replaceAll(' ', '').length;
	const htmlContent = sanitize(html, {
		...SANITIZE_OPTIONS,
	});

	return { charactersCount, htmlContent, textContent };
};
