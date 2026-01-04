const db = {
  prepare: () => ({
    all: () => [],
    get: () => null,
    run: () => null
  })
};

// BURASI ÇOK ÖNEMLİ: "default" olarak dışarı aktarıyoruz
export default db;