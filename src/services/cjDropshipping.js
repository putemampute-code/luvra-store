const cjFetch = async (endpoint, options = {}) => {
  const url = `/api/cj${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'CJ API hatası');
  }

  return data.data;
};

export const searchCJProducts = async (keyword, page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ keyword, pageNum: String(page), pageSize: String(pageSize) });
  return cjFetch(`/product/list?${params.toString()}`);
};

export const getCJProductDetail = async (pid) => {
  return cjFetch(`/product/query?pid=${pid}`);
};

export const getCJCategories = async () => {
  return cjFetch('/product/categories');
};

export const mapCJProductToLocal = (cjProduct) => {
  const price = cjProduct.sellPrice || cjProduct.productPrice || cjProduct.minPrice || cjProduct.maxPrice || 0;
  const convertedPrice = price > 0 ? parseFloat((price * 35).toFixed(2)) : 999.99;

  return {
    id: cjProduct.pid,
    title: cjProduct.productName || 'Ürün',
    description: cjProduct.productDesc || 'CJ Dropshipping ürünü',
    price: convertedPrice,
    rating: 4.8,
    reviewsCount: Math.floor(Math.random() * 200) + 10,
    category: mapCJCategory(cjProduct.categoryName),
    images: cjProduct.productImage ? [cjProduct.productImage] : ['https://via.placeholder.com/600'],
    colors: cjProduct.variantInfo ? cjProduct.variantInfo.map(v => v.color || v.name).filter(Boolean) : ['Standart'],
    sizes: cjProduct.variantInfo ? cjProduct.variantInfo.map(v => v.size || v.specification).filter(Boolean) : ['Standart'],
    stock: cjProduct.productStock || 10,
    isFlashSale: false,
    discountPrice: null,
    features: ['CJ Dropshipping', 'Hızlı Kargo', 'Kalite Garantisi'],
    cjPid: cjProduct.pid
  };
};

const mapCJCategory = (cjCategory) => {
  const categoryMap = {
    'Women Clothing': 'Kadın',
    'Men Clothing': 'Erkek',
    'Bags': 'Aksesuar',
    'Jewelry': 'Aksesuar',
    'Beauty': 'Kozmetik',
    'Home & Garden': 'Ev & Yaşam',
    'Fragrance': 'Parfüm'
  };
  for (const [key, value] of Object.entries(categoryMap)) {
    if (cjCategory?.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return 'Aksesuar';
};
