// ============================================= //
// COMBINE DATABASES
// ============================================= //
const DB = {
    categories: [dbNpc, dbItem]
};

// ============================================= //
// FLATTEN SEARCH INDEX
// ============================================= //
const searchIndex = [];
DB.categories.forEach(cat => {
    cat.entries.forEach(entry => {
        searchIndex.push({
            categoryId: cat.id,
            categoryName: cat.name,
            entryId: entry.id,
            entryName: entry.name,
            entryIcon: entry.icon,
            searchTerms: entry.searchTerms,
            entry: entry,
            category: cat
        });
    });
});

// ============================================= //
// HELPER FUNCTION FOR XSS SANITIZATION
// ============================================= //
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ============================================= //
// RENDER MAIN CARDS
// ============================================= //
function renderMainCards() {
    const grid = document.getElementById('main-cards');
    grid.innerHTML = DB.categories.map(cat => `
        <div class="db-card theme-${cat.id}" onclick="openCategoryPopup('${cat.id}')">
            <div class="card-icon">${cat.icon}</div>
            <div class="card-tag">${escapeHTML(cat.tag)}</div>
            <div class="card-title">${escapeHTML(cat.name)}</div>
            <div class="card-desc">${escapeHTML(cat.desc)}</div>
            <div class="card-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        </div>
    `).join('');
}

// ============================================= //
// POPUP SYSTEM & NAVIGATION HISTORY
// ============================================= //
const overlay = document.getElementById('popup-overlay');
const popupIcon = document.getElementById('popup-icon');
const popupTitle = document.getElementById('popup-title');
const popupSubtitle = document.getElementById('popup-subtitle');
const popupBody = document.getElementById('popup-body');
const popupBox = document.getElementById('popup-box');

// Track popup navigation history
let popupHistory = [];

function openPopup(iconHtml, title, subtitle, bodyHtml, catId) {
    popupIcon.innerHTML = iconHtml;
    popupTitle.textContent = title;
    popupSubtitle.textContent = subtitle;
    popupBody.innerHTML = bodyHtml;
    
    // Reset theme classes
    popupBox.className = "popup-box";
    if (catId) {
        popupBox.classList.add(`theme-${catId}`);
    }
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    popupHistory = []; // Clear history on close
}

function handlePopupBack() {
    if (popupHistory.length > 1) {
        popupHistory.pop(); // Remove current page
        const previousPage = popupHistory.pop(); // Get previous page data
        
        if (previousPage.type === 'category') {
            openCategoryPopup(previousPage.catId, false);
        } else if (previousPage.type === 'detail') {
            openEntryDetail(previousPage.catId, previousPage.entryId, false);
        }
    } else {
        closePopup();
    }
}

document.getElementById('popup-close').onclick = closePopup;
overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

// ============================================= //
// CATEGORY POPUP (list entries)
// ============================================= //
function openCategoryPopup(catId, trackHistory = true) {
    const cat = DB.categories.find(c => c.id === catId);
    if (!cat) return;

    if (trackHistory) {
        const lastPage = popupHistory[popupHistory.length - 1];
        if (!lastPage || !(lastPage.type === 'category' && lastPage.catId === catId)) {
            popupHistory.push({ type: 'category', catId: catId });
        }
    } else {
        popupHistory.push({ type: 'category', catId: catId });
    }

    const listHtml = cat.entries.map(entry => {
        const iconOrImg = entry.image 
            ? `<img src="${entry.image}" alt="${escapeHTML(entry.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` 
            : entry.icon;
        return `
        <div class="list-item" onclick="openEntryDetail('${catId}', '${entry.id}')">
            <div class="list-item-icon">${iconOrImg}</div>
            <div class="list-item-info">
                <div class="list-item-name">${escapeHTML(entry.name)}</div>
                <div class="list-item-sub">${escapeHTML(entry.sub)}</div>
            </div>
            <i class="fa-solid fa-chevron-right list-item-arrow"></i>
        </div>
        `;
    }).join('');

    openPopup(
        cat.icon,
        `Database ${cat.name}`,
        `${cat.entries.length} entri tersedia`,
        listHtml,
        catId
    );
}

