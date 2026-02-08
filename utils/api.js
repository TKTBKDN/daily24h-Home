/**
 * API UTILITY
 * Gọi API lấy dữ liệu bài viết với fallback sang backup JSON CDN
 * CÓ CACHING để tối ưu performance cho production
 */

const fetch = require('node-fetch');
const NodeCache = require('node-cache');

// ============================================
// CACHE CONFIGURATION
// ============================================
// Cache cho danh sách tin: 5 phút (300 giây)
const newsListCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
// Cache cho chi tiết bài viết: 10 phút (600 giây)
const articleCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// ============================================
// CẤU HÌNH API ENDPOINTS
// ============================================
const API_CONFIG = {
    // API chính
    NEWS_LIST: 'https://apisport.vbonews.com/News/news-list',
    NEWS_DETAIL: 'https://apisport.vbonews.com/News/news-detailvip',

    // Backup JSON CDN (khi API lỗi)
    BACKUP_URL: 'https://file.lifenews247.com/sportnews/backup',

    // Timeout cho mỗi request (ms)
    TIMEOUT: 5000,

    // Cache TTL (seconds)
    CACHE_TTL_LIST: 300,  // 5 phút cho danh sách
    CACHE_TTL_ARTICLE: 600 // 10 phút cho bài viết
};

/**
 * Xóa suffix _300x300 khỏi link ảnh
 * Ví dụ: xxx_300x300.webp -> xxx.webp
 * @param {string} url - URL ảnh
 * @returns {string} - URL đã clean
 */
function cleanImageUrl(url) {
    if (!url) return url;
    // Xóa _300x300, _600x600, hoặc bất kỳ _NUMBERxNUMBER nào
    return url.replace(/_\d+x\d+(\.\w+)$/, '$1');
}

/**
 * Clean tất cả link ảnh trong một bài viết
 * @param {object} article - Bài viết
 * @returns {object} - Bài viết đã clean
 */
function cleanArticleImages(article) {
    if (!article) return article;
    return {
        ...article,
        avatarLink: cleanImageUrl(article.avatarLink),
        urlRootLink: cleanImageUrl(article.urlRootLink)
    };
}

/**
 * Fetch với timeout
 * @param {string} url - URL cần fetch
 * @param {number} timeout - Timeout (ms)
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeout = API_CONFIG.TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'SportNews/1.0'
            }
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Lấy danh sách bài viết theo nhóm (CÓ CACHE)
 * @returns {Promise<object>} - { code: 200, data: [...] }
 */
async function fetchNewsList() {
    // Kiểm tra cache trước
    const cacheKey = 'news_list';
    const cachedData = newsListCache.get(cacheKey);
    if (cachedData) {
        console.log('📦 Trả về danh sách tin từ CACHE');
        return cachedData;
    }

    try {
        console.log('🌐 Gọi API lấy danh sách tin...');
        const response = await fetchWithTimeout(API_CONFIG.NEWS_LIST);

        if (!response.ok) {
            throw new Error(`API trả về status ${response.status}`);
        }

        const data = await response.json();

        // Clean link ảnh cho tất cả bài viết trong tất cả nhóm
        if (data.data && Array.isArray(data.data)) {
            data.data = data.data.map(group => {
                if (group.detail && Array.isArray(group.detail)) {
                    group.detail = group.detail.map(cleanArticleImages);
                }
                return group;
            });
        }

        // Lưu vào cache
        newsListCache.set(cacheKey, data);
        console.log('✅ Đã cache danh sách tin (TTL: 5 phút)');

        return data;

    } catch (error) {
        console.error('Lỗi fetchNewsList:', error.message);
        return { code: 500, data: [], error: error.message };
    }
}

/**
 * Lấy chi tiết bài viết (CÓ CACHE)
 * Thử cache trước, rồi API chính, cuối cùng fallback sang backup JSON
 * @param {string} articleId - ID bài viết (12 ký tự)
 * @returns {Promise<object|null>} - { articles: [...], hasSecondArticle: boolean }
 */
async function fetchArticle(articleId) {
    // Kiểm tra cache trước
    const cacheKey = `article_${articleId}`;
    const cachedData = articleCache.get(cacheKey);
    if (cachedData) {
        console.log(`📦 Trả về bài viết ${articleId} từ CACHE`);
        return cachedData;
    }

    // Thử API chính
    try {
        console.log(`🌐 Gọi API lấy bài viết ${articleId}...`);
        const apiUrl = `${API_CONFIG.NEWS_DETAIL}?id=${articleId}`;
        const response = await fetchWithTimeout(apiUrl);

        if (response.ok) {
            const data = await response.json();
            if (data.code === 200 && data.data && Array.isArray(data.data) && data.data.length > 0) {
                console.log(`✅ Lấy bài viết ${articleId} từ API chính (${data.data.length} bài)`);
                const cleanedArticles = data.data.map(cleanArticleImages);
                const result = {
                    articles: cleanedArticles,
                    hasSecondArticle: cleanedArticles.length > 1
                };
                // Lưu vào cache
                articleCache.set(cacheKey, result);
                console.log(`✅ Đã cache bài viết ${articleId} (TTL: 10 phút)`);
                return result;
            }
        }
    } catch (error) {
        console.warn(`⚠️ API chính lỗi cho ${articleId}:`, error.message);
    }

    // Fallback sang backup JSON CDN
    try {
        const backupUrl = `${API_CONFIG.BACKUP_URL}/${articleId}.json`;
        console.log(`🔄 Fallback sang backup: ${backupUrl}`);

        const response = await fetchWithTimeout(backupUrl);

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Lấy bài viết ${articleId} từ backup CDN`);
            const result = {
                articles: [cleanArticleImages(data)],
                hasSecondArticle: false
            };
            // Cache cả backup result
            articleCache.set(cacheKey, result);
            console.log(`✅ Đã cache bài viết ${articleId} từ backup (TTL: 10 phút)`);
            return result;
        }
    } catch (error) {
        console.error(`❌ Backup CDN cũng lỗi cho ${articleId}:`, error.message);
    }

    // Cả hai đều lỗi
    return null;
}

module.exports = {
    fetchNewsList,
    fetchArticle,
    cleanImageUrl,
    API_CONFIG
};
