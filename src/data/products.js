export const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: "Premium Keten Blazer Ceket",
    description: "Luvra Exclusive serisinden, astarlı, gold düğmeli ve yüksek kaliteli keten kumaştan üretilmiş blazer ceket. Klasik ve modernin mükemmel uyumu.",
    price: 1899.99,
    rating: 4.8,
    reviewsCount: 324,
    category: "Kadın",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Bej", "Ekru", "Siyah"],
    sizes: ["XS", "S", "M", "L"],
    stock: 12,
    isFlashSale: true,
    discountPrice: 1499.99,
    features: ["%100 Keten Kumaş", "Kuru temizleme önerilir", "İthal gold düğme detayları"]
  },
  {
    id: 2,
    title: "Saten Askılı Zümrüt Yeşili Gece Elbisesi",
    description: "Sırt dekolteli, dökümlü yaka ve yırtmaç detaylı, birinci sınıf ipek saten kumaştan üretilen göz alıcı gece elbisesi.",
    price: 2499.99,
    rating: 4.9,
    reviewsCount: 185,
    category: "Kadın",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Zümrüt Yeşili", "Siyah", "Bordo"],
    sizes: ["34", "36", "38", "40"],
    stock: 5,
    isFlashSale: false,
    features: ["İpek Saten", "Gizli fermuar kapatma", "Ayarlanabilir askı tasarımı"]
  },
  {
    id: 3,
    title: "Oversize Kaşe Yün Kaban",
    description: "Soğuk kış günlerinde şıklığınızdan ödün vermeyin. %80 yün içerikli, kruvaze kapama, modern kesim kaşe kaban.",
    price: 3899.90,
    rating: 4.7,
    reviewsCount: 412,
    category: "Kadın",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Siyah", "Camel", "Gri"],
    sizes: ["S", "M", "L"],
    stock: 8,
    isFlashSale: true,
    discountPrice: 3299.90,
    features: ["%80 Yün, %20 Polyamid", "Oversize kesim", "Çift cepli ve astarlı"]
  },
  {
    id: 4,
    title: "Slim Fit Jakarlı Takım Elbise",
    description: "Özel günleriniz ve iş toplantılarınız için tasarlanmış, İtalyan kesim jakarlı dokuma lüks takım elbise. Ceket ve pantolondan oluşmaktadır.",
    price: 5499.90,
    rating: 4.9,
    reviewsCount: 98,
    category: "Erkek",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Lacivert", "Siyah"],
    sizes: ["48/6", "50/6", "52/6", "54/6"],
    stock: 4,
    isFlashSale: false,
    features: ["Jakarlı dokuma", "Slim fit kalıp", "Yarım astar yapı"]
  },
  {
    id: 5,
    title: "Hakiki Deri Süet Ceket",
    description: "Yumuşak dokulu birinci sınıf hakiki keçi derisinden üretilmiş, çıtçıt kapamalı ve cepli süet ceket.",
    price: 4299.99,
    rating: 4.6,
    reviewsCount: 156,
    category: "Erkek",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Taba", "Kahverengi"],
    sizes: ["M", "L", "XL", "XXL"],
    stock: 6,
    isFlashSale: true,
    discountPrice: 3799.99,
    features: ["%100 Hakiki Deri", "Özel süet temizliği gerektirir", "İç cepli astar"]
  },
  {
    id: 6,
    title: "LUVRA L'Or Intense Extrait de Parfum",
    description: "Luvra'nın ikonikleşen parfümü. Üst notalarda safran ve yasemin, orta notalarda amberwood ve ambergris, alt notalarda ise çam reçinesi ve sedir ağacı yer alır. Kalıcılığı 48 saat etkilidir.",
    price: 3200.00,
    rating: 4.9,
    reviewsCount: 540,
    category: "Parfüm",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Standart"],
    sizes: ["100 ml"],
    stock: 25,
    isFlashSale: false,
    features: ["Extrait de Parfum (En yüksek esans oranı)", "Unisex kullanım", "Özel kadife kutulu ambalaj"]
  },
  {
    id: 7,
    title: "Nuit Sombre Eau de Parfum",
    description: "Gizemli gecelerin kokusu. Kakule, deri ve paçuli notalarının tütsü ile birleşimiyle oluşan maskülen ve çekici bir koku profili.",
    price: 2800.00,
    rating: 4.8,
    reviewsCount: 192,
    category: "Parfüm",
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Standart"],
    sizes: ["100 ml", "50 ml"],
    stock: 14,
    isFlashSale: true,
    discountPrice: 2240.00,
    features: ["Eau de Parfum", "Yoğun kalıcılık", "Baharatlı ve odunsu akorlar"]
  },
  {
    id: 8,
    title: "Altın Parçacıklı Yaşlanma Karşıtı Serum",
    description: "24K saf altın parçacıkları ve kolajen içeren formülü sayesinde cildi sıkılaştırır, ince kırışıklıkları doldurur ve anında ışıltılı bir görünüm sağlar.",
    price: 1250.00,
    rating: 4.7,
    reviewsCount: 304,
    category: "Kozmetik",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Standart"],
    sizes: ["30 ml"],
    stock: 30,
    isFlashSale: false,
    features: ["24 Ayar Altın Parçacıkları", "Hiyalüronik asit desteği", "Tüm cilt tiplerine uygundur"]
  },
  {
    id: 9,
    title: "Altın Kaplama Baget Kesim Yüzük",
    description: "925 ayar gümüş üzerine 18K altın kaplama, kenarları zirkon taşlarla bezenmiş, ortasında büyük baget kesim elmas simülasyonu taş bulunan lüks yüzük.",
    price: 1450.00,
    rating: 4.9,
    reviewsCount: 215,
    category: "Aksesuar",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Gold", "Silver"],
    sizes: ["12", "14", "16", "18"],
    stock: 10,
    isFlashSale: true,
    discountPrice: 1160.00,
    features: ["925 Ayar Gümüş", "18 Ayar Altın Kaplama", "Kararmaya karşı korumalı"]
  },
  {
    id: 10,
    title: "Luvra Monogram Hakiki Deri El Çantası",
    description: "Özel monogram baskılı kanvas ve İtalyan sığır derisi detaylı, el ve omuz askısı olan zarif ve kullanışlı kadın çantası.",
    price: 4800.00,
    rating: 4.8,
    reviewsCount: 88,
    category: "Aksesuar",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Kahve-Monogram", "Siyah-Monogram"],
    sizes: ["Standart"],
    stock: 3,
    isFlashSale: false,
    features: ["Hakiki İtalyan Derisi", "Ayarlanabilir askı", "Özel toz torbalı"]
  },
  {
    id: 11,
    title: "Klasik Kronograf Gold Kol Saati",
    description: "Çelik kordonlu, çizilmez safir camlı, 50 metreye kadar su geçirmezlik özellikli, altın sarısı şık erkek kronograf saat.",
    price: 5999.00,
    rating: 4.9,
    reviewsCount: 142,
    category: "Aksesuar",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Altın Sarısı", "Gümüş-Altın"],
    sizes: ["Standart"],
    stock: 7,
    isFlashSale: false,
    features: ["Safir Kristal Cam", "Japon Kronograf Mekanizma", "Paslanmaz Çelik Kasa"]
  },
  {
    id: 12,
    title: "Soya Aromaterapi Mum Seti (3'lü)",
    description: "Lavanta, Vanilya ve Sedir Ağacı aromalı, %100 doğal soya mumundan el yapımı üretilmiştir. Ahşap fitili sayesinde yanarken şömine çıtırtısı sesi çıkarır.",
    price: 499.90,
    rating: 4.7,
    reviewsCount: 650,
    category: "Ev & Yaşam",
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Standart"],
    sizes: ["3x120gr"],
    stock: 45,
    isFlashSale: true,
    discountPrice: 399.90,
    features: ["%100 Doğal Soya Wax", "Ahşap çıtırdayan fitil", "Ortalama 30 saat yanma süresi"]
  }
];

