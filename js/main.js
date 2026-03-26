let categories = [];
let tools = [];
let currentCategoryId = null;

// 获取数据
async function getData() {
    console.log('开始获取数据...');
    
    // 从localStorage加载数据
    const storedData = localStorage.getItem('toolsData');
    if (storedData) {
        console.log('从localStorage加载数据');
        const data = JSON.parse(storedData);
        return data;
    }
    
    // 如果localStorage中没有数据，从JSON文件加载
    console.log('localStorage中没有数据，从JSON文件加载');
    
    try {
        // 并行请求所有数据文件
        console.log('开始请求JSON文件...');
        const [categoriesResponse, toolsResponse, adsResponse, settingResponse, usersResponse, pagesResponse] = await Promise.all([
            fetch('data/categories.json'),
            fetch('data/tools.json'),
            fetch('data/ads.json'),
            fetch('data/setting.json'),
            fetch('data/users.json'),
            fetch('data/pages.json')
        ]);
        
        // 检查响应状态
        if (!categoriesResponse.ok) {
            throw new Error(`加载categories.json失败: ${categoriesResponse.status}`);
        }
        if (!toolsResponse.ok) {
            throw new Error(`加载tools.json失败: ${toolsResponse.status}`);
        }
        if (!adsResponse.ok) {
            throw new Error(`加载ads.json失败: ${adsResponse.status}`);
        }
        if (!settingResponse.ok) {
            throw new Error(`加载setting.json失败: ${settingResponse.status}`);
        }
        if (!usersResponse.ok) {
            throw new Error(`加载users.json失败: ${usersResponse.status}`);
        }
        if (!pagesResponse.ok) {
            throw new Error(`加载pages.json失败: ${pagesResponse.status}`);
        }
        
        // 解析所有响应
        console.log('开始解析JSON数据...');
        const categoriesData = await categoriesResponse.json();
        const toolsData = await toolsResponse.json();
        const adsData = await adsResponse.json();
        const settingData = await settingResponse.json();
        const usersData = await usersResponse.json();
        const pagesData = await pagesResponse.json();
        
        // 合并所有数据（网站设置和页脚设置已合并到setting中）
        const data = {
            categories: categoriesData.categories || [],
            tools: toolsData.tools || [],
            ads: adsData.ads || [],
            setting: settingData.setting || {},
            users: usersData.users || [],
            pages: pagesData.pages || [],
            analytics: {
                visitors: [],
                toolClicks: []
            }
        };
        
        console.log('合并后的数据:', data);
        
        // 保存到localStorage
        localStorage.setItem('toolsData', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('加载数据失败:', error);
        // 返回空数据
        return {
            categories: [],
            tools: [],
            ads: [],
            setting: {},
            users: [],
            pages: [],
            analytics: {
                visitors: [],
                toolClicks: []
            }
        };
    }
}



// 加载数据
async function loadData() {
    try {
        console.log('开始加载数据...');
        const data = await getData();
        console.log('数据加载完成:', data);
        
        // 确保categories和tools数组存在
        categories = data.categories || [];
        tools = data.tools || [];
        
        console.log('分类数据:', categories);
        console.log('工具数据:', tools);
        
        // 渲染分类和工具
        renderCategories();
        applyWebsiteSettings(data);
        applyFooterSettings(data);
        renderAds(data);
        
        console.log('数据渲染完成');
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// 应用网站设置
function applyWebsiteSettings(data) {
    const setting = data.setting || {};
    
    // 设置标签页标题（网站标题 - 网站副标题）
    const pageTitle = setting.title || '外贸工具箱';
    const pageSubtitle = setting.subtitle || '';
    const fullPageTitle = pageSubtitle ? `${pageTitle} - ${pageSubtitle}` : pageTitle;
    document.title = fullPageTitle;
    
    // 设置网站标题
    const siteTitle = document.getElementById('site-title');
    if (siteTitle) {
        siteTitle.textContent = fullPageTitle;
    }
    
    // 设置网站描述
    const siteDescription = document.getElementById('site-description');
    if (siteDescription) {
        siteDescription.setAttribute('content', setting.description || '');
    }
    
    // 设置网站关键词
    const siteKeywords = document.getElementById('site-keywords');
    if (siteKeywords) {
        siteKeywords.setAttribute('content', setting.keywords || '');
    }
    
    // 设置网站Logo
    const siteLogo = document.getElementById('site-logo');
    const siteHeading = document.getElementById('site-heading');
    if (siteLogo && siteHeading) {
        // 如果有logo，设置为favicon（标签页图标）
        if (setting.logo) {
            siteLogo.src = setting.logo;
            // 创建或更新favicon
            let favicon = document.querySelector('link[rel="icon"]');
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = setting.logo;
        }
        
        // 在全屏模式下显示logo，否则隐藏
        if (setting.layout === 'fullscreen') {
            siteLogo.style.display = 'block';
        } else {
            siteLogo.style.display = 'none';
            siteHeading.style.marginLeft = '0';
        }
    }
    
    // 设置页面标题
    if (setting.title) {
        document.getElementById('site-heading').textContent = setting.title;
    }
    
    // 设置网站副标题
    const siteSubtitle = document.getElementById('site-subtitle');
    if (siteSubtitle && setting.subtitle) {
        siteSubtitle.textContent = setting.subtitle;
        // 在浅色模式和全屏模式下显示副标题
        siteSubtitle.style.display = 'block';
    }
    
    // 应用主题设置
    applyTheme(setting.theme, setting.layout, setting.customTheme);
}

// 应用主题
function applyTheme(theme, layout, customTheme) {
    // 移除现有的主题样式
    const existingThemeStyle = document.getElementById('theme-style');
    if (existingThemeStyle) {
        existingThemeStyle.remove();
    }
    
    // 应用布局
    if (layout === 'fullscreen') {
        document.body.classList.add('fullscreen-layout');
        // 将header内容移动到sidebar内
        moveHeaderToSidebar();
    } else {
        document.body.classList.remove('fullscreen-layout');
        // 恢复header内容
        restoreHeader();
    }
    
    // 应用主题
    const themeStyle = document.createElement('style');
    themeStyle.id = 'theme-style';
    
    let themeCSS = '';
    
    if (theme === 'dark') {
        themeCSS = `
            :root {
                --primary-color: #60A5FA;
                --secondary-color: #3B82F6;
                --background-color: #18181B;
                --text-color: #E2E8F0;
                --text-dark: #E2E8F0;
                --border-color: #E2E8F0;
                --card-background: #27272A;
                --card-hover: #3F3F46;
            }
            
            body {
                background-color: var(--background-color);
                color: var(--text-color);
            }
            
            .sidebar {
                background-color: #27272A;
            }
            
            .sidebar h2 {
                color: #E2E8F0;
            }
            
            .sidebar #category-list button {
                background-color: #FFFFFF;
                color: #18181B;
                border: none;
                padding: 10px;
                width: 100%;
                text-align: left;
                cursor: pointer;
            }
            
            .sidebar #category-list button:hover,
            .sidebar #category-list button.active {
                background-color: var(--primary-color);
                color: #FFFFFF;
            }
            
            .tool-card {
                background-color: var(--card-background);
                border: 1px solid #FFFFFF;
            }
            
            .tool-card:hover {
                background-color: var(--card-hover);
            }
            
            .tool-card h3 {
                color: #18181B;
            }
            
            .tool-description {
                color: #18181B;
            }
            
            header h1 {
                color: #E2E8F0 !important;
            }
            
            #current-category {
                color: #E2E8F0;
            }
            
            .mobile-sidebar-content {
                background-color: #27272A;
            }
            
            .mobile-sidebar-header h2 {
                color: #E2E8F0;
            }
            
            #mobile-category-list button {
                background-color: #FFFFFF;
                color: #18181B;
                border: none;
            }
            
            #mobile-category-list button:hover,
            #mobile-category-list button.active {
                background-color: var(--primary-color);
                color: #FFFFFF;
            }
            
            .fullscreen-layout .sidebar h2 {
                display: none;
            }
            
            .fullscreen-layout .theme-toggle {
                display: none;
            }
            
            .fullscreen-layout .sidebar-header .logo-container {
                display: flex;
                align-items: center;
                gap: 15px;
                width: 100%;
            }
            
            .fullscreen-layout .sidebar-header .logo-container #site-logo {
                display: block;
                width: 30%;
                height: auto;
            }
            
            .fullscreen-layout .sidebar-header .logo-container > div {
                width: 70%;
            }
            
            .fullscreen-layout .sidebar-header .logo-container h1 {
                margin: 0;
            }
            
            .fullscreen-layout .sidebar-header .logo-container #site-subtitle {
                display: block;
                font-size: 14px;
                color: #E2E8F0;
                margin-top: 5px;
            }
            
            .theme-btn {
                background-color: #27272A;
                color: #E2E8F0;
            }
            
            footer {
                color: #E2E8F0;
            }
            
            footer .footer-content {
                color: #E2E8F0;
            }
            
            footer #footer-links a {
                color: #E2E8F0;
            }
            
            footer #footer-copyright {
                color: #E2E8F0;
            }
            
            footer #footer-statement {
                color: #E2E8F0;
            }
        `;
    } else {
        // 浅色模式
        themeCSS = `
            :root {
                --primary-color: #3B82F6;
                --secondary-color: #60A5FA;
                --background-color: #FFFFFF;
                --text-color: #334155;
                --text-dark: #334155;
                --border-color: #334155;
                --card-background: white;
                --card-hover: #F1F5F9;
            }
            
            body {
                background-color: var(--background-color);
                color: var(--text-color);
            }
            
            .sidebar {
                background-color: #F1F5F9;
            }
            
            .sidebar h2 {
                color: #334155;
            }
            
            .sidebar #category-list button {
                background-color: white;
                color: #334155;
                border: none;
                padding: 10px;
                width: 100%;
                text-align: left;
                cursor: pointer;
            }
            
            .sidebar #category-list button:hover,
            .sidebar #category-list button.active {
                background-color: var(--primary-color);
                color: white;
            }
            
            .tool-card {
                background-color: var(--card-background);
                border: 1px solid var(--border-color);
            }
            
            .tool-card:hover {
                background-color: var(--card-hover);
            }
            
            .tool-card h3 {
                color: var(--text-dark);
            }
            
            .tool-description {
                color: #64748B;
            }
            
            header h1 {
                color: #334155;
            }
            
            #current-category {
                color: #334155;
            }
            
            .mobile-sidebar-content {
                background-color: white;
            }
            
            .mobile-sidebar-header h2 {
                color: #334155;
            }
            
            #mobile-category-list button {
                background-color: white;
                color: #334155;
                border: none;
            }
            
            #mobile-category-list button:hover,
            #mobile-category-list button.active {
                background-color: var(--primary-color);
                color: white;
            }
            
            .fullscreen-layout .sidebar h2 {
                display: none;
            }
            
            .fullscreen-layout .theme-toggle {
                display: none;
            }
            
            .fullscreen-layout .sidebar-header .logo-container {
                display: flex;
                align-items: center;
                gap: 15px;
                width: 100%;
            }
            
            .fullscreen-layout .sidebar-header .logo-container #site-logo {
                display: block;
                width: 30%;
                height: auto;
            }
            
            .fullscreen-layout .sidebar-header .logo-container > div {
                width: 70%;
            }
            
            .fullscreen-layout .sidebar-header .logo-container h1 {
                margin: 0;
            }
            
            .fullscreen-layout .sidebar-header .logo-container #site-subtitle {
                display: block;
                font-size: 14px;
                color: var(--text-color);
                margin-top: 5px;
            }
            
            .theme-btn {
                background-color: #F1F5F9;
                color: #334155;
            }
            
            footer {
                color: #334155;
            }
            
            footer .footer-content {
                color: #334155;
            }
            
            footer #footer-links a {
                color: #334155;
            }
            
            footer #footer-copyright {
                color: #334155;
            }
            
            footer #footer-statement {
                color: #334155;
            }
        `;
    }
    
    themeStyle.textContent = themeCSS;
    document.head.appendChild(themeStyle);
    
    // 更新主题按钮状态
    const themeButton = document.querySelector('.theme-btn');
    if (themeButton) {
        themeButton.innerHTML = theme === 'light' ? '☀️' : '🌙';
        themeButton.title = theme === 'light' ? '切换到浅色模式' : '切换到深色模式';
    }
}



// 初始化主题切换功能
function initThemeToggle() {
    const themeButton = document.querySelector('.theme-btn');
    if (themeButton) {
        themeButton.addEventListener('click', () => {
            // 获取当前主题
            const data = JSON.parse(localStorage.getItem('toolsData') || '{}');
            const home = data.home || {};
            const currentTheme = home.theme || 'light';
            
            // 切换主题
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // 更新按钮图标和标题
            themeButton.innerHTML = newTheme === 'light' ? '☀️' : '🌙';
            themeButton.title = newTheme === 'light' ? '切换到浅色模式' : '切换到深色模式';
            
            // 保存主题设置
            home.theme = newTheme;
            data.home = home;
            localStorage.setItem('toolsData', JSON.stringify(data));
            
            // 应用主题
            applyTheme(newTheme, home.layout || 'normal', home.customTheme || '');
        });
    }
}

// 将header内容移动到sidebar内
function moveHeaderToSidebar() {
    const header = document.querySelector('header');
    const sidebar = document.querySelector('.sidebar');
    
    if (header && sidebar) {
        // 检查是否已经存在sidebar-header
        const existingSidebarHeader = sidebar.querySelector('.sidebar-header');
        if (existingSidebarHeader) {
            console.log('sidebar-header已存在，不再创建');
            return;
        }
        
        // 保存header内容
        const headerContent = header.innerHTML;
        localStorage.setItem('headerContent', headerContent);
        
        // 在sidebar顶部添加header内容
        const sidebarHeader = document.createElement('div');
        sidebarHeader.className = 'sidebar-header';
        sidebarHeader.innerHTML = headerContent;
        
        // 移除sidebar中的第一个h2元素（如果存在）
        const sidebarH2 = sidebar.querySelector('h2');
        if (sidebarH2) {
            sidebar.insertBefore(sidebarHeader, sidebarH2);
        } else {
            sidebar.insertBefore(sidebarHeader, sidebar.firstChild);
        }
        
        // 重新渲染分类列表，绑定点击事件
        renderCategories();
    }
}

// 恢复header内容
function restoreHeader() {
    const header = document.querySelector('header');
    const sidebarHeader = document.querySelector('.sidebar-header');
    
    if (header && sidebarHeader) {
        // 恢复header内容
        const headerContent = localStorage.getItem('headerContent');
        if (headerContent) {
            header.innerHTML = headerContent;
        }
        
        // 移除sidebar中的header内容
        sidebarHeader.remove();
    }
}

// 应用页脚设置
function applyFooterSettings(data) {
    const setting = data.setting || {};
    
    // 设置友情链接（支持HTML）
    const footerLinks = document.getElementById('footer-links');
    if (footerLinks) {
        if (setting.links) {
            footerLinks.innerHTML = setting.links;
            footerLinks.style.display = 'block';
            
            console.log('页脚链接内容:', setting.links);
            console.log('页脚链接元素:', footerLinks);
            
            // 为页脚链接添加点击事件
            const links = footerLinks.querySelectorAll('a');
            console.log('找到的链接数量:', links.length);
            
            links.forEach((link, index) => {
                const href = link.getAttribute('href');
                console.log(`链接${index}:`, href);
                
                if (href && href.startsWith('#')) {
                    link.addEventListener('click', function(e) {
                        console.log('点击了链接:', href);
                        e.preventDefault();
                        const pageSlug = href.substring(1);
                        showPageContent(pageSlug);
                    });
                }
            });
        } else {
            footerLinks.style.display = 'none';
        }
    }
    
    // 设置版权信息（支持HTML）
    const footerCopyright = document.getElementById('footer-copyright');
    if (footerCopyright) {
        if (setting.copyright) {
            footerCopyright.innerHTML = setting.copyright;
            footerCopyright.style.display = 'block';
        } else {
            footerCopyright.textContent = `© ${new Date().getFullYear()} 外贸工具箱`;
            footerCopyright.style.display = 'block';
        }
    }
    
    // 设置声明（支持HTML）
    const footerStatement = document.getElementById('footer-statement');
    if (footerStatement) {
        if (setting.statement) {
            footerStatement.innerHTML = setting.statement;
            footerStatement.style.display = 'block';
        } else {
            footerStatement.style.display = 'none';
        }
    }
}

// 渲染分类列表
function renderCategories() {
    console.log('开始渲染分类列表...');
    console.log('分类数据:', categories);
    
    // 渲染桌面端分类列表
    const categoryList = document.getElementById('category-list');
    if (categoryList) {
        categoryList.innerHTML = '';
        
        if (categories.length === 0) {
            console.log('分类列表为空');
            categoryList.innerHTML = '<li><button>暂无分类</button></li>';
        } else {
            categories.forEach(category => {
                console.log('渲染分类:', category);
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.textContent = category.name;
                button.dataset.categoryId = category.id;
                
                button.addEventListener('click', () => {
                    selectCategory(category.id);
                });
                
                li.appendChild(button);
                categoryList.appendChild(li);
            });
            
            // 默认选中第一个分类
            if (categories.length > 0) {
                console.log('默认选中第一个分类:', categories[0].id);
                selectCategory(categories[0].id);
            }
        }
    }
    
    // 渲染移动端分类列表
    const mobileCategoryList = document.getElementById('mobile-category-list');
    if (mobileCategoryList) {
        mobileCategoryList.innerHTML = '';
        
        if (categories.length === 0) {
            mobileCategoryList.innerHTML = '<li><button>暂无分类</button></li>';
        } else {
            categories.forEach(category => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.textContent = category.name;
                button.dataset.categoryId = category.id;
                
                button.addEventListener('click', () => {
                    selectCategory(category.id);
                    // 关闭移动端菜单
                    document.getElementById('mobile-sidebar').classList.remove('active');
                    document.getElementById('menu-toggle').classList.remove('active');
                });
                
                li.appendChild(button);
                mobileCategoryList.appendChild(li);
            });
        }
    }
    
    console.log('分类列表渲染完成');
}

// 选择分类
function selectCategory(categoryId) {
    currentCategoryId = categoryId;
    
    // 更新桌面端按钮状态
    document.querySelectorAll('#category-list button').forEach(btn => {
        btn.classList.remove('active');
    });
    const desktopBtn = document.querySelector(`#category-list [data-category-id="${categoryId}"]`);
    if (desktopBtn) {
        desktopBtn.classList.add('active');
    }
    
    // 更新移动端按钮状态
    document.querySelectorAll('#mobile-category-list button').forEach(btn => {
        btn.classList.remove('active');
    });
    const mobileBtn = document.querySelector(`#mobile-category-list [data-category-id="${categoryId}"]`);
    if (mobileBtn) {
        mobileBtn.classList.add('active');
    }
    
    // 更新当前分类标题
    const category = categories.find(c => c.id === categoryId);
    document.getElementById('current-category').textContent = category.name;
    
    // 显示工具内容
    document.querySelector('.tools-section').style.display = 'block';
    
    // 隐藏页面内容
    const pageContentContainer = document.getElementById('page-content-container');
    if (pageContentContainer) {
        pageContentContainer.style.display = 'none';
    }
    
    // 渲染工具列表
    renderTools();
}

// 初始化移动端菜单
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileSidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            mobileSidebar.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    }
    
    // 点击菜单外部关闭菜单
    if (mobileSidebar) {
        mobileSidebar.addEventListener('click', (e) => {
            if (e.target === mobileSidebar) {
                mobileSidebar.classList.remove('active');
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                }
            }
        });
    }
}

