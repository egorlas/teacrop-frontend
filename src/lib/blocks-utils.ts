/**
 * Extract text from Strapi blocks structure
 * Handles both nested (text[0].children[0].text) and flat (body/quote) formats
 */
export function extractBlockText(block: any): string {
  // If has body (simple format)
  if (block.body) {
    return block.body;
  }

  // If has quote (simple format)
  if (block.quote) {
    return block.quote;
  }

  // If has text array (Strapi blocks format)
  if (block.text && Array.isArray(block.text) && block.text.length > 0) {
    const firstText = block.text[0];
    
    // If children array exists
    if (firstText.children && Array.isArray(firstText.children)) {
      return firstText.children
        .map((child: any) => child.text || '')
        .join('')
        .trim();
    }
    
    // If direct text property
    if (firstText.text) {
      return firstText.text;
    }
  }

  return '';
}

/**
 * Extract all text nodes from Strapi blocks structure
 * Handles multiple paragraphs/text blocks
 */
export function extractAllBlockText(block: any): string {
  if (block.body) {
    return block.body;
  }

  if (block.quote) {
    return block.quote;
  }

  if (block.text && Array.isArray(block.text)) {
    return block.text
      .map((textNode: any) => {
        if (textNode.children && Array.isArray(textNode.children)) {
          return textNode.children
            .map((child: any) => child.text || '')
            .join('');
        }
        return textNode.text || '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

