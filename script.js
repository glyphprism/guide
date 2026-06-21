document.addEventListener('DOMContentLoaded', () => {
  const charGrid = document.getElementById('character-grid');
  const itemsGrid = document.getElementById('items-grid');
  const mainWrapper = document.getElementById('main-wrapper');
  const charDetailWrapper = document.getElementById('character-detail-wrapper');
  const itemDetailWrapper = document.getElementById('item-detail-wrapper');
  
  const charSection = document.getElementById('character-section');
  const itemsSection = document.getElementById('items-section');
  const tabItems = document.querySelectorAll('.tabs-wrapper .tab-item');

  const searchInput = document.querySelector('.search-input');
  const searchForm = document.querySelector('.search-form');
  const dropdown = document.getElementById('search-results-dropdown');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  let itemOrigin = 'main';
  let activeChar = null;

  mainWrapper.classList.add('fade-in');

  function switchView(hideStage, showStage, callback) {
    hideStage.classList.remove('fade-in');
    hideStage.classList.add('fade-out');
    
    setTimeout(() => {
      hideStage.style.display = 'none';
      hideStage.classList.remove('fade-out');
      
      if (callback) callback();
      
      showStage.style.display = 'block';
      showStage.getBoundingClientRect();
      showStage.classList.add('fade-in');
    }, 250);
  }

  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      if (!targetTab) return;

      tabItems.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (targetTab === 'character') {
        charSection.style.display = 'block';
        itemsSection.style.display = 'none';
      } else if (targetTab === 'items') {
        charSection.style.display = 'none';
        itemsSection.style.display = 'block';
      }
    });
  });

  // Render Grid Awal (Menampilkan Semua Data Tanpa Filter)
  function initGrids() {
    charGrid.innerHTML = '';
    characters.forEach(char => {
      const item = document.createElement('div');
      item.className = 'grid-item';
      item.innerHTML = `
        <img src="${char.foto}" alt="${char.namaList}" class="item-icon">
        <div class="item-name">${char.namaList}</div>
      `;
      item.addEventListener('click', () => {
        switchView(mainWrapper, charDetailWrapper, () => {
          showCharDetail(char);
        });
      });
      charGrid.appendChild(item);
    });

    itemsGrid.innerHTML = '';
    items.forEach(itm => {
      const item = document.createElement('div');
      item.className = 'grid-item';
      item.innerHTML = `
        <img src="${itm.foto}" alt="${itm.nama}" class="item-icon">
        <div class="item-name">${itm.nama}</div>
      `;
      item.addEventListener('click', () => {
        itemOrigin = 'main';
        switchView(mainWrapper, itemDetailWrapper, () => {
          showItemDetail(itm);
        });
      });
      itemsGrid.appendChild(item);
    });
  }

  // Fungsi untuk memproses dan memperbarui isi search index dropdown
  function updateSearchDropdown(keyword) {
    const query = keyword.toLowerCase().trim();
    dropdown.innerHTML = '';

    if (query === '') {
      dropdown.style.display = 'none';
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      if (searchInput) searchInput.style.paddingRight = '20px'; // Buat full saat tidak ada tombol hapus
      return;
    }

    if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
    if (searchInput) searchInput.style.paddingRight = '45px'; // Beri ruang aman saat tombol hapus muncul

    // Filter Karakter
    const matchedChars = characters.filter(char => 
      char.namaList.toLowerCase().includes(query) || 
      char.namaDetail.toLowerCase().includes(query)
    );

    // Filter Items
    const matchedItems = items.filter(itm => 
      itm.nama.toLowerCase().includes(query)
    );

    if (matchedChars.length === 0 && matchedItems.length === 0) {
      dropdown.innerHTML = `<div class="dropdown-item" style="cursor: default; font-weight:600; color:#8c7662; font-size: 12px; justify-content: center; width: 100%; box-sizing: border-box;">Tidak ada hasil ditemukan</div>`;
      dropdown.style.display = 'block';
      return;
    }

    // Tampilkan Hasil Filter Karakter ke Dropdown
    matchedChars.forEach(char => {
      const div = document.createElement('div');
      div.className = 'dropdown-item';
      div.innerHTML = `
        <img src="${char.foto}" alt="${char.namaList}">
        <div class="item-info">
          <span class="item-title">${char.namaList}</span>
          <span class="item-meta">Karakter • ${char.pekerjaan}</span>
        </div>
      `;
      div.addEventListener('click', () => {
        dropdown.style.display = 'none';
        searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        if (searchInput) searchInput.style.paddingRight = '20px'; // Kembali full setelah dibersihkan lewat klik item
        switchView(mainWrapper, charDetailWrapper, () => {
          showCharDetail(char);
        });
      });
      dropdown.appendChild(div);
    });

    // Tampilkan Hasil Filter Items ke Dropdown
    matchedItems.forEach(itm => {
      const div = document.createElement('div');
      div.className = 'dropdown-item';
      div.innerHTML = `
        <img src="${itm.foto}" alt="${itm.nama}">
        <div class="item-info">
          <span class="item-title">${itm.nama}</span>
          <span class="item-meta">Item</span>
        </div>
      `;
      div.addEventListener('click', () => {
        dropdown.style.display = 'none';
        searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        if (searchInput) searchInput.style.paddingRight = '20px'; // Kembali full setelah dibersihkan lewat klik item
        itemOrigin = 'main';
        switchView(mainWrapper, itemDetailWrapper, () => {
          showItemDetail(itm);
        });
      });
      dropdown.appendChild(div);
    });

    dropdown.style.display = 'block';
  }

  // Logika Live Search untuk Dropdown Mengambang
  if (searchInput && dropdown) {
    // Pastikan padding awal diset ke full (20px) jika input pertama kali dimuat dalam keadaan kosong
    if (searchInput.value.trim() === '') {
      searchInput.style.paddingRight = '20px';
    }

    // Event saat pengguna mengetik teks pencarian
    searchInput.addEventListener('input', (e) => {
      updateSearchDropdown(e.target.value);
    });

    // Event saat kolom pencarian diklik/difokuskan kembali (Auto muncul tanpa ngetik ulang)
    searchInput.addEventListener('focus', (e) => {
      if (e.target.value.trim() !== '') {
        updateSearchDropdown(e.target.value);
      }
    });
  }

  // Logika klik pada tombol hapus teks pencarian
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      searchInput.style.paddingRight = '20px'; // Kembali full setelah teks dihapus via tombol silang
      if (dropdown) {
        dropdown.innerHTML = '';
        dropdown.style.display = 'none';
      }
      searchInput.focus();
    });
  }

  // Tutup dropdown jika mengklik di luar area form pencarian
  document.addEventListener('click', (e) => {
    if (searchForm && !searchForm.contains(e.target)) {
      if (dropdown) dropdown.style.display = 'none';
    }
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  // Panggil inisialisasi awal grid
  initGrids();

  function getItemFoto(itemName) {
    const foundItem = items.find(i => i.nama.toLowerCase() === itemName.toLowerCase());
    return foundItem ? foundItem.foto : '';
  }

  function navigateToItemDetail(itemName) {
    const foundItem = items.find(i => i.nama.toLowerCase() === itemName.toLowerCase());
    if (foundItem) {
      itemOrigin = 'char-detail';
      switchView(charDetailWrapper, itemDetailWrapper, () => {
        showItemDetail(foundItem);
      });
    }
  }

  // Fungsi pembantu global untuk generate komponen badge item kesukaan
  function generateBadgeHtml(itemArray, tagClass) {
    return itemArray.map(i => {
      const foto = getItemFoto(i);
      const imgTag = foto ? `<img src="${foto}" alt="${i}" style="width: 18px; height: 18px; object-fit: cover; border-radius: 2px; margin-right: 6px; border: 1px solid #4a3b32; vertical-align: middle;">` : '';
      return `<span class="${tagClass}" data-item="${i}" style="cursor: pointer; display: inline-flex; align-items: center;">${imgTag}${i}<i class="fas fa-angle-right" style="margin-left: 6px;"></i></span>`;
    }).join('');
  }

  function showCharDetail(char) {
    activeChar = char;
    
    charDetailWrapper.innerHTML = `
      <div class="card-container">
        <div class="detail-card">
            <button id="back-char-btn" class="back-btn"><i class="fas fa-arrow-left"></i> Kembali</button>
            <div class="detail-profile">
                <img src="${char.foto}" alt="${char.namaDetail}" class="detail-img">
                <div class="detail-text">
                    <h1>${char.namaDetail}</h1>
                    <div class="info-grid">
                        <div class="info-box"><strong>Pekerjaan</strong> ${char.pekerjaan}</div>
                        <div class="info-box"><strong>Hobi</strong> ${char.hobi}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="detail-card">
            <h3><i class="fas fa-hashtag"></i> Kesukaan & Kencan</h3>
            <p><strong>Barang Spesial:</strong></p>
            <div class="item-list">
              ${generateBadgeHtml(char.barangSpesial, 'tag-item-detail')}
            </div>
            <p><strong>Barang Favorit:</strong></p>
            <div class="item-list">
              ${generateBadgeHtml(char.barangFavorit, 'tag-item-detail')}
            </div>
            <p><strong>Kencan ke-2:</strong></p>
            <div class="item-list">
              ${generateBadgeHtml(char.kencanKedua, 'tag-item-detail')}
            </div>
        </div>

        <div class="detail-card">
            <h3><i class="fas fa-hashtag"></i> Hint Event Hati</h3>
            <ul class="hint-list">
                ${char.hintHati.map(h => `<li>${h}</li>`).join('')}
            </ul>
        </div>
      </div>
    `;

    charDetailWrapper.querySelectorAll('.item-list span').forEach(spanBtn => {
      spanBtn.addEventListener('click', () => {
        const itemName = spanBtn.getAttribute('data-item');
        navigateToItemDetail(itemName);
      });
    });

    document.getElementById('back-char-btn').addEventListener('click', () => {
      switchView(charDetailWrapper, mainWrapper);
    });
  }

  function showItemDetail(itm) {
    itemDetailWrapper.innerHTML = `
      <div class="card-container">
        <div class="detail-card">
            <button id="back-item-btn" class="back-btn"><i class="fas fa-arrow-left"></i> Kembali</button>
            <div class="detail-profile">
                <img src="${itm.foto}" alt="${itm.nama}" class="detail-img">
                <div class="detail-text">
                    <h1>${itm.nama}</h1>
                    <div style="font-size: 13px; font-weight: 500; color: #8c7662; margin-top: 4px;">
                      ${itm.catatan ? itm.catatan : ''}
                    </div>
                </div>
            </div>
        </div>

        <div class="detail-card">
            <h3><i class="fas fa-hashtag"></i> Cara Mendapatkan</h3>
            <ul class="hint-list">
                ${itm.caraMendapatkan.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>
      </div>
    `;

    document.getElementById('back-item-btn').addEventListener('click', () => {
      if (itemOrigin === 'char-detail' && activeChar) {
        switchView(itemDetailWrapper, charDetailWrapper);
      } else {
        switchView(itemDetailWrapper, mainWrapper);
      }
    });
  }
});
