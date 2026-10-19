import sanitizeHtml from 'sanitize-html'

export default function sanitizeComment(value?: string): string {
    return sanitizeHtml(value || '', {
        allowedTags: [
            'p',
            'br',
            'div',
            'span',
            'a',
            'b',
            'strong',
            'i',
            'em',
            'u',
            's',
            'ul',
            'ol',
            'li',
        ],
        allowedAttributes: {
            a: ['href', 'title'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        allowProtocolRelative: false,
    })
}