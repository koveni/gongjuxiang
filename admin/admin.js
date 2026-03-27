// 登录功能
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        
        try {
            // 使用API接口验证用户凭据
            const response = await fetch('../api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'index.html';
            } else {
                errorMessage.textContent = result.message || '用户名或密码错误';
            }
        } catch (error) {
            console.error('登录验证失败:', error);
            errorMessage.textContent = '登录验证失败，请稍后重试';
        }
    });
}

// 后台管理功能
let logoutBtn;
let addCategoryForm;
let addToolForm;
let addAdForm;
let addUserForm;
let addPageForm;
let toolCategorySelect;
let homeForm;

// 获取DOM元素
function getDOMElements() {
    logoutBtn = document.getElementById('logout-btn');
    addCategoryForm = document.getElementById('add-category-form');
    addToolForm = document.getElementById('add-tool-form');
    addAdForm = document.getElementById('add-ad-form');
    addUserForm = document.getElementById('add-user-form');
    addPageForm = document.getElementById('add-page-form');
    toolCategorySelect = document.getElementById('tool-category');
    homeForm = document.getElementById('home-form');
    console.log('DOM元素获取完成:', { logoutBtn, addCategoryForm, addToolForm, addAdForm, addUserForm, addPageForm, toolCategorySelect, homeForm });
}

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const currentPath = window.location.pathname;
    
    if (!isLoggedIn && currentPath.includes('admin/index.html')) {
        window.location.href = 'login.html';
    } else if (isLoggedIn && currentPath.includes('admin/login.html')) {
        window.location.href = 'index.html';
    }
}

// 退出登录
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    });
}

// 初始化数据
async function initializeData() {
    console.log('初始化数据...');
    return new Promise(async (resolve, reject) => {
        try {
            // 尝试从localStorage获取数据
            const storedData = localStorage.getItem('toolsData');
            if (storedData) {
                console.log('从localStorage加载数据');
                const data = JSON.parse(storedData);
                
                // 检查并更新旧数据结构
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
                    resolve(newData);
                } else {
                    resolve(data);
                }
                return;
            }
            
            // 检查当前目录结构
            console.log('当前页面URL:', window.location.href);
            
            // 尝试从JSON文件加载数据
            console.log('开始从JSON文件加载数据...');
            
            // 首先尝试使用相对路径
            try {
                console.log('尝试使用相对路径加载...');
                const [categoriesResponse, toolsResponse, adsResponse, settingResponse, usersResponse, pagesResponse] = await Promise.all([
                    fetch('../data/categories.json'),
                    fetch('../data/tools.json'),
                    fetch('../data/ads.json'),
                    fetch('../data/setting.json'),
                    fetch('../data/users.json'),
                    fetch('../data/pages.json')
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
                console.log('数据已存储到localStorage');
                
                resolve(data);
            } catch (relativePathError) {
                console.error('使用相对路径加载失败:', relativePathError);
                
                // 尝试使用绝对路径（假设网站在根目录）
                console.log('尝试使用绝对路径加载...');
                const [categoriesResponse, toolsResponse, adsResponse, homeResponse, footerResponse, usersResponse, pagesResponse] = await Promise.all([
                    fetch('data/categories.json'),
                    fetch('data/tools.json'),
                    fetch('data/ads.json'),
                    fetch('data/home.json'),
                    fetch('data/footer.json'),
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
                if (!homeResponse.ok) {
                    throw new Error(`加载home.json失败: ${homeResponse.status}`);
                }
                if (!footerResponse.ok) {
                    throw new Error(`加载footer.json失败: ${footerResponse.status}`);
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
                const homeData = await homeResponse.json();
                const footerData = await footerResponse.json();
                const usersData = await usersResponse.json();
                const pagesData = await pagesResponse.json();
                
                // 合并所有数据
                const data = {
                    categories: categoriesData.categories || [],
                    tools: toolsData.tools || [],
                    ads: adsData.ads || [],
                    home: homeData.home || {},
                    footer: footerData.footer || {},
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
                console.log('数据已存储到localStorage');
                
                resolve(data);
            }
        } catch (error) {
            console.error('初始化数据失败:', error);
            
            // 返回空数据
            const emptyData = {
                categories: [],
                tools: [],
                ads: [],
                home: {},
                footer: {},
                users: [],
                pages: [],
                analytics: {
                    visitors: [],
                    toolClicks: []
                }
            };
            
            console.log('使用空数据:', emptyData);
            localStorage.setItem('toolsData', JSON.stringify(emptyData));
            resolve(emptyData);
        }
    });
}

// 图标上传方式切换
let iconUploadTypeRadios;
let fileUploadGroup;
let urlUploadGroup;

// 设置图标上传方式切换
function setupIconUploadToggle() {
    iconUploadTypeRadios = document.querySelectorAll('input[name="icon-upload-type"]');
    fileUploadGroup = document.getElementById('file-upload-group');
    urlUploadGroup = document.getElementById('url-upload-group');
    
    console.log('图标上传元素:', { iconUploadTypeRadios, fileUploadGroup, urlUploadGroup });
    
    if (iconUploadTypeRadios.length > 0) {
        iconUploadTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'file') {
                    fileUploadGroup.style.display = 'block';
                    urlUploadGroup.style.display = 'none';
                } else {
                    fileUploadGroup.style.display = 'none';
                    urlUploadGroup.style.display = 'block';
                }
            });
        });
    }
    
    // 设置文件上传预览
    const toolIconInput = document.getElementById('tool-icon');
    const iconPreview = document.getElementById('icon-preview');
    const previewImage = document.getElementById('preview-image');
    const clearPreviewBtn = document.getElementById('clear-preview-btn');
    
    if (toolIconInput && iconPreview && previewImage && clearPreviewBtn) {
        toolIconInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // 检查文件大小（最大2MB）
                if (file.size > 2 * 1024 * 1024) {
                    alert('图片大小不能超过2MB');
                    this.value = '';
                    return;
                }
                
                // 显示预览
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    iconPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // URL预览按钮
        const previewUrlBtn = document.getElementById('preview-url-btn');
        const toolIconUrl = document.getElementById('tool-icon-url');
        
        if (previewUrlBtn && toolIconUrl) {
            previewUrlBtn.addEventListener('click', function() {
                const url = toolIconUrl.value.trim();
                if (url) {
                    // 验证URL格式
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                        previewImage.src = url;
                        iconPreview.style.display = 'block';
                    } else {
                        alert('请输入有效的图片URL（以http://或https://开头）');
                    }
                } else {
                    alert('请先输入图片URL');
                }
            });
            
            // 支持按Enter键预览
            toolIconUrl.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    previewUrlBtn.click();
                }
            });
        }
        
        // 清除预览按钮
        clearPreviewBtn.addEventListener('click', function() {
            previewImage.src = '';
            iconPreview.style.display = 'none';
            toolIconInput.value = '';
            toolIconUrl.value = '';
        });
    }
}

