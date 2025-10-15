import React, { useState, useEffect } from 'react';
import { 
  NewspaperIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { getCommunityNews, getTimeAgo } from '../../services/newsService';
import { useLanguage } from '../../contexts/LanguageContext';

const NewsCard = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('NewsCard: Fetching community news...');
      const articles = await getCommunityNews();
      console.log('NewsCard: News received:', articles);
      setNews(articles);
    } catch (err) {
      console.error('NewsCard: News fetch error:', err);
      setError('Unable to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('NewsCard: Component mounted, fetching news...');
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 mb-3 shadow-md border border-primary-200 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 bg-primary-200 rounded"></div>
          <div className="h-4 bg-primary-200 rounded w-32"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-primary-100 rounded w-full"></div>
          <div className="h-3 bg-primary-100 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !news || news.length === 0) {
    return null; // Don't show card if there's an error
  }

  const displayedNews = expanded ? news : news.slice(0, 1);

  return (
    <div className="bg-gradient-to-br from-white to-primary-50/30 rounded-xl p-4 mb-3 shadow-md border border-primary-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <NewspaperIcon className="h-5 w-5 text-primary-600" />
          <h3 className="text-sm font-semibold text-primary-900">{t('communityUpdates')}</h3>
        </div>
        <button
          onClick={fetchNews}
          className="p-1 rounded-full hover:bg-primary-100 transition-colors text-primary-600"
          aria-label={t('refresh')}
          title={t('refresh')}
        >
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      {/* News Articles */}
      <div className="space-y-3">
        {displayedNews.map((article, index) => (
          <a
            key={index}
            href={article.url !== '#' ? article.url : undefined}
            target={article.url !== '#' ? '_blank' : undefined}
            rel={article.url !== '#' ? 'noopener noreferrer' : undefined}
            className={`block p-3 rounded-lg bg-white border border-primary-100 hover:border-primary-300 transition-all group ${article.url !== '#' ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={(e) => article.url === '#' && e.preventDefault()}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-primary-900 leading-snug mb-1 group-hover:text-primary-700 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                {article.description && (
                  <p className="text-xs text-primary-600 leading-relaxed line-clamp-2 mb-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-primary-500">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <span>{getTimeAgo(article.publishedAt)}</span>
                  </div>
                  {article.url !== '#' && (
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 text-primary-400 group-hover:text-primary-600 transition-colors" />
                  )}
                </div>
              </div>
            </div>
            {article.isMock && (
              <div className="mt-2 pt-2 border-t border-primary-100">
                <p className="text-xs text-primary-400 italic">Demo content - Add API key for live news</p>
              </div>
            )}
          </a>
        ))}
      </div>

      {/* Expand/Collapse button */}
      {news.length > 1 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1 hover:bg-primary-50 rounded-lg transition-all"
        >
          {expanded ? (
            <>
              <span>{t('showLess')}</span>
              <ChevronRightIcon className="h-3 w-3 rotate-90" />
            </>
          ) : (
            <>
              <span>{t('showMore')} {news.length - 1} {news.length - 1 > 1 ? 'updates' : 'update'}</span>
              <ChevronRightIcon className="h-3 w-3 -rotate-90" />
            </>
          )}
        </button>
      )}

      {/* Footer info */}
      <div className="mt-3 pt-3 border-t border-primary-100">
        <p className="text-xs text-primary-500 text-center">
          🏳️‍🌈 {t('lgbtqNews')}
        </p>
      </div>
    </div>
  );
};

export default NewsCard;
