const PRODUCTS_KEY = 'luvra_products';

const getProducts = () => {
  const saved = localStorage.getItem(PRODUCTS_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveProducts = (products) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getAllProducts = async () => {
  return getProducts();
};

export const getProductsByCategory = async (category) => {
  return getProducts().filter(p => p.category === category);
};

export const getFlashSaleProducts = async () => {
  return getProducts().filter(p => p.isFlashSale);
};

export const getProductById = async (id) => {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
};

export const addProduct = async (productData) => {
  const products = getProducts();
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = { id: newId, ...productData, createdAt: new Date().toISOString() };
  products.unshift(newProduct);
  saveProducts(products);
  return newId;
};

export const updateProduct = async (id, productData) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Ürün bulunamadı');
  products[index] = { ...products[index], ...productData };
  saveProducts(products);
};

export const deleteProduct = async (id) => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);
};

export const searchProducts = async (query) => {
  const q = query.toLowerCase();
  return getProducts().filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
};
