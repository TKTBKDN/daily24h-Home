/**
 * SPORTNEWS - Trang web tin tức SEO-optimized
 * Server-Side Rendering với Express + EJS
 * Tối ưu cho Cloudflare Cache Everything
 */

const express = require('express');
const path = require('path');
const ejs = require('ejs');
const { getSubdomainConfig } = require('./config/subdomains');
const { fetchNewsList, fetchArticle } = require('./utils/api');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CẤU HÌNH EJS TEMPLATE ENGINE
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// STATIC FILES (CSS, Images)
// ============================================
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1y', // Cache static files 1 năm
    etag: true
}));

// ============================================
// MIDDLEWARE: DETECT SUBDOMAIN & INJECT ADS CONFIG
// ============================================
app.use((req, res, next) => {
    // Lấy subdomain từ host header
    const host = req.get('host') || 'localhost';
    const subdomainConfig = getSubdomainConfig(host);

    // Inject config vào res.locals để dùng trong views
    res.locals.siteConfig = subdomainConfig;
    res.locals.currentHost = host;

    next();
});

// ============================================
// HELPER: RENDER VỚI LAYOUT + CACHE HEADERS
// ============================================
async function renderWithLayout(res, viewName, data, cacheSeconds = 300) {
    const viewsPath = path.join(__dirname, 'views');

    // Set cache headers cho Cloudflare
    // s-maxage: cho CDN (Cloudflare), max-age: cho browser
    res.setHeader('Cache-Control', `public, max-age=60, s-maxage=${cacheSeconds}, stale-while-revalidate=600`);

    // Render body content trước
    const bodyContent = await ejs.renderFile(
        path.join(viewsPath, viewName + '.ejs'),
        { ...data, ...res.locals }
    );

    // Render layout với body content
    return res.render('layouts/main', {
        ...data,
        body: bodyContent
    });
}

// ============================================
// ROUTE: TRANG CHỦ
// ============================================
app.get('/', async (req, res) => {
    try {
        // Gọi API lấy danh sách bài viết
        const newsData = await fetchNewsList();

        await renderWithLayout(res, 'home', {
            title: res.locals.siteConfig.siteName + ' - Tin tức mới nhất',
            description: 'Cập nhật tin tức mới nhất về NFL, WNBA, Entertainment và nhiều hơn nữa.',
            newsGroups: newsData.data || [],
            canonical: `https://${res.locals.currentHost}/`
        });
    } catch (error) {
        console.error('Lỗi trang chủ:', error.message);
        await renderWithLayout(res, 'error', {
            title: 'Lỗi',
            message: 'Không thể tải danh sách bài viết. Vui lòng thử lại sau.'
        });
    }
});

// ============================================
// ROUTE: ADS.TXT - ĐỌC TỪ FILE RIÊNG CHO TỪNG SUBDOMAIN
// ============================================
const fs = require('fs');

app.get('/ads.txt', (req, res) => {
    const host = res.locals.currentHost.toLowerCase();
    const adsFilePath = path.join(__dirname, 'public', 'ads', `${host}.txt`);

    // Set headers
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 ngày

    // Kiểm tra file tồn tại
    if (fs.existsSync(adsFilePath)) {
        // Đọc và trả về file riêng của subdomain
        const content = fs.readFileSync(adsFilePath, 'utf8');
        res.send(content);
    } else {
        // File không tồn tại - trả về default
        const config = res.locals.siteConfig.config;
        let defaultAds = '';
        if (config.googleClientId) {
            defaultAds += `google.com, pub-${config.googleClientId}, DIRECT, f08c47fec0942fa0\n`;
        }
        defaultAds += `# Ads.txt for ${host}\n`;
        res.send(defaultAds);
    }
});

// ============================================
// STATIC PAGES: Contact, Terms, Privacy
// (Đặt TRƯỚC route /:slug để ưu tiên)
// ============================================
app.get('/page/contact', async (req, res) => {
    await renderWithLayout(res, 'pages/contact', {
        title: 'Contact Us - ' + res.locals.siteConfig.siteName,
        description: 'Contact us for any inquiries',
        canonical: `https://${res.locals.currentHost}/page/contact`
    });
});

app.get('/page/terms', async (req, res) => {
    await renderWithLayout(res, 'pages/terms', {
        title: 'Terms & Conditions - ' + res.locals.siteConfig.siteName,
        description: 'Terms and conditions of use',
        canonical: `https://${res.locals.currentHost}/page/terms`
    });
});

app.get('/page/privacy', async (req, res) => {
    await renderWithLayout(res, 'pages/privacy', {
        title: 'Privacy Policy - ' + res.locals.siteConfig.siteName,
        description: 'Our privacy policy',
        canonical: `https://${res.locals.currentHost}/page/privacy`
    });
});

