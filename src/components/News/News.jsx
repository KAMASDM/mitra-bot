import React, { useState, useEffect } from 'react';
import { NewspaperIcon, ArrowTopRightOnSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { fetchCommunityNews, getRelativeTime } from '../../services/newsApiService';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';

const News = () => {
  const { t } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsArticles = await fetchCommunityNews();
      console.log('Loaded news articles:', newsArticles);
      setArticles(newsArticles);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error(`Failed to load news: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 top-16 bottom-20 lg:static flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50 lg:bg-transparent lg:h-full">
      {/* Fixed Header - Hidden on desktop (shown in Layout) */}
      <div className="flex-shrink-0 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white p-4 shadow-lg lg:hidden">
        <div className="flex items-center gap-3">
          <NewspaperIcon className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">{t('newsUpdates')}</h1>
            <p className="text-xs text-primary-100">{t('womenEmpowerment')}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-0">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loadingNews')}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NewspaperIcon className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('noNewsAvailable')}</h2>
            <p className="text-gray-600 text-sm mb-4">
              {t('unableToLoadNews')}
            </p>
            <button
              onClick={loadNews}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-md transition-all"
            >
              {t('tryAgain')}
            </button>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
            {currentArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article.url)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                {article.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {article.source}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getRelativeTime(article.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {article.author && (
                      <span className="text-xs text-gray-500">
                        By {article.author}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-primary-600 text-sm font-medium">
                      <span>Read more</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageClick(pageNum)}
                          className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center text-sm text-gray-500 pb-4">
                {t('showing')} {indexOfFirstArticle + 1}-{Math.min(indexOfLastArticle, articles.length)} {t('of')} {articles.length} {t('articles')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
