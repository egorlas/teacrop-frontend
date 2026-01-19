export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: BlogBlock[];
  coverImage?: string;
  gallery?: string[];
  category?: BlogCategory;
  tag?: BlogTag;
  author?: BlogAuthor;
  readingTime?: number;
  featured?: boolean;
  pinned?: boolean;
  views?: number;
  likes?: number;
  seo?: BlogSEO;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type BlogTag = {
  id: string;
  name: string;
  slug: string;
};

export type BlogAuthor = {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
};

export type BlogSEO = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
  ogImage?: string;
};

// Strapi blocks structure from API
export type BlogBlock = 
  | { 
      __component: 'blocks.paragraph'; 
      text?: Array<{ 
        type?: string;
        children?: Array<{ 
          type?: string;
          text?: string;
        }>;
      }>;
      body?: string; // Fallback for simple format
    }
  | { 
      __component: 'blocks.image'; 
      image?: { url?: string; alt?: string; data?: any }; 
      caption?: string 
    }
  | { 
      __component: 'blocks.quote'; 
      quote?: string;
      text?: Array<{ 
        type?: string;
        children?: Array<{ 
          type?: string;
          text?: string;
        }>;
      }>;
      author?: string 
    }
  | { 
      __component: 'blocks.gallery'; 
      images?: Array<{ url?: string; alt?: string; data?: any }> 
    }
  | { 
      __component: 'blocks.embed'; 
      url?: string; 
      caption?: string 
    }
  | { 
      __component: 'blocks.cta'; 
      title?: string; 
      link?: string; 
      description?: string 
    };

export type BlogListResponse = {
  data: BlogPost[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