// 渲染工具列表
function renderTools() {
    console.log('开始渲染工具列表...');
    console.log('当前分类ID:', currentCategoryId);
    console.log('所有工具:', tools);
    
    const toolsGrid = document.getElementById('tools-grid');
    toolsGrid.innerHTML = '';
    
    const filteredTools = tools.filter(tool => tool.category_id === currentCategoryId);
    console.log('筛选后的工具:', filteredTools);
    
    if (filteredTools.length === 0) {
        console.log('该分类下暂无工具');
        toolsGrid.innerHTML = '<p style="text-align: center; color: #666;">该分类下暂无工具</p>';
        return;
    }
    
    filteredTools.forEach(tool => {
        console.log('渲染工具:', tool);
        const toolCard = document.createElement('div');
        toolCard.className = 'tool-card';
        
        const iconHtml = tool.icon ? `<img src="${tool.icon}" style="border-radius: 8px;">` : `<div style="background-color: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999;">📦</div>`;
        
        toolCard.innerHTML = `
            ${iconHtml}
            <div>
                <h3>${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
            </div>
        `;
        
        toolCard.addEventListener('click', () => {
            window.open(tool.url, '_blank');
        });
        
        toolsGrid.appendChild(toolCard);
    });
    
    console.log('工具列表渲染完成');
}

