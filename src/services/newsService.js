// News service using NewsAPI.org (free tier) and GNews API
// Free alternatives that don't require API key for basic usage

const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || '';
const GNEWS_BASE = 'https://gnews.io/api/v4';

// NewsData.io - has a free tier
const NEWSDATA_API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY || '';
const NEWSDATA_BASE = 'https://newsdata.io/api/1';

/**
 * Get LGBTQAI+ and women's rights news using multiple sources
 */
export const getCommunityNews = async () => {
  try {
    // Try NewsData.io first (generous free tier - 200 requests/day)
    if (NEWSDATA_API_KEY) {
      const newsDataResult = await fetchFromNewsData();
      if (newsDataResult && newsDataResult.length > 0) {
        return newsDataResult;
      }
    }

    // Try GNews if available
    if (GNEWS_API_KEY) {
      const gNewsResult = await fetchFromGNews();
      if (gNewsResult && gNewsResult.length > 0) {
        return gNewsResult;
      }
    }

    // Fallback to mock news if no API keys available
    return getMockNews();
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockNews();
  }
};

/**
 * Fetch from NewsData.io
 */
const fetchFromNewsData = async () => {
  try {
    const keywords = 'LGBTQ OR LGBT OR "women rights" OR "gender equality" OR "pride" OR "transgender" OR "women empowerment"';
    const url = `${NEWSDATA_BASE}/news?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(keywords)}&language=en&category=politics,world`;
    
    console.log('Fetching news from NewsData.io...');
    const response = await fetch(url);
    if (!response.ok) throw new Error('NewsData fetch failed');
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results.slice(0, 3).map(article => ({
        title: article.title,
        description: article.description || article.content?.substring(0, 150),
        url: article.link,
        source: article.source_id,
        publishedAt: article.pubDate,
        image: article.image_url
      }));
    }
    
    return [];
  } catch (error) {
    console.error('NewsData.io error:', error);
    return [];
  }
};

/**
 * Fetch from GNews
 */
const fetchFromGNews = async () => {
  try {
    const keywords = 'LGBTQ OR LGBT OR women rights OR gender equality';
    const url = `${GNEWS_BASE}/search?q=${encodeURIComponent(keywords)}&lang=en&max=3&apikey=${GNEWS_API_KEY}`;
    
    console.log('Fetching news from GNews...');
    const response = await fetch(url);
    if (!response.ok) throw new Error('GNews fetch failed');
    
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      return data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        image: article.image
      }));
    }
    
    return [];
  } catch (error) {
    console.error('GNews error:', error);
    return [];
  }
};

/**
 * Mock news data for when APIs are unavailable
 */
const getMockNews = () => {
  const mockArticles = [
    {
      title: 'Supreme Court Expands LGBTQAI+ Rights Protection',
      description: 'Landmark ruling ensures equal rights and protection from discrimination in employment and housing for LGBTQAI+ community members.',
      url: '#',
      source: 'Community News',
      publishedAt: new Date().toISOString(),
      image: null,
      isMock: true
    },
    {
      title: 'Women Entrepreneurs Break Records in Tech Industry',
      description: 'Female-led startups raise record funding, showcasing increasing support for women in technology and business leadership.',
      url: '#',
      source: 'Business Today',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      image: null,
      isMock: true
    },
    {
      title: 'New Healthcare Initiative for LGBTQAI+ Communities',
      description: 'Government launches inclusive healthcare program providing accessible and discrimination-free medical services.',
      url: '#',
      source: 'Health News',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      image: null,
      isMock: true
    }
  ];

  return mockArticles;
};

/**
 * Format time ago
 */
export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
