/**
 * CẤU HÌNH MULTI-SUBDOMAIN - TỐI GIẢN
 * Chỉ cần truyền các ID, script sẽ được tự động generate
 */

// ============================================
// BUILDER FUNCTIONS - TẠO CODE TỰ ĐỘNG
// ============================================

/**
 * Tạo header scripts từ config
 */
function buildHeaderScripts(config) {
    let scripts = '';

    // Google Analytics
    if (config.googleTagId) {
        scripts += `
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.googleTagId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${config.googleTagId}');
</script>`;
    }

    // Google AdSense
    if (config.googleClientId) {
        scripts += `
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${config.googleClientId}" crossorigin="anonymous"></script>`;
    }

    // AdsKeeper
    if (config.adsKeeperSrc) {
        scripts += `
<script src="https://jsc.adskeeper.com/site/${config.adsKeeperSrc}.js" async></script>`;
    }

    // Video Ads (videoadstech.org)
    if (config.videoAdsScript) {
        scripts += `
<script defer src="https://videoadstech.org/ads/${config.videoAdsScript}.video.js"></script>`;
    }

    // Display Ads (adhub.media)
    if (config.displayAdsScript) {
        scripts += `
<script async src="https://server.adhub.media/ads/${config.displayAdsScript}.display.js"></script>`;
    }

    // Custom scripts (nếu có)
    if (config.customScripts) {
        scripts += config.customScripts;
    }

    return scripts;
}

/**
 * Tạo AdSense unit
 */
function buildAdSenseUnit(clientId, slotId, name) {
    if (!clientId || !slotId) return '';
    return `
<div class="ad-container">
<!-- ${name || 'AdSense Ad'} -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-${clientId}"
     data-ad-slot="${slotId}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>`;
}

/**
 * Tạo MGWidget unit
 */
function buildMGWidget(widgetId) {
    if (!widgetId) return '';
    return `
<div class="ad-container">
<div data-type="_mgwidget" data-widget-id="${widgetId}"></div>
<script>(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");</script>
</div>`;
}

/**
 * Build full ads config từ subdomain config
 */
function buildAdsConfig(config) {
    return {
        beforeTitle: '',
        afterTitle: buildAdSenseUnit(config.googleClientId, config.googleClientSlotId, 'After Title'),
        afterParagraph2: buildAdSenseUnit(config.googleClientId, config.googleAdSlot, 'After Paragraph 2'),
        afterParagraph4: buildMGWidget(config.mgWidgetId),
        endContent: buildMGWidget(config.mgWidgetFeedId)
    };
}

// ============================================
// CẤU HÌNH MẶC ĐỊNH
// ============================================
const DEFAULT_VALUES = {
    siteName: 'NewsEdge',
    googleClientId: '7472198107183412',
    googleClientSlotId: '2746940340',
    googleAdSlot: '6686185351',
    adsKeeperSrc: '1077791',
    mgWidgetFeedId: '1945408',
    mgWidgetId: '1945409',
    googleTagId: 'G-XNSNRWBWH1'
};