// 获取数据
function getData() {
    const storedData = localStorage.getItem('toolsData');
    if (storedData) {
        const data = JSON.parse(storedData);
        // 确保数据结构完整
        if (!data.categories) {
            data.categories = [];
        }
        if (!data.tools) {
            data.tools = [];
        }
        if (!data.ads) {
            data.ads = [];
        }
        if (!data.users) {
            data.users = [];
        }
        if (!data.setting) {
            data.setting = {};
        }
        if (!data.pages) {
            data.pages = [];
        }
        if (!data.analytics) {
            data.analytics = {
                visitors: [],
                toolClicks: []
            };
        }
        return data;
    } else {
        return { 
            categories: [], 
            tools: [],
            ads: [],
            users: [],
            pages: [],
            home: {
                title: '',
                description: '',
                keywords: '',
                logo: ''
            },
            footer: {
                copyright: '',
                contact: '',
                company: '',
                phone: '',
                email: '',
                address: ''
            },
            analytics: {
                visitors: [],
                toolClicks: []
            }
        };
    }
}

// 保存数据
function saveData(data) {
    localStorage.setItem('toolsData', JSON.stringify(data));
}

// 加载分类到下拉框
function loadCategoriesToSelect() {
    if (toolCategorySelect) {
        try {
            const data = getData();
            
            toolCategorySelect.innerHTML = '<option value="">请选择分类</option>';
            if (data.categories && data.categories.length > 0) {
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    toolCategorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('加载分类失败:', error);
        }
    }
}

// 加载网站设置数据
function loadHomeData() {
    const data = getData();
    const setting = data.setting || {};
    
    document.getElementById('home-title').value = setting.title || '';
    document.getElementById('home-subtitle').value = setting.subtitle || '';
    document.getElementById('home-description').value = setting.description || '';
    document.getElementById('home-keywords').value = setting.keywords || '';
    document.getElementById('home-theme').value = setting.theme || 'light';
    document.getElementById('home-layout').value = setting.layout || 'normal';
    
    // 显示/隐藏自定义主题上传区域
    const customThemeUpload = document.getElementById('custom-theme-upload');
    if (customThemeUpload) {
        customThemeUpload.style.display = setting.theme === 'custom' ? 'block' : 'none';
    }
    
    // 更新logo预览
    const logoPreview = document.getElementById('logo-preview');
    if (logoPreview && setting.logo) {
        logoPreview.innerHTML = `<img src="${setting.logo}" style="width: 120px; height: 120px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px;">`;
    }
    
    // 加载页脚数据（从setting中读取）
    document.getElementById('footer-links').value = setting.links || '';
    document.getElementById('footer-copyright').value = setting.copyright || '';
    document.getElementById('footer-statement').value = setting.statement || '';
}

// 主题选择变化事件
function setupThemeChangeEvent() {
    const homeTheme = document.getElementById('home-theme');
    if (homeTheme) {
        homeTheme.addEventListener('change', function() {
            const customThemeUpload = document.getElementById('custom-theme-upload');
            if (customThemeUpload) {
                customThemeUpload.style.display = this.value === 'custom' ? 'block' : 'none';
            }
        });
    }
}

// 设置logo上传预览
function setupLogoPreview() {
    const homeLogo = document.getElementById('home-logo');
    const logoPreview = document.getElementById('logo-preview');
    
    if (homeLogo && logoPreview) {
        homeLogo.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    logoPreview.innerHTML = `<img src="${event.target.result}" style="width: 120px; height: 120px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// 重置分类表单
function resetCategoryForm() {
    addCategoryForm.reset();
    document.getElementById('category-id').value = '';
    const submitBtn = document.querySelector('#add-category-form .submit-btn');
    if (submitBtn) {
        submitBtn.textContent = '添加分类';
    }
}

// 重置工具表单
function resetToolForm() {
    addToolForm.reset();
    document.getElementById('tool-id').value = '';
    const submitBtn = document.querySelector('#add-tool-form .submit-btn');
    if (submitBtn) {
        submitBtn.textContent = '添加工具';
    }
    const iconPreview = document.getElementById('icon-preview');
    if (iconPreview) {
        iconPreview.style.display = 'none';
        document.getElementById('preview-image').src = '';
    }
    // 重置上传方式为文件上传
    document.querySelector('input[name="icon-upload-type"][value="file"]').checked = true;
    document.getElementById('file-upload-group').style.display = 'block';
    document.getElementById('url-upload-group').style.display = 'none';
}

// 渲染分类列表
function renderCategoriesList() {
    console.log('开始渲染分类列表...');
    const categoriesList = document.getElementById('categories-list-content');
    if (!categoriesList) {
        console.error('categories-list-content元素未找到');
        return;
    }
    
    const data = getData();
    console.log('渲染分类列表，数据:', data);
    console.log('分类数据长度:', data.categories ? data.categories.length : 0);
    categoriesList.innerHTML = '';
    
    if (!data.categories || data.categories.length === 0) {
        console.log('分类列表为空');
        categoriesList.innerHTML = '<p style="text-align: center; color: #666;">暂无分类</p>';
        return;
    }
    
    console.log('开始创建分类表格...');
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // 表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left;">ID</th>
            <th style="padding: 12px; text-align: left;">分类名称</th>
            <th style="padding: 12px; text-align: center;">操作</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 表体
    const tbody = document.createElement('tbody');
    data.categories.forEach((category, index) => {
        console.log('渲染分类:', category);
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        
        tr.innerHTML = `
            <td style="padding: 12px;">${category.id}</td>
            <td style="padding: 12px;">${category.name}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="moveCategoryUp(${index})" style="margin-right: 8px; padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; ${index === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">上移</button>
                <button onclick="moveCategoryDown(${index})" style="margin-right: 8px; padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; ${index === data.categories.length - 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">下移</button>
                <button onclick="editCategory(${category.id})" style="margin-right: 8px; padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">编辑</button>
                <button onclick="deleteCategory(${category.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    categoriesList.appendChild(table);
    console.log('分类列表渲染完成');
}

// 加载筛选分类
function loadFilterCategories() {
    console.log('开始加载筛选分类...');
    const filterCategory = document.getElementById('filter-category');
    if (!filterCategory) {
        console.error('filter-category元素未找到');
        return;
    }
    
    const data = getData();
    console.log('筛选分类数据:', data.categories);
    filterCategory.innerHTML = '<option value="">全部分类</option>';
    
    if (data.categories && data.categories.length > 0) {
        data.categories.forEach(category => {
            console.log('添加筛选分类:', category);
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            filterCategory.appendChild(option);
        });
    }
    console.log('筛选分类加载完成');
}

// 渲染工具列表
function renderToolsList(filterCategoryId = null) {
    console.log('开始渲染工具列表...');
    const toolsList = document.getElementById('tools-list-content');
    if (!toolsList) {
        console.error('tools-list-content元素未找到');
        return;
    }
    
    const data = getData();
    console.log('渲染工具列表，数据:', data);
    console.log('工具数据长度:', data.tools ? data.tools.length : 0);
    let filteredTools = data.tools || [];
    
    // 根据分类筛选
    if (filterCategoryId) {
        console.log('根据分类筛选，分类ID:', filterCategoryId);
        filteredTools = filteredTools.filter(tool => tool.category_id == filterCategoryId);
        console.log('筛选后工具数量:', filteredTools.length);
    }
    
    toolsList.innerHTML = '';
    
    if (filteredTools.length === 0) {
        console.log('工具列表为空');
        toolsList.innerHTML = '<p style="text-align: center; color: #666;">暂无工具</p>';
        return;
    }
    
    console.log('开始创建工具表格...');
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // 表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left;">ID</th>
            <th style="padding: 12px; text-align: left;">图标</th>
            <th style="padding: 12px; text-align: left;">工具名称</th>
            <th style="padding: 12px; text-align: left;">所属分类</th>
            <th style="padding: 12px; text-align: center;">操作</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 表体
    const tbody = document.createElement('tbody');
    filteredTools.forEach(tool => {
        console.log('渲染工具:', tool);
        const category = data.categories.find(c => c.id == tool.category_id);
        console.log('工具所属分类:', category);
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        
        const iconHtml = tool.icon ? `<img src="${tool.icon}" style="width: 32px; height: 32px; border-radius: 4px;">` : '无';
        
        tr.innerHTML = `
            <td style="padding: 12px;">${tool.id}</td>
            <td style="padding: 12px;">${iconHtml}</td>
            <td style="padding: 12px;">${tool.name}</td>
            <td style="padding: 12px;">${category ? category.name : '未知分类'}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="editTool(${tool.id})" style="margin-right: 8px; padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">编辑</button>
                <button onclick="deleteTool(${tool.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    toolsList.appendChild(table);
    console.log('工具列表渲染完成');
}

// 编辑分类
function editCategory(categoryId) {
    const data = getData();
    const category = data.categories.find(c => c.id == categoryId);
    
    if (category) {
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-modal-title').textContent = '编辑分类';
        document.querySelector('#add-category-form .submit-btn').textContent = '编辑分类';
        
        // 使用全局的弹窗函数显示弹窗
        if (window.showCategoryModal) {
            window.showCategoryModal();
        } else {
            // 备用方案
            const modalOverlay = document.getElementById('modal-overlay');
            const categoryModal = document.getElementById('category-modal');
            const toolModal = document.getElementById('tool-modal');
            
            if (modalOverlay && categoryModal && toolModal) {
                modalOverlay.style.display = 'flex';
                categoryModal.style.display = 'block';
                toolModal.style.display = 'none';
            }
        }
    }
}

// 删除分类
function deleteCategory(categoryId) {
    if (confirm('确定要删除这个分类吗？删除后该分类下的工具也会被删除。')) {
        const data = getData();
        
        // 删除分类
        data.categories = data.categories.filter(c => c.id != categoryId);
        
        // 删除该分类下的所有工具
        data.tools = data.tools.filter(t => t.category_id != categoryId);
        
        // 重新为剩余分类分配连续的ID
        data.categories.forEach((category, index) => {
            const oldId = category.id;
            category.id = index + 1;
            
            // 更新工具中的分类ID引用
            data.tools.forEach(tool => {
                if (tool.category_id === oldId) {
                    tool.category_id = category.id;
                }
            });
        });
        
        saveData(data);
        updateDashboard();
        
        // 重新加载数据
        loadCategoriesToSelect();
        renderCategoriesList();
        renderToolsList();
    }
}

// 分类上移
function moveCategoryUp(index) {
    if (index === 0) return; // 已经是第一个，不能再上移
    
    const data = getData();
    // 交换位置，保持ID不变
    const temp = data.categories[index];
    data.categories[index] = data.categories[index - 1];
    data.categories[index - 1] = temp;
    
    saveData(data);
    renderCategoriesList();
}

// 分类下移
function moveCategoryDown(index) {
    const data = getData();
    if (index === data.categories.length - 1) return; // 已经是最后一个，不能再下移
    
    // 交换位置，保持ID不变
    const temp = data.categories[index];
    data.categories[index] = data.categories[index + 1];
    data.categories[index + 1] = temp;
    
    saveData(data);
    renderCategoriesList();
}

// 编辑工具
function editTool(toolId) {
    const data = getData();
    const tool = data.tools.find(t => t.id == toolId);
    if (tool) {
        document.getElementById('tool-id').value = tool.id;
        document.getElementById('tool-category').value = tool.category_id;
        document.getElementById('tool-name').value = tool.name;
        document.getElementById('tool-description').value = tool.description;
        document.getElementById('tool-url').value = tool.url;
        document.getElementById('tool-modal-title').textContent = '编辑工具';
        document.querySelector('#add-tool-form .submit-btn').textContent = '编辑工具';
        
        // 显示图标预览
        const iconPreview = document.getElementById('icon-preview');
        if (tool.icon) {
            document.getElementById('preview-image').src = tool.icon;
            iconPreview.style.display = 'block';
            
            // 判断图标是Base64还是URL
            if (tool.icon.startsWith('data:')) {
                // Base64格式，使用文件上传方式
                document.querySelector('input[name="icon-upload-type"][value="file"]').checked = true;
                document.getElementById('file-upload-group').style.display = 'block';
                document.getElementById('url-upload-group').style.display = 'none';
            } else {
                // URL格式，使用超链接上传方式
                document.querySelector('input[name="icon-upload-type"][value="url"]').checked = true;
                document.getElementById('file-upload-group').style.display = 'none';
                document.getElementById('url-upload-group').style.display = 'block';
                document.getElementById('tool-icon-url').value = tool.icon;
            }
        } else {
            iconPreview.style.display = 'none';
            document.getElementById('preview-image').src = '';
            // 默认使用文件上传方式
            document.querySelector('input[name="icon-upload-type"][value="file"]').checked = true;
            document.getElementById('file-upload-group').style.display = 'block';
            document.getElementById('url-upload-group').style.display = 'none';
        }
        
        // 使用全局的弹窗函数显示弹窗
        if (window.showToolModal) {
            window.showToolModal();
        } else {
            // 备用方案
            const modalOverlay = document.getElementById('modal-overlay');
            const categoryModal = document.getElementById('category-modal');
            const toolModal = document.getElementById('tool-modal');
            
            if (modalOverlay && categoryModal && toolModal) {
                modalOverlay.style.display = 'flex';
                toolModal.style.display = 'block';
                categoryModal.style.display = 'none';
            }
        }
    }
}

// 删除工具
function deleteTool(toolId) {
    if (confirm('确定要删除这个工具吗？')) {
        const data = getData();
        data.tools = data.tools.filter(t => t.id != toolId);
        saveData(data);
        updateDashboard();
        renderToolsList();
    }
}

// 图标预览
const toolIconInput = document.getElementById('tool-icon');
if (toolIconInput) {
    toolIconInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const iconPreview = document.getElementById('icon-preview');
                iconPreview.innerHTML = `<img src="${e.target.result}" style="width: 64px; height: 64px; border-radius: 4px;">`;
            };
            reader.readAsDataURL(file);
        } else {
            document.getElementById('icon-preview').innerHTML = '';
        }
    });
}

// 设置弹窗功能
function setupModal() {
    console.log('开始设置弹窗...');
    
    // 确保DOM元素存在
    setTimeout(() => {
        const modalOverlay = document.getElementById('modal-overlay');
        const categoryModal = document.getElementById('category-modal');
        const toolModal = document.getElementById('tool-modal');
        const adModal = document.getElementById('ad-modal');
        const userModal = document.getElementById('user-modal');
        const pageModal = document.getElementById('page-modal');
        
        if (!modalOverlay || !categoryModal || !toolModal || !adModal || !userModal || !pageModal) {
            console.error('弹窗元素未找到');
            return;
        }
        
        console.log('弹窗元素:', { modalOverlay, categoryModal, toolModal, adModal, userModal, pageModal });
        
        // 显示分类弹窗
        function showCategoryModal() {
            console.log('显示分类弹窗');
            modalOverlay.style.display = 'flex';
            categoryModal.style.display = 'block';
            toolModal.style.display = 'none';
            adModal.style.display = 'none';
        }
        
        // 显示工具弹窗
        function showToolModal() {
            console.log('显示工具弹窗');
            modalOverlay.style.display = 'flex';
            toolModal.style.display = 'block';
            categoryModal.style.display = 'none';
            adModal.style.display = 'none';
        }
        
        // 显示广告弹窗
        function showAdModal() {
            console.log('显示广告弹窗');
            modalOverlay.style.display = 'flex';
            adModal.style.display = 'block';
            categoryModal.style.display = 'none';
            toolModal.style.display = 'none';
            userModal.style.display = 'none';
        }
        
        // 显示用户弹窗
        function showUserModal() {
            console.log('显示用户弹窗');
            modalOverlay.style.display = 'flex';
            userModal.style.display = 'block';
            categoryModal.style.display = 'none';
            toolModal.style.display = 'none';
            adModal.style.display = 'none';
            pageModal.style.display = 'none';
        }
        
        // 显示页面弹窗
        function showPageModal() {
            console.log('显示页面弹窗');
            modalOverlay.style.display = 'flex';
            pageModal.style.display = 'block';
            categoryModal.style.display = 'none';
            toolModal.style.display = 'none';
            adModal.style.display = 'none';
            userModal.style.display = 'none';
        }
        
        // 隐藏弹窗
        function hideModal() {
            console.log('隐藏弹窗');
            modalOverlay.style.display = 'none';
            categoryModal.style.display = 'none';
            toolModal.style.display = 'none';
            adModal.style.display = 'none';
            userModal.style.display = 'none';
            pageModal.style.display = 'none';
        }
        
        // 添加分类按钮
        const addCategoryBtn = document.getElementById('add-category-btn');
        console.log('添加分类按钮:', addCategoryBtn);
        
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', function() {
                console.log('点击添加分类按钮');
                resetCategoryForm();
                
                const categoryModalTitle = document.getElementById('category-modal-title');
                console.log('category-modal-title:', categoryModalTitle);
                
                const submitBtn = document.querySelector('#add-category-form .submit-btn');
                console.log('submit-btn:', submitBtn);
                
                if (categoryModalTitle) {
                    categoryModalTitle.textContent = '添加分类';
                }
                
                if (submitBtn) {
                    submitBtn.textContent = '添加分类';
                }
                
                showCategoryModal();
            });
        }
        
        // 添加工具按钮
        const addToolBtn = document.getElementById('add-tool-btn');
        console.log('添加工具按钮:', addToolBtn);
        
        if (addToolBtn) {
            addToolBtn.addEventListener('click', function() {
                console.log('点击添加工具按钮');
                resetToolForm();
                
                const toolModalTitle = document.getElementById('tool-modal-title');
                console.log('tool-modal-title:', toolModalTitle);
                
                const submitBtn = document.querySelector('#add-tool-form .submit-btn');
                console.log('submit-btn:', submitBtn);
                
                if (toolModalTitle) {
                    toolModalTitle.textContent = '添加工具';
                }
                
                if (submitBtn) {
                    submitBtn.textContent = '添加工具';
                }
                
                showToolModal();
            });
        }
        
        // 添加广告按钮
        const addAdBtn = document.getElementById('add-ad-btn');
        console.log('添加广告按钮:', addAdBtn);
        
        if (addAdBtn) {
            addAdBtn.addEventListener('click', function() {
                console.log('点击添加广告按钮');
                resetAdForm();
                
                const adModalTitle = document.getElementById('ad-modal-title');
                console.log('ad-modal-title:', adModalTitle);
                
                const submitBtn = document.querySelector('#add-ad-form .submit-btn');
                console.log('submit-btn:', submitBtn);
                
                if (adModalTitle) {
                    adModalTitle.textContent = '添加广告';
                }
                
                if (submitBtn) {
                    submitBtn.textContent = '添加广告';
                }
                
                showAdModal();
            });
        }
        
        // 添加用户按钮
        const addUserBtn = document.getElementById('add-user-btn');
        console.log('添加用户按钮:', addUserBtn);
        
        if (addUserBtn) {
            addUserBtn.addEventListener('click', function() {
                console.log('点击添加用户按钮');
                resetUserForm();
                
                const userModalTitle = document.getElementById('user-modal-title');
                console.log('user-modal-title:', userModalTitle);
                
                const submitBtn = document.querySelector('#add-user-form .submit-btn');
                console.log('submit-btn:', submitBtn);
                
                if (userModalTitle) {
                    userModalTitle.textContent = '添加用户';
                }
                
                if (submitBtn) {
                    submitBtn.textContent = '添加用户';
                }
                
                showUserModal();
            });
        }
        
        // 添加页面按钮
        const addPageBtn = document.getElementById('add-page-btn');
        console.log('添加页面按钮:', addPageBtn);
        
        if (addPageBtn) {
            addPageBtn.addEventListener('click', function() {
                console.log('点击添加页面按钮');
                resetPageForm();
                
                const pageModalTitle = document.getElementById('page-modal-title');
                console.log('page-modal-title:', pageModalTitle);
                
                const submitBtn = document.querySelector('#add-page-form .submit-btn');
                console.log('submit-btn:', submitBtn);
                
                if (pageModalTitle) {
                    pageModalTitle.textContent = '添加页面';
                }
                
                if (submitBtn) {
                    submitBtn.textContent = '添加页面';
                }
                
                showPageModal();
            });
        }
        
        // 关闭按钮
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', hideModal);
        });
        
        // 点击背景关闭
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
        
        // 将弹窗函数暴露到全局，供编辑按钮使用
        window.showCategoryModal = showCategoryModal;
        window.showToolModal = showToolModal;
        window.showAdModal = showAdModal;
        window.showUserModal = showUserModal;
        window.showPageModal = showPageModal;
        window.hideModal = hideModal;
        
        console.log('弹窗设置完成');
    }, 100);
}

// 导航切换功能
function setupNavigation() {
    console.log('开始设置导航');
    const navButtons = document.querySelectorAll('.admin-sidebar .nav-btn');
    
    console.log('找到导航按钮数量:', navButtons.length);
    
    if (navButtons.length === 0) {
        console.log('未找到导航按钮，可能DOM尚未加载完成');
        return;
    }
    
    navButtons.forEach(button => {
        console.log('为按钮添加点击事件:', button.textContent);
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetSection = this.getAttribute('data-section');
            switchSection(targetSection);
        });
    });
    console.log('导航设置完成');
}

// 直接切换section的函数
function switchSection(targetSection) {
    console.log('切换到section:', targetSection);
    
    // 更新导航按钮状态
    const navButtons = document.querySelectorAll('.admin-sidebar .nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // 找到对应的按钮并添加active类
    const activeButton = document.querySelector(`.nav-btn[data-section="${targetSection}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // 更新内容区域
    const allSections = document.querySelectorAll('.section');
    console.log('找到section数量:', allSections.length);
    
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示目标section
    const targetElement = document.getElementById(targetSection);
    if (targetElement) {
        targetElement.classList.add('active');
        console.log('显示section:', targetSection);
    } else {
        console.log('未找到section:', targetSection);
    }
    
    // 如果切换到分类管理，重新渲染分类列表
    if (targetSection === 'categories-section') {
        console.log('切换到分类管理，重新渲染');
        renderCategoriesList();
    } 
    // 如果切换到工具管理，重新渲染工具列表
    else if (targetSection === 'tools-section') {
        console.log('切换到工具管理，重新渲染');
        renderToolsList();
    }
    // 如果切换到广告管理，重新渲染广告列表
    else if (targetSection === 'ads-section') {
        console.log('切换到广告管理，重新渲染');
        renderAdsList();
    }
    // 如果切换到用户管理，重新渲染用户列表
    else if (targetSection === 'users-section') {
        console.log('切换到用户管理，重新渲染');
        renderUsersList();
    }
    // 如果切换到页面管理，重新渲染页面列表
    else if (targetSection === 'pages-section') {
        console.log('切换到页面管理，重新渲染');
        renderPagesList();
    }
}

// 分类筛选事件
const filterCategory = document.getElementById('filter-category');
if (filterCategory) {
    filterCategory.addEventListener('change', function(e) {
        const categoryId = e.target.value;
        renderToolsList(categoryId ? parseInt(categoryId) : null);
    });
}

// 更新首页数据
function updateDashboard() {
    const data = getData();
    
    // 更新工具总数
    const totalTools = data.tools ? data.tools.length : 0;
    const totalToolsElement = document.getElementById('total-tools');
    if (totalToolsElement) {
        totalToolsElement.textContent = totalTools;
    }
    
    // 更新分类数量
    const totalCategories = data.categories ? data.categories.length : 0;
    const totalCategoriesElement = document.getElementById('total-categories');
    if (totalCategoriesElement) {
        totalCategoriesElement.textContent = totalCategories;
    }
    
    // 更新系统日期和时间
    updateDateTime();
}

// 更新系统日期和时间
function updateDateTime() {
    const now = new Date();
    
    // 更新日期
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        dateElement.textContent = now.toLocaleDateString('zh-CN', options);
    }
    
    // 更新时间
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        timeElement.textContent = now.toLocaleTimeString('zh-CN', options);
    }
}

// 重置广告表单
function resetAdForm() {
    addAdForm.reset();
    document.getElementById('ad-id').value = '';
    const submitBtn = document.querySelector('#add-ad-form .submit-btn');
    if (submitBtn) {
        submitBtn.textContent = '添加广告';
    }
    const adImagePreview = document.getElementById('ad-image-preview');
    if (adImagePreview) {
        adImagePreview.innerHTML = '';
    }
}

// 渲染广告列表
function renderAdsList() {
    const adsList = document.getElementById('ads-list-content');
    if (!adsList) return;
    
    const data = getData();
    adsList.innerHTML = '';
    
    if (data.ads.length === 0) {
        adsList.innerHTML = '<p style="text-align: center; color: #666;">暂无广告</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // 表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left;">ID</th>
            <th style="padding: 12px; text-align: left;">广告名称</th>
            <th style="padding: 12px; text-align: center;">图片</th>
            <th style="padding: 12px; text-align: left;">位置</th>
            <th style="padding: 12px; text-align: center;">状态</th>
            <th style="padding: 12px; text-align: center;">操作</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 表体
    const tbody = document.createElement('tbody');
    data.ads.forEach(ad => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        
        tr.innerHTML = `
            <td style="padding: 12px;">${ad.id}</td>
            <td style="padding: 12px;">${ad.name}</td>
            <td style="padding: 12px; text-align: center;">
                ${ad.image ? `<img src="${ad.image}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">` : '无图片'}
            </td>
            <td style="padding: 12px;">${ad.position}</td>
            <td style="padding: 12px; text-align: center;">
                <span style="padding: 4px 8px; border-radius: 4px; ${ad.status === 'active' ? 'background-color: #d4edda; color: #155724;' : 'background-color: #f8d7da; color: #721c24;'} font-size: 12px;">${ad.status === 'active' ? '启用' : '禁用'}</span>
            </td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="editAd(${ad.id})" style="margin-right: 8px; padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">编辑</button>
                <button onclick="deleteAd(${ad.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    adsList.appendChild(table);
}

// 编辑广告
function editAd(adId) {
    const data = getData();
    const ad = data.ads.find(a => a.id == adId);
    if (ad) {
        document.getElementById('ad-id').value = ad.id;
        document.getElementById('ad-name').value = ad.name;
        document.getElementById('ad-url').value = ad.url;
        document.getElementById('ad-position').value = ad.position;
        document.getElementById('ad-status').value = ad.status;
        document.getElementById('ad-modal-title').textContent = '编辑广告';
        document.querySelector('#add-ad-form .submit-btn').textContent = '编辑广告';
        
        // 显示图片预览
        const adImagePreview = document.getElementById('ad-image-preview');
        if (ad.image) {
            adImagePreview.innerHTML = `<img src="${ad.image}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;">`;
        } else {
            adImagePreview.innerHTML = '';
        }
        
        // 显示广告弹窗
        window.showAdModal();
    }
}

// 删除广告
function deleteAd(adId) {
    if (confirm('确定要删除这个广告吗？')) {
        const data = getData();
        data.ads = data.ads.filter(a => a.id != adId);
        saveData(data);
        renderAdsList();
    }
}

// 重置用户表单
function resetUserForm() {
    addUserForm.reset();
    document.getElementById('user-id').value = '';
    const submitBtn = document.querySelector('#add-user-form .submit-btn');
    if (submitBtn) {
        submitBtn.textContent = '添加用户';
    }
}

// 渲染用户列表
function renderUsersList() {
    const usersList = document.getElementById('users-list-content');
    if (!usersList) return;
    
    const data = getData();
    usersList.innerHTML = '';
    
    if (data.users.length === 0) {
        usersList.innerHTML = '<p style="text-align: center; color: #666;">暂无用户</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // 表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left;">ID</th>
            <th style="padding: 12px; text-align: left;">用户名</th>
            <th style="padding: 12px; text-align: left;">角色</th>
            <th style="padding: 12px; text-align: center;">操作</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 表体
    const tbody = document.createElement('tbody');
    data.users.forEach(user => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        
        tr.innerHTML = `
            <td style="padding: 12px;">${user.id}</td>
            <td style="padding: 12px;">${user.username}</td>
            <td style="padding: 12px;">${user.role === 'admin' ? '管理员' : '编辑'}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="editUser(${user.id})" style="margin-right: 8px; padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">编辑</button>
                <button onclick="deleteUser(${user.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    usersList.appendChild(table);
}

// 编辑用户
function editUser(userId) {
    const data = getData();
    const user = data.users.find(u => u.id == userId);
    if (user) {
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-modal-title').textContent = '编辑用户';
        document.querySelector('#add-user-form .submit-btn').textContent = '编辑用户';
        
        // 显示用户弹窗
        window.showUserModal();
    }
}

// 删除用户
function deleteUser(userId) {
    if (userId == 1) {
        alert('不能删除管理员用户');
        return;
    }
    
    if (confirm('确定要删除这个用户吗？')) {
        const data = getData();
        data.users = data.users.filter(u => u.id != userId);
        saveData(data);
        renderUsersList();
    }
}

// 重置页面表单
function resetPageForm() {
    addPageForm.reset();
    document.getElementById('page-id').value = '';
    const submitBtn = document.querySelector('#add-page-form .submit-btn');
    if (submitBtn) {
        submitBtn.textContent = '添加页面';
    }
}

// 渲染页面列表
function renderPagesList() {
    const pagesList = document.getElementById('pages-list-content');
    if (!pagesList) return;
    
    const data = getData();
    pagesList.innerHTML = '';
    
    if (data.pages.length === 0) {
        pagesList.innerHTML = '<p style="text-align: center; color: #666;">暂无页面</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // 表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left;">ID</th>
            <th style="padding: 12px; text-align: left;">页面标题</th>
            <th style="padding: 12px; text-align: left;">别名</th>
            <th style="padding: 12px; text-align: center;">状态</th>
            <th style="padding: 12px; text-align: center;">操作</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 表体
    const tbody = document.createElement('tbody');
    data.pages.forEach(page => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        
        tr.innerHTML = `
            <td style="padding: 12px;">${page.id}</td>
            <td style="padding: 12px;">${page.title}</td>
            <td style="padding: 12px;">${page.slug || '-'}</td>
            <td style="padding: 12px; text-align: center;">
                <span style="padding: 4px 8px; border-radius: 4px; ${page.status === 'published' ? 'background-color: #d4edda; color: #155724;' : 'background-color: #f8d7da; color: #721c24;'} font-size: 12px;">${page.status === 'published' ? '发布' : '草稿'}</span>
            </td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="editPage(${page.id})" style="margin-right: 8px; padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">编辑</button>
                <button onclick="deletePage(${page.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    pagesList.appendChild(table);
}

// 编辑页面
function editPage(pageId) {
    const data = getData();
    const page = data.pages.find(p => p.id == pageId);
    if (page) {
        document.getElementById('page-id').value = page.id;
        document.getElementById('page-title').value = page.title;
        document.getElementById('page-slug').value = page.slug;
        document.getElementById('page-content').value = page.content;
        document.getElementById('page-status').value = page.status;
        document.getElementById('page-modal-title').textContent = '编辑页面';
        document.querySelector('#add-page-form .submit-btn').textContent = '编辑页面';
        
        // 显示页面弹窗
        window.showPageModal();
    }
}

// 删除页面
function deletePage(pageId) {
    if (confirm('确定要删除这个页面吗？')) {
        const data = getData();
        data.pages = data.pages.filter(p => p.id != pageId);
        saveData(data);
        renderPagesList();
    }
}

// 保存设置到API
async function saveSettingToApi(settingData) {
    try {
        const response = await fetch('../api/setting', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ setting: settingData })
        });
        
        const result = await response.json();
        
        if (result.message) {
            // 显示成功消息
            const successMessage = document.getElementById('home-success');
            if (successMessage) {
                successMessage.innerHTML = '设置保存成功！<br><button onclick="refreshFrontendPage()" style="margin-top: 10px; padding: 5px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">刷新前端页面</button>';
                successMessage.style.display = 'block';
                
                // 5秒后隐藏成功消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
        } else {
            // 显示错误消息
            const successMessage = document.getElementById('home-success');
            if (successMessage) {
                successMessage.textContent = '设置保存失败，请稍后重试';
                successMessage.style.display = 'block';
                
                // 5秒后隐藏错误消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
        }
    } catch (error) {
        console.error('保存设置失败:', error);
        const successMessage = document.getElementById('home-success');
        if (successMessage) {
            successMessage.textContent = '设置保存失败，请稍后重试';
            successMessage.style.display = 'block';
            
            // 5秒后隐藏错误消息
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }
    }
}

// 保存工具到API
async function saveToolToApi(toolData) {
    try {
        const response = await fetch('../api/tools', {
            method: toolData.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toolData)
        });
        
        const result = await response.json();
        
        if (result.message) {
            // 显示成功消息
            const successMessage = document.getElementById('tool-success');
            if (successMessage) {
                successMessage.textContent = '工具保存成功！';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏成功消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
            
            // 重新渲染工具列表
            renderToolsList();
            updateDashboard();
        } else {
            // 显示错误消息
            const successMessage = document.getElementById('tool-success');
            if (successMessage) {
                successMessage.textContent = '工具保存失败，请稍后重试';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏错误消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
        }
    } catch (error) {
        console.error('保存工具失败:', error);
        const successMessage = document.getElementById('tool-success');
        if (successMessage) {
            successMessage.textContent = '工具保存失败，请稍后重试';
            successMessage.style.display = 'block';
            
            // 3秒后隐藏错误消息
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }
}

// 保存分类到API
async function saveCategoryToApi(categoryData) {
    try {
        const response = await fetch('../api/categories', {
            method: categoryData.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });
        
        const result = await response.json();
        
        if (result.message) {
            // 显示成功消息
            const successMessage = document.getElementById('category-success');
            if (successMessage) {
                successMessage.textContent = '分类保存成功！';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏成功消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
            
            // 重新渲染分类列表
            renderCategoriesList();
            loadCategoriesToSelect();
            loadFilterCategories();
        } else {
            // 显示错误消息
            const successMessage = document.getElementById('category-success');
            if (successMessage) {
                successMessage.textContent = '分类保存失败，请稍后重试';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏错误消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
        }
    } catch (error) {
        console.error('保存分类失败:', error);
        const successMessage = document.getElementById('category-success');
        if (successMessage) {
            successMessage.textContent = '分类保存失败，请稍后重试';
            successMessage.style.display = 'block';
            
            // 3秒后隐藏错误消息
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }
}

// 保存广告到API
async function saveAdToApi(adData) {
    try {
        const response = await fetch('../api/ads', {
            method: adData.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adData)
        });
        
        const result = await response.json();
        
        if (result.message) {
            // 显示成功消息
            const successMessage = document.getElementById('ad-success');
            if (successMessage) {
                successMessage.textContent = '广告保存成功！';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏成功消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
            
            // 重新渲染广告列表
            renderAdsList();
        } else {
            // 显示错误消息
            const successMessage = document.getElementById('ad-success');
            if (successMessage) {
                successMessage.textContent = '广告保存失败，请稍后重试';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏错误消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
        }
    } catch (error) {
        console.error('保存广告失败:', error);
        const successMessage = document.getElementById('ad-success');
        if (successMessage) {
            successMessage.textContent = '广告保存失败，请稍后重试';
            successMessage.style.display = 'block';
            
            // 3秒后隐藏错误消息
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }
}

// 保存用户到API
async function saveUserToApi(userData) {
    try {
        const response = await fetch('../api/users', {
            method: userData.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.message) {
            // 显示成功消息
            const successMessage = document.getElementById('user-success');
            if (successMessage) {
                successMessage.textContent = '用户保存成功！';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏成功消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
            
            // 重新渲染用户列表
            renderUsersList();
        } else {
            // 显示错误消息
            const successMessage = document.getElementById('user-success');
            if (successMessage) {
                successMessage.textContent = '用户保存失败，请稍后重试';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏错误消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
        }
    } catch (error) {
        console.error('保存用户失败:', error);
        const successMessage = document.getElementById('user-success');
        if (successMessage) {
            successMessage.textContent = '用户保存失败，请稍后重试';
            successMessage.style.display = 'block';
            
            // 3秒后隐藏错误消息
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }
}

// 保存页面到API
async function savePageToApi(pageData) {
    try {
        const response = await fetch('../api/pages', {
            method: pageData.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pageData)
        });
        
        const result = await response.json();
        
        if (result.message) {
            // 显示成功消息
            const successMessage = document.getElementById('page-success');
            if (successMessage) {
                successMessage.textContent = '页面保存成功！';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏成功消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
            
            // 重新渲染页面列表
            renderPagesList();
        } else {
            // 显示错误消息
            const successMessage = document.getElementById('page-success');
            if (successMessage) {
                successMessage.textContent = '页面保存失败，请稍后重试';
                successMessage.style.display = 'block';
                
                // 3秒后隐藏错误消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
        }
    } catch (error) {
        console.error('保存页面失败:', error);
        const successMessage = document.getElementById('page-success');
        if (successMessage) {
            successMessage.textContent = '页面保存失败，请稍后重试';
            successMessage.style.display = 'block';
            
            // 3秒后隐藏错误消息
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }
}

// 设置表单提交事件
function setupFormSubmissions() {
    // 网站设置表单
    const homeForm = document.getElementById('home-form');
    if (homeForm) {
        homeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('提交网站设置表单');
            
            const data = getData();
            const homeTitle = document.getElementById('home-title').value;
            const homeDescription = document.getElementById('home-description').value;
            const homeKeywords = document.getElementById('home-keywords').value;
            const homeSubtitle = document.getElementById('home-subtitle').value;
            const homeTheme = document.getElementById('home-theme').value;
            const homeLayout = document.getElementById('home-layout').value;
            const homeCustomTheme = document.getElementById('home-custom-theme');
            const homeLogo = document.getElementById('home-logo');
            
            // 获取页脚设置
            const footerLinks = document.getElementById('footer-links').value;
            const footerCopyright = document.getElementById('footer-copyright').value;
            const footerStatement = document.getElementById('footer-statement').value;
            
            // 处理logo上传
            if (homeLogo.files && homeLogo.files[0]) {
                // 使用FormData上传文件
                const formData = new FormData();
                formData.append('image', homeLogo.files[0]);
                
                fetch('../api/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        const settingData = {
                            title: homeTitle,
                            subtitle: homeSubtitle,
                            description: homeDescription,
                            keywords: homeKeywords,
                            theme: homeTheme,
                            layout: homeLayout,
                            logo: result.imageUrl,
                            links: footerLinks,
                            copyright: footerCopyright,
                            statement: footerStatement
                        };
                        
                        // 处理自定义主题上传
                        if (homeCustomTheme.files && homeCustomTheme.files[0]) {
                            const themeReader = new FileReader();
                            themeReader.onload = function(themeE) {
                                settingData.customTheme = themeE.target.result;
                                saveSettingToApi(settingData);
                            };
                            themeReader.readAsText(homeCustomTheme.files[0]);
                        } else {
                            saveSettingToApi(settingData);
                        }
                    } else {
                        alert('图片上传失败，请稍后重试');
                    }
                })
                .catch(error => {
                    console.error('上传图片失败:', error);
                    alert('图片上传失败，请稍后重试');
                });
            } else {
                // 没有上传新logo，使用现有logo
                const settingData = {
                    title: homeTitle,
                    subtitle: homeSubtitle,
                    description: homeDescription,
                    keywords: homeKeywords,
                    theme: homeTheme,
                    layout: homeLayout,
                    logo: data.setting ? data.setting.logo : '',
                    customTheme: data.setting ? data.setting.customTheme : '',
                    links: footerLinks,
                    copyright: footerCopyright,
                    statement: footerStatement
                };
                
                // 处理自定义主题上传
                if (homeCustomTheme.files && homeCustomTheme.files[0]) {
                    const themeReader = new FileReader();
                    themeReader.onload = function(themeE) {
                        settingData.customTheme = themeE.target.result;
                        saveSettingToApi(settingData);
                    };
                    themeReader.readAsText(homeCustomTheme.files[0]);
                } else {
                    saveSettingToApi(settingData);
                }
            }
        });
    }
    
    // 分类表单
    const addCategoryForm = document.getElementById('add-category-form');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('提交分类表单');
            
            const categoryId = document.getElementById('category-id').value;
            const categoryName = document.getElementById('category-name').value;
            
            const categoryData = {
                id: categoryId ? parseInt(categoryId) : null,
                name: categoryName
            };
            
            saveCategoryToApi(categoryData);
        });
    }
    
    // 工具表单
    const addToolForm = document.getElementById('add-tool-form');
    if (addToolForm) {
        addToolForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('提交工具表单');
            
            const toolId = document.getElementById('tool-id').value;
            const toolCategory = document.getElementById('tool-category').value;
            const toolName = document.getElementById('tool-name').value;
            const toolDescription = document.getElementById('tool-description').value;
            const toolUrl = document.getElementById('tool-url').value;
            const toolIconInput = document.getElementById('tool-icon');
            const toolIconUrl = document.getElementById('tool-icon-url');
            const iconUploadType = document.querySelector('input[name="icon-upload-type"]:checked').value;
            
            // 处理图标上传
            if (iconUploadType === 'file' && toolIconInput.files && toolIconInput.files[0]) {
                // 使用FormData上传文件
                const formData = new FormData();
                formData.append('image', toolIconInput.files[0]);
                
                fetch('../api/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        const toolData = {
                            id: toolId ? parseInt(toolId) : null,
                            category_id: parseInt(toolCategory),
                            name: toolName,
                            description: toolDescription,
                            url: toolUrl,
                            icon: result.imageUrl
                        };
                        
                        saveToolToApi(toolData);
                    } else {
                        alert('图片上传失败，请稍后重试');
                    }
                })
                .catch(error => {
                    console.error('上传图片失败:', error);
                    alert('图片上传失败，请稍后重试');
                });
            } else {
                // 使用URL或现有图标
                const toolData = {
                    id: toolId ? parseInt(toolId) : null,
                    category_id: parseInt(toolCategory),
                    name: toolName,
                    description: toolDescription,
                    url: toolUrl,
                    icon: iconUploadType === 'url' ? toolIconUrl.value : document.getElementById('preview-image').src
                };
                
                saveToolToApi(toolData);
            }
        });
    }
    
    // 广告表单
    const addAdForm = document.getElementById('add-ad-form');
    if (addAdForm) {
        addAdForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('提交广告表单');
            
            const adId = document.getElementById('ad-id').value;
            const adName = document.getElementById('ad-name').value;
            const adUrl = document.getElementById('ad-url').value;
            const adPosition = document.getElementById('ad-position').value;
            const adStatus = document.getElementById('ad-status').value;
            const adImage = document.getElementById('ad-image');
            
            // 处理图片上传
            if (adImage.files && adImage.files[0]) {
                // 使用FormData上传文件
                const formData = new FormData();
                formData.append('image', adImage.files[0]);
                
                fetch('../api/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        const adData = {
                            id: adId ? parseInt(adId) : null,
                            name: adName,
                            url: adUrl,
                            image: result.imageUrl,
                            position: adPosition,
                            status: adStatus
                        };
                        
                        saveAdToApi(adData);
                    } else {
                        alert('图片上传失败，请稍后重试');
                    }
                })
                .catch(error => {
                    console.error('上传图片失败:', error);
                    alert('图片上传失败，请稍后重试');
                });
            } else {
                // 使用现有图片
                const adData = {
                    id: adId ? parseInt(adId) : null,
                    name: adName,
                    url: adUrl,
                    image: document.getElementById('ad-image-preview').querySelector('img')?.src || '',
                    position: adPosition,
                    status: adStatus
                };
                
                saveAdToApi(adData);
            }
        });
    }
    
    // 用户表单
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('提交用户表单');
            
            const userId = document.getElementById('user-id').value;
            const userUsername = document.getElementById('user-username').value;
            const userPassword = document.getElementById('user-password').value;
            const userRole = document.getElementById('user-role').value;
            
            const userData = {
                id: userId ? parseInt(userId) : null,
                username: userUsername,
                password: userPassword,
                role: userRole
            };
            
            saveUserToApi(userData);
        });
    }
    
    // 页面表单
    const addPageForm = document.getElementById('add-page-form');
    if (addPageForm) {
        addPageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('提交页面表单');
            
            const pageId = document.getElementById('page-id').value;
            const pageTitle = document.getElementById('page-title').value;
            const pageSlug = document.getElementById('page-slug').value;
            const pageContent = document.getElementById('page-content').value;
            const pageStatus = document.getElementById('page-status').value;
            
            const pageData = {
                id: pageId ? parseInt(pageId) : null,
                title: pageTitle,
                slug: pageSlug,
                content: pageContent,
                status: pageStatus
            };
            
            savePageToApi(pageData);
        });
    }
}

// 刷新前端页面
function refreshFrontendPage() {
    window.location.href = '../index.html';
}

// 初始化
async function initialize() {
    try {
        console.log('开始初始化...');
        
        // 检查登录状态
        checkLoginStatus();
        
        // 不是登录页面，执行完整初始化
        if (!window.location.pathname.includes('login.html')) {
            console.log('非登录页面，执行完整初始化');
            
            // 获取DOM元素
            getDOMElements();
            
            // 初始化数据
            const data = await initializeData();
            console.log('数据初始化完成:', data);
            
            // 设置导航
            setupNavigation();
            
            // 设置弹窗
            setupModal();
            
            // 加载分类到下拉框
            loadCategoriesToSelect();
            
            // 加载筛选分类
            loadFilterCategories();
            
            // 渲染工具概览
            updateDashboard();
            
            // 渲染分类列表
            renderCategoriesList();
            
            // 渲染工具列表
            renderToolsList();
            
            // 渲染广告列表
            renderAdsList();
            
            // 渲染用户列表
            renderUsersList();
            
            // 渲染页面列表
            renderPagesList();
            
            // 加载网站设置数据
            loadHomeData();
            
            // 设置主题变化事件
            setupThemeChangeEvent();
            
            // 设置logo上传预览
            setupLogoPreview();
            
            // 设置图标上传切换
            setupIconUploadToggle();
            
            // 设置表单提交事件
            setupFormSubmissions();
            
            // 初始化日期时间
            updateDateTime();
            setInterval(updateDateTime, 1000);
            
            // 显示默认section
            switchSection('dashboard-section');
        }
        
        console.log('初始化完成');
    } catch (error) {
        console.error('初始化过程中出错:', error);
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}