// ============================================
// ROUTE DEMO: TEST NÚT CONTINUE VỚI 2 BÀI VIẾT
// Truy cập: http://localhost:3000/demo-continue
// ============================================
app.get('/demo-continue', async (req, res) => {
    const demoArticle1 = {
        name: 'BREAKING NEWS: Eminem took a stand last night that no one saw coming',
        summary: 'This is a demo article to test the Continue Reading button.',
        content: '<p>This is the content of the first article. It contains important information about the breaking news.</p><p>More paragraphs here to make the article look complete.</p><p>The story continues with more details and quotes from witnesses.</p>',
        avatarLink: 'https://file.lifenews247.com/sportnews/19-01-2026/ea315980-bd13-4a25-bc99-a342d9b4eaff.webp',
        dateTimeStart: '2026-01-19T14:45:00'
    };

    const demoArticle2 = {
        name: 'BREAKING: Dolly Parton has been named to TIME\'s 100 Most Influential People',
        summary: 'The second article that appears when you click Continue Reading.',
        content: '<p>This is the second article content. It will appear when you click the Continue Reading button.</p><p>More content for the second article.</p><p>The second story ends here.</p>',
        avatarLink: 'https://file.lifenews247.com/sportnews/19-01-2026/f427800d-0239-486d-8c1d-b288c30e21f1.webp',
        dateTimeStart: '2026-01-19T14:10:00'
    };

    await renderWithLayout(res, 'article', {
        title: demoArticle1.name,
        description: demoArticle1.summary,
        article: demoArticle1,
        secondArticle: demoArticle2,
        hasSecondArticle: true,
        canonical: `https://${res.locals.currentHost}/demo-continue`,
        publishedDate: demoArticle1.dateTimeStart
    });
});

// ============================================
// ROUTE: TRANG BÀI VIẾT (99.9% TRAFFIC)
// Lấy 12 ký tự cuối từ URL làm ID
// ============================================
app.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;

        // Lấy 12 ký tự cuối làm article ID
        // Ví dụ: "breaking-news-ab124bdc1534" → "ab124bdc1534"
        const articleId = slug.slice(-12);

        // Validate ID (phải là 12 ký tự hex)
        if (!/^[a-f0-9]{12}$/i.test(articleId)) {
            return await renderWithLayout(res, 'error', {
                title: 'Không tìm thấy',
                message: 'Bài viết không tồn tại hoặc URL không hợp lệ.'
            });
        }

        // Gọi API lấy chi tiết bài viết (có fallback tự động)
        // API mới trả về { articles: [...], hasSecondArticle: boolean }
        const result = await fetchArticle(articleId);

        if (!result || !result.articles || result.articles.length === 0) {
            return await renderWithLayout(res, 'error', {
                title: 'Không tìm thấy',
                message: 'Bài viết không tồn tại.'
            });
        }

        // Lấy bài viết chính (đầu tiên)
        const mainArticle = result.articles[0];

        // Lấy bài viết thứ 2 nếu có
        const secondArticle = result.hasSecondArticle ? result.articles[1] : null;

        // Chèn quảng cáo vào nội dung bài viết chính (sau đoạn 2 và đoạn 4)
        const contentWithAds = insertContentAds(
            mainArticle.content,
            res.locals.siteConfig.ads.afterParagraph2,
            res.locals.siteConfig.ads.afterParagraph4
        );

        await renderWithLayout(res, 'article', {
            title: mainArticle.name,
            description: mainArticle.summary || mainArticle.name.substring(0, 160),
            article: {
                ...mainArticle,
                content: contentWithAds
            },
            // Bài viết thứ 2 (nếu có)
            secondArticle: secondArticle,
            hasSecondArticle: result.hasSecondArticle,
            canonical: `https://${res.locals.currentHost}/${slug}`,
            publishedDate: mainArticle.dateTimeStart
        });

    } catch (error) {
        console.error('Lỗi bài viết:', error.message);
        await renderWithLayout(res, 'error', {
            title: 'Lỗi',
            message: 'Không thể tải bài viết. Vui lòng thử lại sau.'
        });
    }
});

// ============================================
// HELPER: CHÈN QUẢNG CÁO VÀO NỘI DUNG
// Chèn quảng cáo sau đoạn văn thứ 2 và thứ 4
// ============================================
function insertContentAds(content, adAfterParagraph2, adAfterParagraph4) {
    if (!content) return content;

    // Tìm tất cả vị trí thẻ </p>
    const regex = /<\/p>/gi;
    let match;
    let positions = [];

    while ((match = regex.exec(content)) !== null) {
        positions.push(match.index + match[0].length);
    }

    // Không đủ đoạn văn
    if (positions.length < 2) return content;

    let result = content;
    let offset = 0;

    // Chèn quảng cáo sau đoạn 2 (nếu có)
    if (adAfterParagraph2 && positions.length >= 2) {
        const insertPos2 = positions[1] + offset;
        result = result.slice(0, insertPos2) + adAfterParagraph2 + result.slice(insertPos2);
        offset += adAfterParagraph2.length;
    }

    // Chèn quảng cáo sau đoạn 4 (nếu có)
    if (adAfterParagraph4 && positions.length >= 4) {
        const insertPos4 = positions[3] + offset;
        result = result.slice(0, insertPos4) + adAfterParagraph4 + result.slice(insertPos4);
    }

    return result;
}

// ============================================
// 404 HANDLER
// ============================================
app.use(async (req, res) => {
    res.status(404);
    await renderWithLayout(res, 'error', {
        title: 'Không tìm thấy',
        message: 'Trang bạn đang tìm không tồn tại.'
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 SPORTNEWS server đang chạy tại http://localhost:${PORT}`);
    console.log(`📝 Môi trường: ${process.env.NODE_ENV || 'development'}`);
});