export const STORIES = [
  { id: "all", name: "Tüm Ürünler", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80" },
  { id: "Kadın", name: "Kadın Giyim", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=150&auto=format&fit=crop&q=80" },
  { id: "Erkek", name: "Erkek Giyim", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=150&auto=format&fit=crop&q=80" },
  { id: "Parfüm", name: "Lüks Parfüm", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=150&auto=format&fit=crop&q=80" },
  { id: "Kozmetik", name: "Cilt Bakımı", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&auto=format&fit=crop&q=80" },
  { id: "Aksesuar", name: "Aksesuar", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=150&auto=format&fit=crop&q=80" },
  { id: "Ev & Yaşam", name: "Ev & Yaşam", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=150&auto=format&fit=crop&q=80" },
  { id: "trend", name: "Trend Ürünler", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=150&auto=format&fit=crop&q=80" }
];

export const TREND_STORY_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
    title: "Premium Keten Blazer",
    subtitle: "Sezonun favorisi",
    productId: 1
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
    title: "Zümrüt Yeşili Gece Elbisesi",
    subtitle: "Lüks saten dokunuş",
    productId: 2
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
    title: "Jakarlı Takım Elbise",
    subtitle: "Şıklığın simgesi",
    productId: 4
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80",
    title: "Hakiki Deri Süet Ceket",
    subtitle: "Zamansız tasarım",
    productId: 5
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1592945997483-b89e3194933f?w=800&auto=format&fit=crop&q=80",
    title: "L'Or Intense Parfüm",
    subtitle: "48 saat kalıcılık",
    productId: 6
  }
];

export const MOCK_REVIEWS = [
  { id: 1, user: "Ayşe K.", rating: 5, date: "12 May 2026", comment: "Kumaşı efsane, yumuşacık ve kalıbı tam oturdu. Luvra kalitesi yine şaşırtmadı. Paketleme de çok özenliydi.", likes: 24 },
  { id: 2, user: "Mehmet T.", rating: 5, date: "02 Jun 2026", comment: "Ürün fotoğraftakinden çok daha lüks duruyor. Hızlı teslimat için teşekkürler, tam bedenimi aldım.", likes: 12 },
  { id: 3, user: "Elif B.", rating: 4, date: "18 May 2026", comment: "Kargo biraz geç geldi ama ürünün kalitesi o kadar güzel ki puan kırmaya kıyamadım. Kesinlikle tavsiye ederim.", likes: 8 },
  { id: 4, user: "Canan Y.", rating: 5, date: "22 May 2026", comment: "Kokusu o kadar kalıcı ki gün boyu herkes ne sıktığımı sordu. Şişenin tasarımı da ayrı bir hava katıyor.", likes: 45 }
];

export const MOCK_ORDERS = [
  {
    id: "LVR-984712",
    customerName: "Selin Yılmaz",
    email: "selin@example.com",
    address: "Karanfil Sok. No:12 D:4, Kadıköy",
    city: "İstanbul",
    items: "1x Premium Keten Blazer Ceket, 1x Altın Kaplama Baget Yüzük",
    amount: 2659.99,
    date: "19.06.2026",
    status: "Başarılı",
    cardMasked: "5412 75** **** 8943",
    cardName: "Selin Yılmaz"
  },
  {
    id: "LVR-304192",
    customerName: "Caner Demir",
    email: "caner@example.com",
    address: "Atatürk Cad. Meriç Apt. No:45, Karşıyaka",
    city: "İzmir",
    items: "1x Slim Fit Jakarlı Takım Elbise",
    amount: 5499.90,
    date: "18.06.2026",
    status: "Başarılı",
    cardMasked: "4355 88** **** 2014",
    cardName: "Caner Demir"
  },
  {
    id: "LVR-109283",
    customerName: "Merve Kaya",
    email: "merve.kaya@example.com",
    address: "Yeşil Mahalle Barış Sok. 3/1, Çankaya",
    city: "Ankara",
    items: "2x Soya Aromaterapi Mum Seti (3'lü)",
    amount: 859.70,
    date: "17.06.2026",
    status: "Başarılı",
    cardMasked: "5520 12** **** 4492",
    cardName: "Merve Kaya"
  }
];

export const MOCK_REFUNDS = [
  {
    id: "RFD-8827",
    orderId: "LVR-109283",
    customerName: "Merve Kaya",
    productTitle: "Soya Aromaterapi Mum Seti (3'lü)",
    amount: 399.90,
    reason: "Ürün kargoda hasar görmüş",
    status: "Beklemede",
    date: "20.06.2026"
  },
  {
    id: "RFD-1294",
    orderId: "LVR-984712",
    customerName: "Selin Yılmaz",
    productTitle: "Altın Kaplama Baget Kesim Yüzük",
    amount: 1160.00,
    reason: "Bedeni parmağıma küçük geldi",
    status: "Beklemede",
    date: "20.06.2026"
  }
];