// ============================================
// CẤU HÌNH RIÊNG CHO TỪNG SUBDOMAIN
// Chỉ cần override các giá trị khác default
// ============================================
const SUBDOMAIN_CONFIGS = {

    // Subdomain: topnews.daily24.blog
    'topnews.daily24.blog': {
        siteName: 'Top News Daily',
        // Google Analytics
        googleTagId: 'G-XNSNRWBWH1',
        // Google AdSense
        googleClientId: '7472198107183412',
        googleClientSlotId: '2746940340',
        googleAdSlot: '6686185351',
        // AdsKeeper
        adsKeeperSrc: '1077787',
        // MGWidget
        mgWidgetId: '1945399',
        mgWidgetFeedId: '1945398',
        // Video Ads & Display Ads
        videoAdsScript: 'topnews_daily24_blog.8054ed27-8f3b-4f77-8a44-edfb05b322ba',
        displayAdsScript: 'topnews_daily24_blog.86b3123c-d45e-409c-9995-903ff27537d9',
    },

    // local.daily24.blog
    'local.daily24.blog': {
        siteName: 'Local Daily News',
        googleTagId: 'G-CPFRWM48QG',
        googleClientId: '7472198107183412',
        googleClientSlotId: '9619470450',
        googleAdSlot: '4554846038',
        adsKeeperSrc: '1077788',
        mgWidgetId: '1945401',
        mgWidgetFeedId: '1945400',
        videoAdsScript: 'local_daily24_blog.a0e39877-48ea-47e9-a271-69d1fe7f0705',
        displayAdsScript: 'local_daily24_blog.8385f051-6ea0-4c94-b738-d0f3e841973e',
    },

    // leeus.daily24.blog
    'leeus.daily24.blog': {
        siteName: 'Leeus Daily News',
        googleTagId: 'G-N62VQXFKYE',
        googleClientId: '7472198107183412',
        googleClientSlotId: '1932552123',
        googleAdSlot: '6885495905',
        adsKeeperSrc: '1077789',
        mgWidgetId: '1945404',
        mgWidgetFeedId: '1945403',
        videoAdsScript: 'leeus_daily24_blog.fde41e9f-f85c-47d2-a130-ea29d2a9e1c1',
        displayAdsScript: 'leeus_daily24_blog.1b4e6cdf-2f82-474e-b50e-82ef34e6fd27',
    },

    // hotnews.daily24.blog
    'hotnews.daily24.blog': {
        siteName: 'Hot News Daily',
        googleTagId: 'G-5E4VP1CQ03',
        googleClientId: '7472198107183412',
        googleClientSlotId: '1824740913',
        googleAdSlot: '7710718335',
        adsKeeperSrc: '1077790',
        mgWidgetId: '1945406',
        mgWidgetFeedId: '1945405',
        videoAdsScript: 'hotnews_daily24_blog.d3b3a29e-c1c8-4ca0-9f40-3fd44981edbf',
        displayAdsScript: 'hotnews_daily24_blog.643bf8c7-69b0-4ff4-b5bb-889413bc3e7c',
    },

    // hoaus.daily24.blog
    'hoaus.daily24.blog': {
        siteName: 'Hoaus Daily News',
        googleTagId: 'G-3DR2W4NTLC',
        googleClientId: '7472198107183412',
        googleClientSlotId: '6877757043',
        googleAdSlot: '4251593703',
        adsKeeperSrc: '1077791',
        mgWidgetId: '1945409',
        mgWidgetFeedId: '1945408',
        videoAdsScript: 'hoaus_daily24_blog.4537ef9a-8978-4d2d-b590-32889c180a43',
        displayAdsScript: 'hoaus_daily24_blog.a4ab7ddc-9045-4153-a337-caff2d0344f8',
    },

    // anhus.daily24.blog
    'anhus.daily24.blog': {
        siteName: 'Anhus Daily News',
        googleTagId: 'G-86H9DWLR2B',
        googleClientId: '7472198107183412',
        googleClientSlotId: '8306388784',
        googleAdSlot: '5084554998',
        adsKeeperSrc: '1077792',
        mgWidgetId: '1945411',
        mgWidgetFeedId: '1945410',
        videoAdsScript: 'anhus_daily24_blog.88dfa97d-31cc-4294-b247-9af265543343',
        displayAdsScript: 'anhus_daily24_blog.80d33374-7854-4850-92e1-f725ed778c04',
    },

    // vtus.daily24.blog
    'vtus.daily24.blog': {
        siteName: 'Vtus Daily News',
        googleTagId: 'G-8632WKW9SY',
        googleClientId: '7472198107183412',
        googleClientSlotId: '2938512032',
        googleAdSlot: '3245633791',
        adsKeeperSrc: '1077793',
        mgWidgetId: '1945413',
        mgWidgetFeedId: '1945412',
        videoAdsScript: 'vtus_daily24_blog.754805d1-7acc-4c91-9192-bcaea694a88c',
        displayAdsScript: 'vtus_daily24_blog.b1f3a15d-1316-4285-b770-22003fe1c1e7',
    },

    // dailynewsus.daily24.blog
    'dailynewsus.daily24.blog': {
        siteName: 'Daily News US',
        googleTagId: 'G-28D67R3Z7M',
        googleClientId: '7472198107183412',
        googleClientSlotId: '6320984157',
        googleAdSlot: '3735522729',
        adsKeeperSrc: '1077877',
        mgWidgetId: '1945825',
        mgWidgetFeedId: '1945824',
        videoAdsScript: 'dailynewsus_daily24_blog.f5bf71ae-78ec-4909-934a-23ab3391027b',
        displayAdsScript: 'dailynewsus_daily24_blog.770b683b-4e0e-46b9-8914-f43db02ba074',
    },

    // news.daily24.blog
    'news.daily24.blog': {
        siteName: 'News Daily',
        googleTagId: 'G-8KMEF08FKY',
        googleClientId: '7472198107183412',
        googleClientSlotId: '1284619200',
        googleAdSlot: '5738095451',
        adsKeeperSrc: '1077878',
        mgWidgetId: '1951969',
        mgWidgetFeedId: '1951968',
        videoAdsScript: 'news_daily24_blog.adc6f4cc-fd6b-4bc4-9060-65b2e4a7ecd0',
        displayAdsScript: 'news_daily24_blog.8a499c6d-2a86-4eb5-8fa4-ece5e0490866',
    },

    // Subdomain chính
    'homesport.hotnewsus24h.com': {
        siteName: 'NewsEdge',
    },

    // ============================================
    // SUBDOMAIN VỚI ADS RIÊNG
    // ============================================

    'testsport.hotnews247.us': {
        siteName: 'Test Sport News',
        // Google Analytics
        googleTagId: 'G-XNSNRWBWH1',
        // Google AdSense
        googleClientId: '7472198107183412',
        googleClientSlotId: '2746940340',
        googleAdSlot: '6686185351',
        // AdsKeeper
        adsKeeperSrc: '1077791',
        // MGWidget
        mgWidgetFeedId: '1945408',
        mgWidgetId: '1945409',
        // Video Ads & Display Ads - THAY ID RIÊNG
        videoAdsScript: 'testsport_hotnews247_us.YOUR_VIDEO_ID',
        displayAdsScript: 'testsport_hotnews247_us.YOUR_DISPLAY_ID',
    },

    'testsport2.hotnews247.us': {
        siteName: 'Test Sport 2 News',
        // Google Analytics
        googleTagId: 'G-XXXXXXXX',
        // Google AdSense
        googleClientId: 'YOUR_CLIENT_ID',
        googleClientSlotId: 'YOUR_SLOT_ID_1',
        googleAdSlot: 'YOUR_SLOT_ID_2',
        // AdsKeeper
        adsKeeperSrc: 'YOUR_ADSKEEPER_ID',
        // MGWidget
        mgWidgetFeedId: 'YOUR_MGFEED_ID',
        mgWidgetId: 'YOUR_MGWIDGET_ID',
        // Video Ads & Display Ads - THAY ID RIÊNG
        videoAdsScript: 'testsport2_hotnews247_us.YOUR_VIDEO_ID',
        displayAdsScript: 'testsport2_hotnews247_us.YOUR_DISPLAY_ID',
    },

    // Localhost cho testing
    'localhost:3000': {
        siteName: 'NewsEdge',
    }

    // ============================================
    // THÊM SUBDOMAIN MỚI - CHỈ CẦN OVERRIDE GIÁ TRỊ KHÁC
    // ============================================
    // 'news.example.com': {
    //     siteName: 'News Example',
    //     googleClientId: 'YOUR_ADSENSE_CLIENT_ID',
    //     googleClientSlotId: 'YOUR_SLOT_1',
    //     googleAdSlot: 'YOUR_SLOT_2',
    //     adsKeeperSrc: 'YOUR_ADSKEEPER_ID',
    //     mgWidgetFeedId: 'YOUR_MGFEED_ID',
    //     mgWidgetId: 'YOUR_MGWIDGET_ID',
    //     googleTagId: 'YOUR_GA_TAG'
    // }
};