// 渲染广告
function renderAds(data) {
    const adsContainer = document.getElementById('sidebar-ads');
    if (!adsContainer) return;
    
    const ads = data.ads || [];
    // 筛选出启用状态的广告，最多显示2个
    const activeAds = ads.filter(ad => ad.status === 'active').slice(0, 2);
    
    adsContainer.innerHTML = '';
    
    if (activeAds.length === 0) {
        return;
    }
    
    activeAds.forEach(ad => {
        const adItem = document.createElement('div');
        adItem.className = 'ad-item';
        
        adItem.innerHTML = `
            <a href="${ad.url}" target="_blank" rel="noopener noreferrer">
                <img src="${ad.image}" alt="${ad.name}">
            </a>
        `;
        
        adsContainer.appendChild(adItem);
    });
}

// 显示页面内容
function showPageContent(pageSlug) {
    console.log('点击页面链接:', pageSlug);
    const data = JSON.parse(localStorage.getItem('toolsData') || '{}');
    console.log('页面数据:', data.pages);
    const page = data.pages.find(p => p.slug === pageSlug && p.status === 'published');
    console.log('找到的页面:', page);
    
    if (page) {
        // 隐藏工具内容，显示页面内容
        document.querySelector('.tools-section').style.display = 'none';
        
        // 创建页面内容容器
        let pageContentContainer = document.getElementById('page-content-container');
        if (!pageContentContainer) {
            pageContentContainer = document.createElement('div');
            pageContentContainer.id = 'page-content-container';
            pageContentContainer.className = 'page-content';
            document.querySelector('.main-content').appendChild(pageContentContainer);
        }
        
        // 设置页面标题
        document.title = page.title + ' - ' + (data.setting.title || '外贸工具箱');
        
        // 显示页面内容
        pageContentContainer.innerHTML = page.content;
        pageContentContainer.style.display = 'block';
        
        // 滚动到顶部
        window.scrollTo(0, 0);
    } else {
        console.log('未找到页面:', pageSlug);
    }
}

