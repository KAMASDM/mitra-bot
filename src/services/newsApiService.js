// News API Service for LGBTQAI+ and Women Empowerment News

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '0ed3aabdbc5d49aaad700d0c4c01a4e7';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

/**
 * Fetch news articles related to LGBTQAI+ community and women empowerment in India
 */
export const fetchCommunityNews = async () => {
  try {
    // Prioritize women-related news for broader coverage
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?q=(women OR "women empowerment" OR "gender equality" OR "women safety" OR "women rights" OR "female education") AND India&language=en&sortBy=publishedAt&pageSize=50&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('News API response:', data); // Debug log

    if (data.status === 'ok') {
      // Filter and format articles - very lenient filtering
      const articles = data.articles
        .filter(article => {
          // Only exclude if completely invalid
          if (!article.title || article.title === '[Removed]' || !article.url) {
            return false;
          }
          return true;
        })
        .map(article => ({
          id: article.url,
          title: article.title,
          description: article.description || article.title,
          image: article.urlToImage || null,
          url: article.url,
          source: article.source.name,
          publishedAt: new Date(article.publishedAt),
          author: article.author
        }))
        .slice(0, 25); // Show more articles

      console.log('Filtered articles:', articles.length); // Debug log
      return articles;
    } else {
      console.error('News API error:', data);
      throw new Error(data.message || 'Failed to fetch news');
    }
  } catch (error) {
    console.error('Error fetching community news:', error);
    throw error;
  }
};

/**
 * Fetch top headlines related to LGBTQAI+ and women empowerment in India
 */
export const fetchTopHeadlines = async () => {
  try {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?country=in&q=LGBT OR women empowerment OR women rights&language=en&pageSize=15&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'ok') {
      const articles = data.articles
        .filter(article => {
          if (!article.title || !article.description || article.title === '[Removed]') {
            return false;
          }
          
          const content = (article.title + ' ' + article.description).toLowerCase();
          return content.includes('lgbt') || 
                 content.includes('lgbtq') ||
                 content.includes('transgender') ||
                 content.includes('women') ||
                 content.includes('gender');
        })
        .map(article => ({
          id: article.url,
          title: article.title,
          description: article.description,
          image: article.urlToImage,
          url: article.url,
          source: article.source.name,
          publishedAt: new Date(article.publishedAt),
          author: article.author
        }));

      return articles;
    } else {
      throw new Error(data.message || 'Failed to fetch headlines');
    }
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    throw error;
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export default {
  fetchCommunityNews,
  fetchTopHeadlines,
  getRelativeTime
};
