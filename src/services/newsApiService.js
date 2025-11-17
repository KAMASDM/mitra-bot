// News API Service for LGBTQAI+ and Women Empowerment News

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '0ed3aabdbc5d49aaad700d0c4c01a4e7';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

/**
 * Fetch news articles related to LGBTQAI+ community and women empowerment in India
 */
export const fetchCommunityNews = async () => {
  try {
    // Check if we're in production and News API might not work (free tier limitation)
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    // In production with free News API, use fallback data immediately
    if (isProduction) {
      console.log('Using fallback news data (News API free tier limitation)');
      return getFallbackNews();
    }

    // Try to fetch from News API in development
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?q=(women OR "women empowerment" OR "gender equality" OR "women safety" OR "women rights" OR "female education") AND India&language=en&sortBy=publishedAt&pageSize=50&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      console.warn(`News API error: ${response.status}, using fallback data`);
      return getFallbackNews();
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
      return articles.length > 0 ? articles : getFallbackNews();
    } else {
      console.error('News API error:', data);
      return getFallbackNews();
    }
  } catch (error) {
    console.error('Error fetching community news:', error);
    return getFallbackNews();
  }
};

/**
 * Get fallback news articles when News API is unavailable
 */
const getFallbackNews = () => {
  return [
    {
      id: '1',
      title: 'Mental Health Support: Breaking the Stigma in Indian Communities',
      description: 'Mental health professionals discuss the importance of accessible mental health services for LGBTQAI+ individuals and women in India. New initiatives are making therapy more affordable and culturally sensitive.',
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80',
      url: '#',
      source: 'Community Health News',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      author: 'Health Desk'
    },
    {
      id: '2',
      title: 'LGBTQAI+ Rights: Progress in Workplace Inclusion',
      description: 'Major companies in India are implementing inclusive policies and creating safe spaces for LGBTQAI+ employees. Experts share insights on building truly inclusive workplaces.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      url: '#',
      source: 'Rights & Inclusion',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      author: 'Workplace Team'
    },
    {
      id: '3',
      title: "Women's Healthcare: New Initiatives for Reproductive Rights",
      description: 'Healthcare organizations launch programs focused on women\'s reproductive health, providing free consultations and education on reproductive rights and healthcare access.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      url: '#',
      source: 'Healthcare Today',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      author: 'Medical Team'
    },
    {
      id: '4',
      title: 'Employment Opportunities: Skills Training for Women and LGBTQAI+ Individuals',
      description: 'New vocational training programs are helping marginalized communities access better employment opportunities. Organizations provide free training in tech, healthcare, and entrepreneurship.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
      url: '#',
      source: 'Career Development',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      author: 'Skills Team'
    },
    {
      id: '5',
      title: 'Gender Equality: Educational Programs Empowering Young Women',
      description: 'Educational institutions across India are launching programs aimed at empowering young women through STEM education and leadership training.',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80',
      url: '#',
      source: 'Education News',
      publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
      author: 'Education Desk'
    },
    {
      id: '6',
      title: 'Transgender Healthcare: Improving Access to Gender-Affirming Care',
      description: 'Healthcare providers are working to improve access to gender-affirming healthcare services, with new clinics opening in major cities across India.',
      image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80',
      url: '#',
      source: 'Health & Wellness',
      publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
      author: 'Healthcare Team'
    },
    {
      id: '7',
      title: 'Community Support: Safe Spaces for LGBTQAI+ Youth',
      description: 'Community centers are creating safe spaces where LGBTQAI+ youth can connect, access resources, and receive support from peers and mentors.',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
      url: '#',
      source: 'Community News',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      author: 'Community Team'
    },
    {
      id: '8',
      title: "Women's Safety: New Initiatives for Safer Public Spaces",
      description: 'Local governments and NGOs collaborate to improve safety measures in public spaces, including better lighting, emergency response systems, and awareness campaigns.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
      url: '#',
      source: 'Safety & Security',
      publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000), // 1 day ago
      author: 'Safety Desk'
    }
  ];
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
