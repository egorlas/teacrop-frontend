import type { Product } from "@/types/product";

/**
 * Normalize string: lowercase + remove diacritics + trim + collapse spaces
 */
export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim()
    .replace(/\s+/g, " "); // Collapse multiple spaces
}

/**
 * Build index from products: Map<normalizedKey, Product>
 * Keys include: normalized name + all normalized aliases
 */
export function buildIndex(products: Product[]): Map<string, Product> {
  const index = new Map<string, Product>();

  for (const product of products) {
    // Add normalized product name
    const normalizedName = normalize(product.name);
    index.set(normalizedName, product);

    // Add normalized aliases
    if (product.aliases && product.aliases.length > 0) {
      for (const alias of product.aliases) {
        const normalizedAlias = normalize(alias);
        // Only add if not already in index (prefer name over alias if duplicate)
        if (!index.has(normalizedAlias)) {
          index.set(normalizedAlias, product);
        }
      }
    }
  }

  return index;
}

/**
 * Extract tokens (1-3 words) from text for matching
 */
function extractTokens(text: string, minLength = 2, maxLength = 3): string[] {
  const normalized = normalize(text);
  const words = normalized.split(/\s+/);
  const tokens: string[] = [];

  // Generate 1-word, 2-word, and 3-word tokens
  for (let i = 0; i < words.length; i++) {
    // 1-word token
    if (words[i].length >= minLength) {
      tokens.push(words[i]);
    }

    // 2-word token
    if (i + 1 < words.length) {
      tokens.push(`${words[i]} ${words[i + 1]}`);
    }

    // 3-word token
    if (i + 2 < words.length) {
      tokens.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }

  return tokens;
}

/**
 * Match products in text using index
 * Returns unique products (by id) that were found in text
 */
export function matchProductsInText(
  text: string,
  index: Map<string, Product>,
): Product[] {
  if (!text || !text.trim()) {
    return [];
  }

  const normalizedText = normalize(text);
  const tokens = extractTokens(text);
  const matchedProducts = new Map<string, Product>();

  // Check each token against index
  for (const token of tokens) {
    if (index.has(token)) {
      const product = index.get(token)!;
      // Use id as key to avoid duplicates
      if (!matchedProducts.has(product.id)) {
        matchedProducts.set(product.id, product);
      }
    }
  }

  // Also check if any index key is included in the full normalized text
  // This catches partial matches (e.g., "tra sen tay ho" in longer text)
  for (const [key, product] of index.entries()) {
    if (normalizedText.includes(key) && !matchedProducts.has(product.id)) {
      matchedProducts.set(product.id, product);
    }
  }

  return Array.from(matchedProducts.values());
}

