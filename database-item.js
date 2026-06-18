const dbItem = {
    id: "item",
    name: "Item",
    icon: "<img src='https://i.ibb.co.com/fzVJMcVp/IMG-20260618-205925.jpg' alt='ITEM'>",
    tag: "Barang",
    desc: "Database seluruh item, alat, bahan crafting, dan barang bawaan di dunia Citampi Stories.",
    entries: [
        {
            id: "parfum",
            name: "Parfum",
            icon: "🧴",
            image: "https://i.ibb.co.com/fzVJMcVp/IMG-20260618-205925.jpg",
            sub: "Bisa dijual",
            searchTerms: ["parfum","item"],
            detail: {
                banner: { name: "Parfum", role: "Bisa dijual" },
                sections: [{ title: "Informasi Item", rows: [{ label: "Sumber", value: "Toko Pak Tatang" }] }]
            }
        }
    ]
};
