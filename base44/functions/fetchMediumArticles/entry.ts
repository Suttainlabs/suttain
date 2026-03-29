import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Medium RSS feed URL for Suttain Labs
    const mediumUsername = "suttainlabs";
    const rssUrl = `https://medium.com/feed/@${mediumUsername}`;
    
    // Fetch the RSS feed
    const response = await fetch(rssUrl);
    
    if (!response.ok) {
      // Return empty articles if feed not found (account may not exist yet)
      return Response.json({ 
        articles: [],
        source: "medium",
        username: mediumUsername,
        message: "No articles found or Medium account not set up yet"
      });
    }
    
    const xmlText = await response.text();
    
    // Parse RSS XML to extract articles
    const articles = parseRSSFeed(xmlText);
    
    return Response.json({ 
      articles,
      source: "medium",
      username: mediumUsername,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error fetching Medium articles:", error);
    return Response.json({ 
      articles: [],
      error: error.message 
    });
  }
});

function parseRSSFeed(xmlText) {
  const articles = [];
  
  // Extract items from RSS feed using regex (since we can't use DOM parser in Deno)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const pubDate = extractTag(itemContent, 'pubDate');
    const description = extractTag(itemContent, 'description');
    const categories = extractAllTags(itemContent, 'category');
    const contentEncoded = extractTag(itemContent, 'content:encoded') || description;
    
    // Extract first image from content
    const imageMatch = contentEncoded.match(/<img[^>]+src="([^"]+)"/);
    const image = imageMatch ? imageMatch[1] : null;
    
    // Clean description (remove HTML tags)
    const cleanDescription = description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
      .substring(0, 200) + '...';
    
    // Estimate read time (average 200 words per minute)
    const wordCount = contentEncoded.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    articles.push({
      id: link,
      title: decodeHTMLEntities(title),
      excerpt: cleanDescription,
      link,
      pubDate,
      date: formatDate(pubDate),
      category: categories[0] || 'General',
      categories,
      image,
      readTime: `${readTime} min read`
    });
  }
  
  return articles.slice(0, 12); // Return max 12 articles
}

function extractTag(content, tagName) {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i');
  const cdataMatch = content.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1];
  
  // Regular tag extraction
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractAllTags(content, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const matches = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    let value = match[1].trim();
    // Strip CDATA wrappers
    const cdataMatch = value.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
    if (cdataMatch) value = cdataMatch[1].trim();
    matches.push(value);
  }
  return matches;
}

function decodeHTMLEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}