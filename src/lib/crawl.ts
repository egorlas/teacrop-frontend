import * as cheerio from "cheerio";
import { URL } from "url";

/**
 * Resolves a relative or absolute URL against a base URL.
 * Returns absolute URL or null if invalid.
 */
export function resolveUrl(href: string, base: string): string | null {
  try {
    // If already absolute, return as-is
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return href;
    }

    // Resolve against base URL
    const baseUrl = new URL(base);
    const resolvedUrl = new URL(href, baseUrl);
    return resolvedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Extracts text or attribute value from cheerio root using a selector.
 * Supports fallback selectors separated by `|`.
 * Returns first match or null.
 */
export function extract($: ReturnType<typeof cheerio.load>, selector: string | undefined): string | null {
  if (!selector) return null;

  // Support fallback selectors separated by `|`
  const selectors = selector.split("|").map((s) => s.trim());

  for (const sel of selectors) {
    if (!sel) continue;

    // Check if it's a meta tag selector
    if (sel.startsWith("meta[") && sel.includes("]")) {
      // Extract attribute name from meta selector (e.g., meta[property='og:image'])
      const attrMatch = sel.match(/meta\[([^\]]+)\]/);
      if (attrMatch) {
        const attrPart = attrMatch[1];
        // Parse attribute (e.g., property='og:image' or name="description")
        const nameMatch = attrPart.match(/(\w+)=['"]([^'"]+)['"]/);
        if (nameMatch) {
          const attrName = nameMatch[1];
          const attrValue = nameMatch[2];
          const meta = $(`meta[${attrName}='${attrValue}']`);
          if (meta.length > 0) {
            const content = meta.attr("content");
            if (content) return content.trim();
          }
        }
      }
    }

    // Try as regular selector
    const element = $(sel);
    if (element.length > 0) {
      // Check for img src
      if (element.is("img")) {
        const src = element.attr("src");
        if (src) return src.trim();
      }
      // Check for other attributes that might contain URLs (like og:image in meta)
      const href = element.attr("href");
      if (href) return href.trim();
      // Otherwise get text content
      const text = element.text();
      if (text) return text.trim();
    }
  }

  return null;
}

/**
 * Converts HTML to Markdown (basic implementation).
 * This is a simple fallback - for production, consider using a proper library.
 */
export function toMarkdown(html: string | null): string {
  if (!html) return "";

  // Load HTML into cheerio
  const $ = cheerio.load(html);

  // Basic conversion rules
  let markdown = "";

  $("body")
    .contents()
    .each((_, el) => {
      if (el.type === "text") {
        markdown += $(el).text().trim() + "\n\n";
      } else if (el.type === "tag") {
        const tagName = el.tagName.toLowerCase();
        const $el = $(el);

        switch (tagName) {
          case "h1":
            markdown += `# ${$el.text().trim()}\n\n`;
            break;
          case "h2":
            markdown += `## ${$el.text().trim()}\n\n`;
            break;
          case "h3":
            markdown += `### ${$el.text().trim()}\n\n`;
            break;
          case "h4":
            markdown += `#### ${$el.text().trim()}\n\n`;
            break;
          case "h5":
            markdown += `##### ${$el.text().trim()}\n\n`;
            break;
          case "h6":
            markdown += `###### ${$el.text().trim()}\n\n`;
            break;
          case "p":
            markdown += `${$el.text().trim()}\n\n`;
            break;
          case "a": {
            const href = $el.attr("href");
            const text = $el.text().trim();
            if (href) {
              markdown += `[${text}](${href})\n\n`;
            } else {
              markdown += `${text}\n\n`;
            }
            break;
          }
          case "img": {
            const src = $el.attr("src");
            const alt = $el.attr("alt") || "";
            if (src) {
              markdown += `![${alt}](${src})\n\n`;
            }
            break;
          }
          case "ul":
          case "ol":
            $el.find("li").each((_, li) => {
              markdown += `- ${$(li).text().trim()}\n`;
            });
            markdown += "\n";
            break;
          case "blockquote":
            markdown += `> ${$el.text().trim()}\n\n`;
            break;
          case "code":
            markdown += `\`${$el.text().trim()}\``;
            break;
          case "pre":
            markdown += `\`\`\`\n${$el.text().trim()}\n\`\`\`\n\n`;
            break;
          case "strong":
          case "b":
            markdown += `**${$el.text().trim()}**`;
            break;
          case "em":
          case "i":
            markdown += `*${$el.text().trim()}*`;
            break;
          default: {
            // For other elements, just get text content
            const text = $el.text().trim();
            if (text) {
              markdown += `${text}\n\n`;
            }
          }
        }
      }
    });

  // Clean up multiple newlines
  return markdown.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Validates if a URL is safe to crawl (not internal/private).
 */
export function isValidPublicUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Only allow http and https
    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    // Block localhost and private IP ranges
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("169.254.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname === "::1" ||
      hostname === "[::1]"
    ) {
      return false;
    }

    // Block private IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const parts = hostname.split(".").map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      // Check for 172.16-31.x.x
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