// 隐藏页面内容，显示工具内容
function hidePageContent() {
    const pageContentContainer = document.getElementById('page-content-container');
    if (pageContentContainer) {
        pageContentContainer.style.display = 'none';
    }
    
    // 显示工具内容
    document.querySelector('.tools-section').style.display = 'block';
    
    // 重置页面标题
    const data = JSON.parse(localStorage.getItem('toolsData') || '{}');
    document.title = data.setting.title || '外贸工具箱';
}

// 检查并更新旧数据结构
function checkAndUpdateOldData() {
    const storedData = localStorage.getItem('toolsData');
    if (storedData) {
        const data = JSON.parse(storedData);
        // 如果数据中包含home或footer但没有setting，说明是旧数据结构
        if ((data.home || data.footer) && !data.setting) {
            console.log('发现旧数据结构，更新为新结构');
            const newData = {
                categories: data.categories || [],
                tools: data.tools || [],
                ads: data.ads || [],
                setting: {
                    title: data.home?.title || '',
                    subtitle: data.home?.subtitle || '',
                    description: data.home?.description || '',
                    keywords: data.home?.keywords || '',
                    theme: data.home?.theme || 'light',
                    layout: data.home?.layout || 'normal',
                    logo: data.home?.logo || '',
                    customTheme: data.home?.customTheme || '',
                    links: data.footer?.links || '',
                    copyright: data.footer?.copyright || '',
                    statement: data.footer?.statement || ''
                },
                users: data.users || [],
                pages: data.pages || [],
                analytics: data.analytics || { visitors: [], toolClicks: [] }
            };
            localStorage.setItem('toolsData', JSON.stringify(newData));
        }
    }
}

// 重新加载设置（用于后台保存后刷新前端）
function reloadSettings() {
    console.log('重新加载设置');
    loadData();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    checkAndUpdateOldData();
    loadData();
    initMobileMenu();
    initThemeToggle();
});