// ============================================= //
// ENTRY DETAIL POPUP
// ============================================= //
function openEntryDetail(catId, entryId, trackHistory = true) {
    const cat = DB.categories.find(c => c.id === catId);
    const entry = cat?.entries.find(e => e.id === entryId);
    if (!entry) return;

    if (trackHistory) {
        const lastPage = popupHistory[popupHistory.length - 1];
        if (!lastPage || !(lastPage.type === 'detail' && lastPage.entryId === entryId && lastPage.catId === catId)) {
            popupHistory.push({ type: 'detail', catId: catId, entryId: entryId });
        }
    } else {
        popupHistory.push({ type: 'detail', catId: catId, entryId: entryId });
    }

    const d = entry.detail;
    const sectionsHtml = d.sections.map(sec => {
        let content = '';
        if (sec.type === 'tags') {
            const cls = sec.color === 'heart' ? 'tag heart-tag' : 'tag';
            content = `<div class="tag-list">${sec.tags.map(t => `<span class="${cls}">${escapeHTML(t)}</span>`).join('')}</div>`;
        } else if (sec.type === 'item-tags') {
            const cls = sec.color === 'heart' ? 'tag heart-tag tag-item' : 'tag tag-item';
            const itemCat = DB.categories.find(c => c.id === 'item');
            
            const tagsHtml = sec.items.map(itemId => {
                const itemEntry = itemCat?.entries.find(e => e.id === itemId);
                if (!itemEntry) return '';
                
                const imgHtml = itemEntry.image 
                    ? `<img src="${itemEntry.image}" alt="${escapeHTML(itemEntry.name)}">` 
                    : itemEntry.icon;
                    
                return `<span class="${cls}" onclick="event.stopPropagation(); openEntryDetail('item', '${itemId}')">${imgHtml} ${escapeHTML(itemEntry.name)} <i class="fa-solid fa-chevron-right" style="font-size: 10px; margin-left: 4px; opacity: 0.7;"></i></span>`;
            }).join('');
            
            content = `<div class="tag-list">${tagsHtml}</div>`;
        } else if (sec.type === 'steps') {
            content = `<div class="step-list">${sec.steps.map((s, i) => `
                <div class="step-item">
                    <div class="step-text">${escapeHTML(s)}</div>
                </div>
            `).join('')}</div>`;
        } else if (sec.type === 'quote') {
            content = `<div class="detail-row"><div class="detail-row-value" style="text-align:left;font-style:italic;font-weight:400">${escapeHTML(sec.text)}</div></div>`;
        } else {
            content = sec.rows.map(row => `
                <div class="detail-row">
                    <div class="detail-row-label">${escapeHTML(row.label)}</div>
                    <div class="detail-row-value">${escapeHTML(row.value)}</div>
                </div>
            `).join('');
        }

        return `
            <div class="detail-section">
                <div class="detail-section-title">${escapeHTML(sec.title)}</div>
                ${content}
            </div>
        `;
    }).join('');

    const avatarHtml = entry.image 
        ? `<div class="detail-image-container"><img src="${entry.image}" alt="${escapeHTML(entry.name)}"></div>` 
        : `<div class="detail-avatar">${entry.icon}</div>`;

    const bodyHtml = `
        <button class="back-btn" onclick="handlePopupBack()">
            <i class="fa-solid fa-arrow-left"></i> Kembali
        </button>
        <div class="detail-banner">
            ${avatarHtml}
            <div>
                <div class="detail-name">${escapeHTML(d.banner.name)}</div>
                <div class="detail-role">${escapeHTML(d.banner.role)}</div>
            </div>
        </div>
        ${sectionsHtml}
    `;

    openPopup(
        entry.image ? `<img src="${entry.image}" alt="${escapeHTML(entry.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` : entry.icon,
        entry.name,
        `${cat.name} • Detail`,
        bodyHtml,
        catId
    );

    document.getElementById('popup-box').scrollTop = 0;
}

// ============================================= //
// LIVE SEARCH
// ============================================= //
const searchInput = document.getElementById('live-search');
const searchResults = document.getElementById('search-results');
const clearSearchBtn = document.getElementById('clear-search');

searchInput.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    
    if (this.value.length > 0) {
        clearSearchBtn.style.display = 'block';
        this.classList.add('has-clear-btn');
    } else {
        clearSearchBtn.style.display = 'none';
        this.classList.remove('has-clear-btn');
    }

    if (q.length < 1) {
        searchResults.classList.remove('visible');
        searchResults.innerHTML = '';
        return;
    }

    const matches = searchIndex.filter(item =>
        item.entryName.toLowerCase().includes(q) ||
        item.searchTerms.some(t => t.toLowerCase().includes(q))
    );

    if (matches.length === 0) {
        searchResults.innerHTML = `<div class="no-result">🔍 Tidak ada hasil untuk "<strong>${escapeHTML(this.value)}</strong>"</div>`;
    } else {
        searchResults.innerHTML = matches.map(m => `
            <div class="search-result-item" onclick="handleSearchClick('${m.categoryId}', '${m.entryId}')">
                <div class="result-icon">${m.entry.image ? `<img src="${m.entry.image}" alt="${escapeHTML(m.entryName)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` : m.entryIcon}</div>
                <div>
                    <div class="result-breadcrumb">${escapeHTML(m.categoryName)} • ${escapeHTML(m.entryName)}</div>
                    <div class="result-name">${escapeHTML(m.entryName)}</div>
                </div>
                <i class="fa-solid fa-arrow-right" style="margin-left:auto;color:#a08060;font-size:13px"></i>
            </div>
        `).join('');
    }

    searchResults.classList.add('visible');
});

clearSearchBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchResults.classList.remove('visible');
    searchResults.innerHTML = '';
    this.style.display = 'none';
    searchInput.classList.remove('has-clear-btn');
    searchInput.focus();
});

function handleSearchClick(catId, entryId) {
    searchResults.classList.remove('visible');
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchInput.classList.remove('has-clear-btn');
    // Clear history because it starts a fresh navigation from search bar
    popupHistory = [];
    openEntryDetail(catId, entryId);
}

// Automatically show search results again when the search form is focused/clicked
searchInput.addEventListener('focus', function () {
    if (this.value.length > 0) {
        clearSearchBtn.style.display = 'block';
        this.classList.add('has-clear-btn');
    }
    if (this.value.trim().length >= 1) {
        searchResults.classList.add('visible');
    }
});

// Global listener to close search results when clicking outside
document.addEventListener('click', function (event) {
    const isClickInside = searchInput.contains(event.target) || searchResults.contains(event.target) || clearSearchBtn.contains(event.target);
    if (!isClickInside) {
        searchResults.classList.remove('visible');
    }
});

// ============================================= //
// INIT
// ============================================= //
renderMainCards();