/**
 * Tạo siteName từ hostname
 * Ví dụ: sport.example.com -> Sport Example
 */
function generateSiteName(hostname) {
    // Lấy subdomain hoặc domain chính
    const parts = hostname.replace(/:\d+$/, '').split('.');
    if (parts.length >= 2) {
        // Lấy phần đầu tiên (subdomain) hoặc domain
        const name = parts[0];
        // Capitalize first letter
        return name.charAt(0).toUpperCase() + name.slice(1) + ' News';
    }
    return 'NewsEdge';
}

/**
 * Lấy cấu hình đầy đủ cho subdomain
 * CHẤP NHẬN MỌI SUBDOMAIN - Cloudflare SaaS compatible
 * @param {string} host - Host header từ request
 * @returns {object} - Config đầy đủ với ads và scripts
 */
function getSubdomainConfig(host) {
    const hostname = host.toLowerCase();

    // Merge config: DEFAULT_VALUES + subdomain specific (nếu có)
    const subConfig = SUBDOMAIN_CONFIGS[hostname] || {};
    const mergedConfig = {
        ...DEFAULT_VALUES,
        ...subConfig
    };

    // Nếu subdomain chưa cấu hình, tự động tạo siteName từ hostname
    if (!SUBDOMAIN_CONFIGS[hostname]) {
        mergedConfig.siteName = generateSiteName(hostname);
        console.log(`🌐 New subdomain detected: ${hostname} -> ${mergedConfig.siteName}`);
    }

    // Build và return config cuối cùng
    return {
        siteName: mergedConfig.siteName,
        logo: '/images/logo.png',
        headerScripts: buildHeaderScripts(mergedConfig),
        ads: buildAdsConfig(mergedConfig),
        // Expose raw values nếu cần dùng ở template
        config: mergedConfig
    };
}

module.exports = {
    getSubdomainConfig,
    SUBDOMAIN_CONFIGS,
    DEFAULT_VALUES,
    // Export builders nếu cần dùng riêng
    buildHeaderScripts,
    buildAdSenseUnit,
    buildMGWidget
};
