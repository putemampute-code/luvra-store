import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Sparkles, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Plus, 
  Minus, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Percent
} from 'lucide-react';
import { INITIAL_PRODUCTS, STORIES, TREND_STORY_SLIDES, MOCK_REVIEWS, MOCK_ORDERS, MOCK_REFUNDS } from './data/products';
import { useAuth } from './context/AuthContext';
import { getAllProducts, addProduct as addProductToFirestore, updateProduct as updateProductInFirestore, deleteProduct as deleteProductFromFirestore } from './services/productService';
import { createOrder, getAllOrders } from './services/orderService';
import { initializeIyzicoPayment } from './services/paymentService';
import { searchCJProducts, mapCJProductToLocal } from './services/cjDropshipping';
import './App.css';

const CAMPAIGNS = [
  {
    id: 1,
    tag: "LUVRA EXCLUSIVE",
    title: "Yaz Rüzgarı & İpek Dokunuşlar",
    desc: "Yeni sezon keten blazer ceketler ve saf ipek saten gece elbiselerinde açılışa özel %25 indirim.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
    linkText: "Koleksiyonu Keşfet"
  },
  {
    id: 2,
    tag: "IMPERIAL FRAGRANCE",
    title: "L'Or Intense Extrait de Parfum",
    desc: "Nadir safran, yasemin ve yoğun amberwood notalarıyla harmanlanmış lüksün kokusu şimdi stoklarda.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&auto=format&fit=crop&q=80",
    linkText: "Kokuyu İncele"
  },
  {
    id: 3,
    tag: "ELEGANT LIVING",
    title: "Evinde Saray İhtişamı",
    desc: "El yapımı çıtırdayan ahşap fitilli soya mumları ve jakarlı kadife yatak örtülerinde kaçırılmayacak fırsatlar.",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&auto=format&fit=crop&q=80",
    linkText: "Evi Güzelleştir"
  }
];

function App() {
  const { currentUser, userProfile, login, register, logout, isAdmin } = useAuth();
  
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSort, setSelectedSort] = useState("popular");
  
  const [maxPriceFilter, setMaxPriceFilter] = useState(6000);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavOpen, setIsFavOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ orderId: "", reason: "", description: "" });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [userReturns, setUserReturns] = useState(() => {
    const saved = localStorage.getItem('luvra_returns');
    return saved ? JSON.parse(saved) : [];
  });

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewColor, setQuickViewColor] = useState("");
  const [quickViewSize, setQuickViewSize] = useState("");
  const [quickViewImgIndex, setQuickViewImgIndex] = useState(0);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("form");
  const [checkoutForm, setCheckoutForm] = useState({
    name: "", email: "", address: "", city: "",
    cardName: "", cardNumber: "", cardExpiry: "", cardCvc: ""
  });
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCouponText, setAppliedCouponText] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);

  const [adminMode, setAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState("products");
  
  const [cjSearchQuery, setCjSearchQuery] = useState("");
  const [cjProducts, setCjProducts] = useState([]);
  const [cjLoading, setCjLoading] = useState(false);
  const [cjError, setCjError] = useState("");
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState(MOCK_REFUNDS);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);
  const [isSellerLoginOpen, setIsSellerLoginOpen] = useState(false);
  const [customerLoginForm, setCustomerLoginForm] = useState({
    name: "", email: "", password: "", isRegister: false
  });
  const [sellerLoginForm, setSellerLoginForm] = useState({
    email: "", password: ""
  });
  const [sellerLoginError, setSellerLoginError] = useState("");
  const [customerLoginError, setCustomerLoginError] = useState("");

  const [adminStats, setAdminStats] = useState({
    totalOrders: 0,
    totalIncome: 0
  });
  const [newProductForm, setNewProductForm] = useState({
    title: "", price: "", description: "", category: "Kadın",
    imageUrl: "", stock: 10, colors: "Bej, Siyah", sizes: "S, M, L",
    isFlashSale: false, discountPrice: "", isTrendProduct: false
  });

  const [trendSlides, setTrendSlides] = useState(() => {
    const saved = localStorage.getItem('luvra_trend_slides');
    return saved ? JSON.parse(saved) : TREND_STORY_SLIDES;
  });
  const [editingProductId, setEditingProductId] = useState(null);

  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [activeStorySlide, setActiveStorySlide] = useState(0);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [activeFooterPage, setActiveFooterPage] = useState(null);
  const searchRef = useRef(null);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const savedProducts = localStorage.getItem('luvra_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
        return;
      }
      const firestoreProducts = await getAllProducts();
      if (firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
        localStorage.setItem('luvra_products', JSON.stringify(firestoreProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('luvra_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } catch (error) {
      console.log('Ürün yüklenemedi:', error.message);
      const savedProducts = localStorage.getItem('luvra_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('luvra_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('luvra_products', JSON.stringify(newProducts));
  };

  const loadOrders = async () => {
    try {
      const allOrders = await getAllOrders();
      setOrders(allOrders.length > 0 ? allOrders : MOCK_ORDERS);
    } catch {
      setOrders(MOCK_ORDERS);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (currentUser && isAdmin) {
      loadOrders();
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (currentUser) {
      setCheckoutForm(prev => ({
        ...prev,
        name: currentUser.displayName || currentUser.name || "",
        email: currentUser.email || "",
        cardName: currentUser.displayName || currentUser.name || ""
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const successfulOrders = orders.filter(o => o.status === "Başarılı" || o.status === "hazırlanıyor");
    setAdminStats({
      totalOrders: successfulOrders.length,
      totalIncome: successfulOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
    });
  }, [orders]);

  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    return products.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (adminMode) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % CAMPAIGNS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [adminMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isStoryViewerOpen) return;
    setStoryProgress(0);
    const progressInterval = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          if (activeStorySlide < trendSlides.length - 1) {
            setActiveStorySlide(prev2 => prev2 + 1);
            return 0;
          } else {
            setIsStoryViewerOpen(false);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(progressInterval);
  }, [isStoryViewerOpen, activeStorySlide, trendSlides.length]);

  const handleStoryClick = (direction) => {
    if (direction === 'next') {
      if (activeStorySlide < trendSlides.length - 1) {
        setActiveStorySlide(prev => prev + 1);
        setStoryProgress(0);
      } else {
        setIsStoryViewerOpen(false);
      }
    } else {
      if (activeStorySlide > 0) {
        setActiveStorySlide(prev => prev - 1);
        setStoryProgress(0);
      }
    }
  };

  const addToCart = (product, color = "", size = "") => {
    const chosenColor = color || (product.colors ? product.colors[0] : "Standart");
    const chosenSize = size || (product.sizes ? product.sizes[0] : "Standart");

    const existingIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      item.selectedColor === chosenColor && 
      item.selectedSize === chosenSize
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: 1, selectedColor: chosenColor, selectedSize: chosenSize }]);
    }
    setIsCartOpen(true);
  };

  const updateCartQty = (index, delta) => {
    const updatedCart = [...cart];
    const newQty = updatedCart[index].quantity + delta;
    if (newQty <= 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQty;
    }
    setCart(updatedCart);
  };

  const removeFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewColor(product.colors ? product.colors[0] : "Standart");
    setQuickViewSize(product.sizes ? product.sizes[0] : "Standart");
    setQuickViewImgIndex(0);
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "LUVRA20") {
      setDiscountPercent(20);
      setAppliedCouponText("LUVRA20 (%20 İndirim)");
      setCouponCode("");
    } else {
      alert("Geçersiz Kupon Kodu! Lütfen 'LUVRA20' kodunu deneyin.");
    }
  };

  const getSubtotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.product.isFlashSale && item.product.discountPrice 
        ? item.product.discountPrice 
        : item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  };

  const subtotal = getSubtotal();
  const discountAmount = subtotal * (discountPercent / 100);
  const shippingFee = subtotal > 1500 || subtotal === 0 ? 0 : 59.90;
  const total = subtotal - discountAmount + shippingFee;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const timestamp = Date.now();
      const basketId = 'BASKET-' + timestamp;
      
      const paymentData = {
        price: subtotal,
        paidPrice: total,
        basketId,
        user: {
          id: currentUser?.uid || 'guest-' + timestamp,
          name: checkoutForm.name.split(' ')[0],
          surname: checkoutForm.name.split(' ').slice(1).join(' ') || '',
          email: checkoutForm.email,
          phone: '+905000000000',
          address: checkoutForm.address,
          city: checkoutForm.city
        },
        cardInfo: {
          holderName: checkoutForm.cardName,
          number: checkoutForm.cardNumber.replace(/\s/g, ''),
          expireMonth: checkoutForm.cardExpiry.split('/')[0],
          expireYear: '20' + checkoutForm.cardExpiry.split('/')[1],
          cvc: checkoutForm.cardCvc
        },
        shippingAddress: {
          name: checkoutForm.name,
          address: checkoutForm.address,
          city: checkoutForm.city
        },
        billingAddress: {
          name: checkoutForm.name,
          address: checkoutForm.address,
          city: checkoutForm.city
        },
        items: cart.map(item => ({
          id: item.product.id,
          title: item.product.title,
          category: item.product.category,
          price: item.product.isFlashSale && item.product.discountPrice 
            ? item.product.discountPrice * item.quantity 
            : item.product.price * item.quantity
        }))
      };

      const paymentResult = await initializeIyzicoPayment(paymentData);

      if (paymentResult.status === 'success') {
        const newOrder = {
          userId: currentUser?.uid || 'guest',
          customerName: checkoutForm.name,
          email: checkoutForm.email,
          address: checkoutForm.address,
          city: checkoutForm.city,
          items: cart.map(item => `${item.quantity}x ${item.product.title}`).join(', '),
          amount: total,
          paymentId: paymentResult.paymentId,
          cardMasked: paymentResult.cardMaskedNumber || '****',
          status: 'hazırlanıyor'
        };

        await createOrder(newOrder);
        setCheckoutStep("success");
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setCart([]);
        setDiscountPercent(0);
        setAppliedCouponText("");
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
      alert('Ödeme sırasında bir hata oluştu: ' + error.message);
    }
  };

  const handleAdminFormSubmit = async (e) => {
    e.preventDefault();
    if (!newProductForm.title || !newProductForm.price || !newProductForm.imageUrl) {
      alert("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    const priceNum = parseFloat(newProductForm.price);
    const discountPriceNum = newProductForm.discountPrice ? parseFloat(newProductForm.discountPrice) : null;

    const productData = {
      title: newProductForm.title,
      price: priceNum,
      description: newProductForm.description || `${newProductForm.title} Luvra kalitesiyle sizlerle.`,
      category: newProductForm.category,
      images: [newProductForm.imageUrl],
      stock: parseInt(newProductForm.stock),
      colors: newProductForm.colors.split(",").map(c => c.trim()),
      sizes: newProductForm.sizes.split(",").map(s => s.trim()),
      isFlashSale: newProductForm.isFlashSale,
      discountPrice: discountPriceNum,
      rating: 5.0,
      reviewsCount: 0,
      features: ["Premium Ürün", "Luvra özel koleksiyonu"]
    };

    try {
      if (editingProductId) {
        await updateProductInFirestore(editingProductId, productData);
        saveProducts(products.map(p => p.id === editingProductId ? { ...p, ...productData } : p));
        setEditingProductId(null);
      } else {
        const newId = await addProductToFirestore(productData);
        const finalProduct = { id: newId, ...productData };
        saveProducts([finalProduct, ...products]);

        if (newProductForm.isTrendProduct) {
          const newSlide = {
            id: Date.now(),
            image: newProductForm.imageUrl,
            title: newProductForm.title,
            subtitle: newProductForm.description ? newProductForm.description.substring(0, 40) + '...' : 'Yeni ürün',
            productId: finalProduct.id
          };
          const updatedSlides = [...trendSlides, newSlide];
          setTrendSlides(updatedSlides);
          localStorage.setItem('luvra_trend_slides', JSON.stringify(updatedSlides));
        }
      }

      setNewProductForm({
        title: "", price: "", description: "", category: "Kadın",
        imageUrl: "", stock: 10, colors: "Bej, Siyah", sizes: "S, M, L",
        isFlashSale: false, discountPrice: "", isTrendProduct: false
      });
    } catch (error) {
      console.error('Ürün kaydetme hatası:', error);
      alert('Ürün kaydedilemedi: ' + error.message);
    }
  };

  const handleEditProductClick = (product) => {
    setEditingProductId(product.id);
    setNewProductForm({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      imageUrl: product.images[0],
      stock: product.stock,
      colors: product.colors.join(", "),
      sizes: product.sizes.join(", "),
      isFlashSale: product.isFlashSale,
      discountPrice: product.discountPrice || "",
      isTrendProduct: false
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      try {
        await deleteProductFromFirestore(productId);
        saveProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Ürün silme hatası:', error);
        alert('Ürün silinemedi: ' + error.message);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    if (activeCategory !== "all" && product.category !== activeCategory) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }

    const activePrice = product.isFlashSale && product.discountPrice ? product.discountPrice : product.price;
    if (activePrice > maxPriceFilter) return false;

    if (selectedColors.length > 0) {
      const matchColor = product.colors && product.colors.some(c => selectedColors.includes(c));
      if (!matchColor) return false;
    }

    if (selectedRatings.length > 0) {
      const floorRating = Math.floor(product.rating);
      if (!selectedRatings.includes(floorRating)) return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.isFlashSale && a.discountPrice ? a.discountPrice : a.price;
    const priceB = b.isFlashSale && b.discountPrice ? b.discountPrice : b.price;

    if (selectedSort === "low-to-high") {
      return priceA - priceB;
    } else if (selectedSort === "high-to-low") {
      return priceB - priceA;
    } else if (selectedSort === "rating") {
      return b.rating - a.rating;
    } else {
      return b.reviewsCount - a.reviewsCount;
    }
  });

  const allUniqueColors = Array.from(
    new Set(products.reduce((acc, p) => acc.concat(p.colors || []), []))
  ).filter(color => color !== "Standart");

  const handleCJSearch = async () => {
    if (!cjSearchQuery.trim()) return;
    setCjLoading(true);
    setCjError("");
    try {
      const result = await searchCJProducts(cjSearchQuery);
      console.log('CJ API yaniti:', result);
      if (result && result.list) {
        const mapped = result.list.map(mapCJProductToLocal);
        setCjProducts(mapped);
      } else {
        setCjProducts([]);
        setCjError("Sonuç bulunamadı. Farklı bir arama deneyin.");
      }
    } catch (error) {
      console.error('CJ arama hatası:', error);
      setCjError("CJ API'ye bağlanılamadı. API anahtarınızı kontrol edin.");
      setCjProducts([]);
    } finally {
      setCjLoading(false);
    }
  };

  const handleCJImport = (cjProduct) => {
    const newProduct = {
      ...cjProduct,
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      isFlashSale: false,
      discountPrice: null
    };
    saveProducts([newProduct, ...products]);
    alert(`"${cjProduct.title}" mağazanıza eklendi!`);
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setCustomerLoginError("");

    try {
      if (customerLoginForm.isRegister) {
        if (!customerLoginForm.name) {
          setCustomerLoginError("Lütfen adınızı girin.");
          return;
        }
        await register(customerLoginForm.email, customerLoginForm.password, customerLoginForm.name);
        await logout();
        setCustomerLoginForm({ name: "", email: customerLoginForm.email, password: "", isRegister: false });
        setCustomerLoginError("Kayıt başarılı! Şimdi giriş yapın.");
        return;
      } else {
        await login(customerLoginForm.email, customerLoginForm.password);
      }
      setIsCustomerLoginOpen(false);
      setCustomerLoginForm({ name: "", email: "", password: "", isRegister: false });
    } catch (error) {
      let msg = "Bir hata oluştu.";
      if (error.code === "auth/email-already-in-use") {
        msg = "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Geçersiz e-posta adresi.";
      } else if (error.code === "auth/weak-password") {
        msg = "Şifre çok zayıf. En az 6 karakter olmalı.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        msg = "E-posta veya şifre hatalı.";
      } else {
        msg = error.message || "İşlem başarısız.";
      }
      setCustomerLoginError(msg);
    }
  };

  const handleSellerLogin = async (e) => {
    e.preventDefault();
    if (sellerLoginForm.email === "228490" && sellerLoginForm.password === "228490") {
      setAdminMode(true);
      setIsSellerLoginOpen(false);
      setSellerLoginError("");
      setSellerLoginForm({ email: "", password: "" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSellerLoginError("Kullanıcı adı veya şifre hatalı!");
    }
  };

  return (
    <div className="app-container">
      <div className="admin-toggle-bar">
        {!adminMode ? (
          <>
            <span style={{ fontSize: '12px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentUser ? (
                <>
                  <span style={{ color: '#fff' }}>Merhaba, <b style={{ color: 'var(--text-gold)' }}>{currentUser.displayName || currentUser.name || currentUser.email}</b></span>
                  <span style={{ opacity: 0.3 }}>|</span>
                  <a 
                    href="#" 
                    style={{ color: '#8892b0', textDecoration: 'none', transition: '0.3s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-gold)'}
                    onMouseLeave={(e) => e.target.style.color = '#8892b0'}
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    Çıkış Yap
                  </a>
                </>
              ) : (
                <>
                  <a 
                    href="#" 
                    style={{ color: '#c5c6c7', textDecoration: 'none', fontWeight: 600, transition: '0.3s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-gold)'}
                    onMouseLeave={(e) => e.target.style.color = '#c5c6c7'}
                    onClick={(e) => {
                      e.preventDefault();
                      setCustomerLoginForm(prev => ({ ...prev, isRegister: false }));
                      setIsCustomerLoginOpen(true);
                    }}
                  >
                    Giriş Yap
                  </a>
                  <span style={{ opacity: 0.3 }}>|</span>
                  <a 
                    href="#" 
                    style={{ color: '#c5c6c7', textDecoration: 'none', fontWeight: 600, transition: '0.3s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-gold)'}
                    onMouseLeave={(e) => e.target.style.color = '#c5c6c7'}
                    onClick={(e) => {
                      e.preventDefault();
                      setCustomerLoginForm(prev => ({ ...prev, isRegister: true }));
                      setIsCustomerLoginOpen(true);
                    }}
                  >
                    Üye Ol
                  </a>
                </>
              )}
            </span>
            <button 
              className="admin-toggle-btn"
              onClick={() => setIsSellerLoginOpen(true)}
            >
              <User size={12} /> Satıcı Girişi
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} className="star-icon" />
              LUVRA STORE Satıcı Yönetim Portalı
            </span>
            <button 
              className="admin-toggle-btn"
              style={{ background: 'var(--accent-red)', color: '#fff', borderColor: 'var(--accent-red)' }}
              onClick={() => {
                setAdminMode(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <X size={12} /> Satıcı Oturumunu Kapat
            </button>
          </>
        )}
      </div>

      {!adminMode ? (
        <>
          <header className={`header glass-panel ${isScrolled ? 'scrolled' : ''}`}>
            <a href="#" className="logo" onClick={() => setActiveCategory("all")}>
              LUVRA<span>STORE</span>
            </a>

            <div className="search-container" ref={searchRef}>
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Marka, ürün veya kategori ara..." 
                className="search-bar"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />

              {showSuggestions && searchQuery.trim() && (
                <ul className="suggestions-box">
                  {getSuggestions().length > 0 ? (
                    getSuggestions().map(product => (
                      <li 
                        key={product.id} 
                        className="suggestion-item"
                        onClick={() => {
                          handleQuickView(product);
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                      >
                        <img src={product.images[0]} alt={product.title} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>{product.title}</div>
                          <div style={{ fontSize: '11px', color: '#c5a880' }}>{product.category} | {product.price.toFixed(2)} TL</div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="suggestion-item" style={{ color: '#8892b0', fontSize: '13px' }}>
                      Sonuç bulunamadı.
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="header-actions">
              <button className="header-btn" onClick={() => setIsFavOpen(true)}>
                <Heart size={20} />
                <span>Favorilerim</span>
                {favorites.length > 0 && <span className="badge-count">{favorites.length}</span>}
              </button>

              <button className="header-btn" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={20} />
                <span>Sepetim</span>
                {cart.length > 0 && (
                  <span className="badge-count">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              <button 
                className="header-btn" 
                onClick={() => {
                  if (currentUser) {
                    setIsAccountOpen(true);
                  } else {
                    setCustomerLoginForm(prev => ({ ...prev, isRegister: false }));
                    setIsCustomerLoginOpen(true);
                  }
                }}
              >
                <User size={20} />
                <span>{currentUser ? (currentUser.displayName || currentUser.name || 'Hesabım').split(' ')[0] : 'Hesabım'}</span>
              </button>
            </div>
          </header>

          <main className="main-content">
            <section className="stories-section">
              {STORIES.map(story => (
                <div 
                  key={story.id} 
                  className={`story-circle ${activeCategory === story.id ? 'active' : ''}`}
                  onClick={() => {
                    if (story.id === "trend") {
                      setActiveStorySlide(0);
                      setStoryProgress(0);
                      setIsStoryViewerOpen(true);
                    } else {
                      setActiveCategory(story.id);
                    }
                  }}
                >
                  <div className="story-img-wrapper">
                    <img src={story.image} alt={story.name} />
                  </div>
                  <span className="story-name">{story.name}</span>
                </div>
              ))}
            </section>

            <section className="hero-carousel">
              {CAMPAIGNS.map((slide, index) => (
                <div 
                  key={slide.id} 
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <img src={slide.image} className="carousel-bg" alt={slide.title} />
                  <div className="carousel-overlay"></div>
                  <div className="carousel-content">
                    <span className="carousel-tag">{slide.tag}</span>
                    <h2 className="carousel-title">{slide.title}</h2>
                    <p className="carousel-desc">{slide.desc}</p>
                    <button 
                      className="carousel-btn"
                      onClick={() => {
                        if (slide.id === 1) setActiveCategory("Kadın");
                        if (slide.id === 2) {
                          const p = products.find(p => p.id === 6);
                          if (p) handleQuickView(p);
                        }
                        if (slide.id === 3) setActiveCategory("Ev & Yaşam");
                      }}
                    >
                      {slide.linkText} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                className="carousel-nav-btn prev"
                onClick={() => setCurrentSlide(prev => (prev === 0 ? CAMPAIGNS.length - 1 : prev - 1))}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                className="carousel-nav-btn next"
                onClick={() => setCurrentSlide(prev => (prev + 1) % CAMPAIGNS.length)}
              >
                <ChevronRight size={20} />
              </button>

              <div className="carousel-dots">
                {CAMPAIGNS.map((_, index) => (
                  <div 
                    key={index} 
                    className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  ></div>
                ))}
              </div>
            </section>

            <section className="flash-sales-section">
              <div className="flash-left">
                <div className="flash-title">
                  <Sparkles size={22} className="star-icon" />
                  <span>Günün Flaş Fırsatları</span>
                </div>
                <div className="countdown-timer">
                  <div>
                    <div className="time-box">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="time-label">Saat</div>
                  </div>
                  <div style={{ alignSelf: 'center', fontSize: '20px', fontWeight: 'bold', color: '#ff6f3c' }}>:</div>
                  <div>
                    <div className="time-box">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="time-label">Dakika</div>
                  </div>
                  <div style={{ alignSelf: 'center', fontSize: '20px', fontWeight: 'bold', color: '#ff6f3c' }}>:</div>
                  <div>
                    <div className="time-box">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="time-label">Saniye</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#c5c6c7', opacity: 0.8 }}>
                * Seçili LUVRA ürünlerinde sepette ek <b>%20 indirim</b> kuponu: <b style={{ color: '#c5a880', border: '1px dashed #c5a880', padding: '4px 8px', borderRadius: '4px', marginLeft: '6px' }}>LUVRA20</b>
              </div>
            </section>

            <section className="catalog-container">
              <aside className="sidebar-filters glass-panel">
                <div className="filter-group">
                  <div className="filter-title">
                    <span>Fiyat Aralığı</span>
                  </div>
                  <div className="price-slider-container">
                    <input 
                      type="range" 
                      min="100" 
                      max="6000" 
                      step="50"
                      className="price-slider"
                      value={maxPriceFilter}
                      onChange={(e) => setMaxPriceFilter(parseInt(e.target.value))}
                    />
                    <div className="price-values">
                      <span>0 TL</span>
                      <span>Maks: {maxPriceFilter} TL</span>
                    </div>
                  </div>
                </div>

                <div className="filter-group">
                  <div className="filter-title">
                    <span>Renk Seçenekleri</span>
                  </div>
                  <div className="filter-options">
                    {allUniqueColors.map(color => (
                      <label key={color} className="checkbox-label">
                        <input 
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => {
                            if (selectedColors.includes(color)) {
                              setSelectedColors(selectedColors.filter(c => c !== color));
                            } else {
                              setSelectedColors([...selectedColors, color]);
                            }
                          }}
                        />
                        {color}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <div className="filter-title">
                    <span>Değerlendirme Puanı</span>
                  </div>
                  <div className="filter-options">
                    {[5, 4, 3].map(rating => (
                      <label key={rating} className="checkbox-label">
                        <input 
                          type="checkbox"
                          checked={selectedRatings.includes(rating)}
                          onChange={() => {
                            if (selectedRatings.includes(rating)) {
                              setSelectedRatings(selectedRatings.filter(r => r !== rating));
                            } else {
                              setSelectedRatings([...selectedRatings, rating]);
                            }
                          }}
                        />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {rating} Yıldız ve üzeri
                          <Star size={12} fill="#ffb800" stroke="#ffb800" />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {(maxPriceFilter < 6000 || selectedColors.length > 0 || selectedRatings.length > 0) && (
                  <button 
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: '0.3s'
                    }}
                    onClick={() => {
                      setMaxPriceFilter(6000);
                      setSelectedColors([]);
                      setSelectedRatings([]);
                    }}
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </aside>

              <div>
                <div className="catalog-header">
                  <div className="results-count">
                    <b>{sortedProducts.length}</b> Ürün Listeleniyor
                  </div>
                  <select 
                    className="sort-select"
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                  >
                    <option value="popular">Önerilen (Popülerlik)</option>
                    <option value="low-to-high">En Düşük Fiyat</option>
                    <option value="high-to-low">En Yüksek Fiyat</option>
                    <option value="rating">En Yüksek Puan</option>
                  </select>
                </div>

                {sortedProducts.length > 0 ? (
                  <div className="product-grid">
                    {sortedProducts.map(product => {
                      const isLiked = favorites.includes(product.id);
                      return (
                        <div key={product.id} className="product-card glass-panel glass-panel-hover">
                          <div className="card-img-container">
                            <img src={product.images[0]} alt={product.title} className="card-img" />
                            
                            {product.isFlashSale && (
                              <span className="card-badge">Flaş Ürün</span>
                            )}

                            <button 
                              className={`card-wishlist-btn ${isLiked ? 'active' : ''}`}
                              onClick={() => toggleFavorite(product.id)}
                            >
                              <Heart size={18} fill={isLiked ? "#e74c3c" : "none"} />
                            </button>

                            <div className="card-overlay">
                              <button className="quick-view-btn" onClick={() => handleQuickView(product)}>
                                <Search size={14} /> Hızlı Bakış
                              </button>
                            </div>
                          </div>

                          <div className="card-body">
                            <span className="card-category">{product.category}</span>
                            <h3 className="card-title" title={product.title}>{product.title}</h3>
                            
                            <div className="card-rating">
                              <Star size={13} fill="#ffb800" stroke="#ffb800" />
                              <span style={{ fontWeight: 600 }}>{product.rating}</span>
                              <span style={{ color: '#5e6b7c' }}>({product.reviewsCount})</span>
                            </div>

                            <div className="card-price-row">
                              {product.isFlashSale && product.discountPrice ? (
                                <>
                                  <span className="card-price discounted">{product.discountPrice.toFixed(2)} TL</span>
                                  <span className="card-old-price">{product.price.toFixed(2)} TL</span>
                                </>
                              ) : (
                                <span className="card-price">{product.price.toFixed(2)} TL</span>
                              )}
                            </div>

                            <button 
                              className="add-to-cart-btn"
                              onClick={() => addToCart(product)}
                            >
                              <ShoppingBag size={14} /> Sepete Ekle
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-products glass-panel">
                    <ShieldAlert size={48} style={{ color: '#c5a880', marginBottom: '16px' }} />
                    <h3>Kriterlere uygun ürün bulunamadı.</h3>
                    <p style={{ marginTop: '8px', color: '#5e6b7c' }}>Lütfen filtreleri sıfırlamayı veya aramayı değiştirmeyi deneyin.</p>
                  </div>
                )}
              </div>
            </section>
          </main>

          <footer className="footer">
            <div className="footer-grid">
              <div>
                <a href="#" className="logo" style={{ marginBottom: '20px', display: 'inline-block' }}>
                  LUVRA<span>STORE</span>
                </a>
                <p style={{ fontSize: '13px', color: '#8892b0', lineHeight: 1.6 }}>
                  Luvra Store, kaliteli hizmeti ve lüks tasarımıyla e-ticarette yeni nesil bir alışveriş deneyimi sunar. Trendleri keşfedin, şıklığı sepetinize ekleyin.
                </p>
              </div>
              <div>
                <h4 className="footer-col-title">Kurumsal</h4>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('hakkimizda'); }}>Hakkımızda</a></li>
                  <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('kariyer'); }}>Kariyer</a></li>
                  <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('surdurulebilirlik'); }}>Sürdürülebilirlik</a></li>
                  <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('iletisim'); }}>İletişim</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-col-title">Müşteri Hizmetleri</h4>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('iade'); }}>Kolay İade & Değişim</a></li>
                  <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('sss'); }}>Sıkça Sorulan Sorular</a></li>
                  <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setIsTrackingOpen(true); }}>Kargo Takibi</a></li>
                  <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('guvenli'); }}>Güvenli Alışveriş Rehberi</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-col-title">Kategoriler</h4>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link" onClick={() => setActiveCategory("Kadın")}>Kadın Moda</a></li>
                  <li><a href="#" className="footer-link" onClick={() => setActiveCategory("Erkek")}>Erkek Moda</a></li>
                  <li><a href="#" className="footer-link" onClick={() => setActiveCategory("Parfüm")}>Lüks Parfümler</a></li>
                  <li><a href="#" className="footer-link" onClick={() => setActiveCategory("Aksesuar")}>Özel Aksesuar</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span>&copy; {new Date().getFullYear()} LUVRA STORE. Tüm hakları saklıdır.</span>
              <span style={{ display: 'flex', gap: '15px' }}>
                <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('kvkk'); }}>KVK Aydınlatma Metni</a>
                <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveFooterPage('sozlesme'); }}>Kullanıcı Sözleşmesi</a>
              </span>
            </div>
          </footer>
        </>
      ) : (
        <div className="dashboard-layout">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Yönetim Paneli</h1>
              <p style={{ color: '#8892b0', fontSize: '14px', marginTop: '4px' }}>
                Bu panelden e-ticaret sitenizin ürünlerini, siparişlerini, iadelerini, faturalarını ve müşteri kayıtlarını takip edebilirsiniz.
              </p>
            </div>
            <button 
              className="admin-toggle-btn"
              onClick={() => {
                setEditingProductId(null);
                setNewProductForm({
                  title: "", price: "", description: "", category: "Kadın",
                  imageUrl: "", stock: 10, colors: "Bej, Siyah", sizes: "S, M, L",
                  isFlashSale: false, discountPrice: "", isTrendProduct: false
                });
                setAdminTab("products");
              }}
              style={{ padding: '10px 20px' }}
            >
              <PlusCircle size={16} /> Yeni Ürün Formunu Sıfırla
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid #c5a880' }}>
              <div className="stat-icon-box" style={{ background: 'rgba(197,168,128,0.15)', color: '#c5a880' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <div className="stat-label">Toplam Sipariş</div>
                <div className="stat-value">{adminStats.totalOrders}</div>
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid #2ecc71' }}>
              <div className="stat-icon-box" style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71' }}>
                <Percent size={24} />
              </div>
              <div>
                <div className="stat-label">Toplam Ciro</div>
                <div className="stat-value">{adminStats.totalIncome.toFixed(2)} TL</div>
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid #ff6f3c' }}>
              <div className="stat-icon-box" style={{ background: 'rgba(255,111,60,0.15)', color: '#ff6f3c' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <div className="stat-label">Toplam Aktif Ürün</div>
                <div className="stat-value">{products.length}</div>
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid #e74c3c' }}>
              <div className="stat-icon-box" style={{ background: 'rgba(231,76,60,0.15)', color: '#e74c3c' }}>
                <Heart size={24} />
              </div>
              <div>
                <div className="stat-label">Bekleyen İadeler</div>
                <div className="stat-value">{refunds.filter(r => r.status === "Beklemede").length}</div>
              </div>
            </div>
          </div>

          <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px', flexWrap: 'wrap' }}>
            <button className={`admin-tab-btn ${adminTab === 'products' ? 'active' : ''}`} onClick={() => setAdminTab('products')}>Ürün Yönetimi</button>
            <button className={`admin-tab-btn ${adminTab === 'cjdropshipping' ? 'active' : ''}`} onClick={() => setAdminTab('cjdropshipping')}>CJ Dropshipping</button>
            <button className={`admin-tab-btn ${adminTab === 'payments' ? 'active' : ''}`} onClick={() => setAdminTab('payments')}>Ödeme & Sipariş Kayıtları</button>
            <button className={`admin-tab-btn ${adminTab === 'refunds' ? 'active' : ''}`} onClick={() => setAdminTab('refunds')}>İade Talepleri</button>
            <button className={`admin-tab-btn ${adminTab === 'invoices' ? 'active' : ''}`} onClick={() => setAdminTab('invoices')}>Faturalar</button>
            <button className={`admin-tab-btn ${adminTab === 'customers' ? 'active' : ''}`} onClick={() => setAdminTab('customers')}>Müşteri & Adres Veritabanı</button>
          </div>

          {adminTab === 'products' && (
            <div className="dashboard-content-grid">
              <div className="product-form-card glass-panel">
                <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  {editingProductId ? "Ürünü Güncelle" : "Yeni Ürün Ekle"}
                </h2>
                
                <form onSubmit={handleAdminFormSubmit}>
                  <div className="form-group">
                    <label className="form-label">Ürün Adı *</label>
                    <input type="text" className="form-input" value={newProductForm.title} onChange={(e) => setNewProductForm({...newProductForm, title: e.target.value})} placeholder="Örn: Hakiki Deri Ceket" required />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Fiyat (TL) *</label>
                      <input type="number" step="0.01" className="form-input" value={newProductForm.price} onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})} placeholder="Örn: 2499.90" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kategori *</label>
                      <select className="form-input" value={newProductForm.category} onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}>
                        <option value="Kadın">Kadın</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Parfüm">Parfüm</option>
                        <option value="Kozmetik">Kozmetik</option>
                        <option value="Aksesuar">Aksesuar</option>
                        <option value="Ev & Yaşam">Ev & Yaşam</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ürün Görseli *</label>
                    <div style={{ border: '2px dashed rgba(197,168,128,0.3)', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: '0.3s', background: newProductForm.imageUrl ? 'rgba(197,168,128,0.05)' : 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(197,168,128,0.6)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(197,168,128,0.3)'}
                      onClick={() => document.getElementById('productImageInput').click()}
                    >
                      {newProductForm.imageUrl ? (
                        <div>
                          <img src={newProductForm.imageUrl} alt="Önizleme" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', marginBottom: '10px' }} />
                          <p style={{ fontSize: '12px', color: '#8892b0' }}>Değiştirmek için tıklayın</p>
                        </div>
                      ) : (
                        <div>
                          <Plus size={32} style={{ color: '#c5a880', marginBottom: '8px' }} />
                          <p style={{ fontSize: '13px', color: '#8892b0' }}>Görsel yüklemek için tıklayın</p>
                          <p style={{ fontSize: '11px', color: '#5e6b7c', marginTop: '4px' }}>JPG, PNG veya WEBP (Maks. 5MB)</p>
                        </div>
                      )}
                    </div>
                    <input 
                      id="productImageInput"
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("Dosya boyutu 5MB'dan büyük olamaz!");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewProductForm({...newProductForm, imageUrl: event.target.result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Renkler (Virgülle ayırın)</label>
                      <input type="text" className="form-input" value={newProductForm.colors} onChange={(e) => setNewProductForm({...newProductForm, colors: e.target.value})} placeholder="Bej, Siyah, Kırmızı" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bedenler (Virgülle ayırın)</label>
                      <input type="text" className="form-input" value={newProductForm.sizes} onChange={(e) => setNewProductForm({...newProductForm, sizes: e.target.value})} placeholder="S, M, L, XL" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Açıklama</label>
                    <textarea className="form-input" style={{ height: '80px', resize: 'vertical' }} value={newProductForm.description} onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})} placeholder="Ürün detayları ve kumaş özellikleri..." />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '20px 0' }}>
                    <input type="checkbox" id="isFlashSale" checked={newProductForm.isFlashSale} onChange={(e) => setNewProductForm({...newProductForm, isFlashSale: e.target.checked})} style={{ accentColor: '#ff6f3c' }} />
                    <label htmlFor="isFlashSale" className="checkbox-label" style={{ fontSize: '13px' }}>Flaş İndirimli Ürün (Kampanya)</label>
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0' }}>
                    <input type="checkbox" id="isTrendProduct" checked={newProductForm.isTrendProduct} onChange={(e) => setNewProductForm({...newProductForm, isTrendProduct: e.target.checked})} style={{ accentColor: '#c5a880' }} />
                    <label htmlFor="isTrendProduct" className="checkbox-label" style={{ fontSize: '13px' }}>Trend Ürünler'e ekle (Hikaye)</label>
                  </div>

                  {newProductForm.isFlashSale && (
                    <div className="form-group">
                      <label className="form-label">İndirimli Kampanya Fiyatı (TL)</label>
                      <input type="number" step="0.01" className="form-input" value={newProductForm.discountPrice} onChange={(e) => setNewProductForm({...newProductForm, discountPrice: e.target.value})} placeholder="Örn: 1999.90" />
                    </div>
                  )}

                  <button type="submit" className="checkout-btn" style={{ background: '#c5a880', color: '#0b0c10' }}>
                    {editingProductId ? "Ürünü Kaydet" : "Ürünü Sisteme Ekle"}
                  </button>
                </form>
              </div>

              <div className="admin-products-table-card glass-panel" style={{ overflowX: 'auto' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  Aktif Ürün Envanteri ({products.length} Ürün)
                </h2>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Görsel</th>
                      <th>Ürün Adı</th>
                      <th>Kategori</th>
                      <th>Fiyat</th>
                      <th>Stok</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.images[0]} alt="" style={{ width: '36px', height: '44px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{p.title}</td>
                        <td>{p.category}</td>
                        <td>
                          {p.isFlashSale && p.discountPrice ? (
                            <span>
                              <span style={{ color: '#ff6f3c' }}>{p.discountPrice.toFixed(2)} TL</span>
                              <span style={{ textDecoration: 'line-through', opacity: 0.4, fontSize: '10px', marginLeft: '6px' }}>{p.price.toFixed(2)} TL</span>
                            </span>
                          ) : (
                            <span>{p.price.toFixed(2)} TL</span>
                          )}
                        </td>
                        <td>{p.stock} adet</td>
                        <td>
                          <button className="admin-action-btn edit" title="Düzenle" onClick={() => handleEditProductClick(p)}>
                            <Edit3 size={15} />
                          </button>
                          <button className="admin-action-btn delete" title="Sil" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'cjdropshipping' && (
            <div>
              <div className="glass-panel" style={{ padding: '25px', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={20} style={{ color: '#c5a880' }} />
                  CJ Dropshipping Ürün Keşfet
                </h2>
                <p style={{ fontSize: '13px', color: '#8892b0', marginBottom: '20px' }}>
                  CJ Dropshipping üzerinden ürün arayın ve mağazanıza tek tıkla ekleyin.
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1 }}
                    value={cjSearchQuery}
                    onChange={(e) => setCjSearchQuery(e.target.value)}
                    placeholder="Ürün ara... (ör: kadın elbise, deri çanta, parfüm)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && cjSearchQuery.trim()) {
                        handleCJSearch();
                      }
                    }}
                  />
                  <button 
                    className="checkout-btn" 
                    style={{ padding: '10px 25px', whiteSpace: 'nowrap' }}
                    onClick={handleCJSearch}
                    disabled={cjLoading}
                  >
                    {cjLoading ? 'Aranıyor...' : <><Search size={16} /> Ara</>}
                  </button>
                </div>

                {cjError && (
                  <div style={{ padding: '12px', background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', color: '#e74c3c', fontSize: '13px', marginBottom: '15px' }}>
                    {cjError}
                  </div>
                )}
              </div>

              {cjProducts.length > 0 && (
                <div className="glass-panel" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#fff' }}>
                    {cjProducts.length} ürün bulundu
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {cjProducts.map((product, index) => (
                      <div key={index} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', transition: '0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(197,168,128,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        <div style={{ padding: '15px' }}>
                          <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.title}
                          </h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#c5a880' }}>
                              {product.price.toFixed(2)} TL
                            </span>
                            <span style={{ fontSize: '11px', color: '#5e6b7c', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                              {product.category}
                            </span>
                          </div>
                          <button 
                            className="add-to-cart-btn"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => handleCJImport(product)}
                          >
                            <Plus size={14} /> Mağazaya Ekle
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cjProducts.length === 0 && !cjLoading && !cjError && (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Sparkles size={48} style={{ color: '#c5a880', opacity: 0.5, marginBottom: '15px' }} />
                  <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>CJ Dropshipping Ürünleri</h3>
                  <p style={{ color: '#8892b0', fontSize: '13px' }}>Yukarıdaki arama kutusuna ürün adı yazarak binlerce ürüne erişin.</p>
                </div>
              )}
            </div>
          )}

          {adminTab === 'payments' && (
            <div className="admin-products-table-card glass-panel" style={{ overflowX: 'auto' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                Ödeme ve Sipariş Kayıtları
              </h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sipariş ID</th>
                    <th>Müşteri</th>
                    <th>Satın Alınan Ürünler</th>
                    <th>Tarih</th>
                    <th>Kart Bilgisi</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: '#c5a880' }}>{order.id}</td>
                      <td style={{ color: '#fff', fontWeight: 500 }}>{order.customerName}</td>
                      <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.items}>{order.items}</td>
                      <td>{order.date || new Date(order.createdAt?.seconds * 1000).toLocaleDateString('tr-TR')}</td>
                      <td style={{ fontFamily: 'monospace' }}>{order.cardMasked}</td>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{order.amount?.toFixed(2)} TL</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, 
                          background: order.status === 'Başarılı' || order.status === 'hazırlanıyor' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: order.status === 'Başarılı' || order.status === 'hazırlanıyor' ? '#2ecc71' : '#e74c3c'
                        }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminTab === 'refunds' && (
            <div className="admin-products-table-card glass-panel" style={{ overflowX: 'auto' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                İade Talepleri Yönetimi
              </h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>İade ID</th>
                    <th>Sipariş ID</th>
                    <th>Müşteri</th>
                    <th>Ürün</th>
                    <th>Neden</th>
                    <th>İade Tutarı</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map(ref => (
                    <tr key={ref.id}>
                      <td style={{ fontWeight: 700, color: '#ff6f3c' }}>{ref.id}</td>
                      <td style={{ fontWeight: 700, color: '#c5a880' }}>{ref.orderId}</td>
                      <td style={{ color: '#fff' }}>{ref.customerName}</td>
                      <td>{ref.productTitle}</td>
                      <td style={{ color: '#8892b0', fontSize: '12px' }}>{ref.reason}</td>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{ref.amount.toFixed(2)} TL</td>
                      <td>{ref.date}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, 
                          background: ref.status === 'Onaylandı' ? 'rgba(46, 204, 113, 0.15)' : ref.status === 'Reddedildi' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(197, 168, 128, 0.15)',
                          color: ref.status === 'Onaylandı' ? '#2ecc71' : ref.status === 'Reddedildi' ? '#e74c3c' : '#c5a880'
                        }}>
                          {ref.status}
                        </span>
                      </td>
                      <td>
                        {ref.status === 'Beklemede' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              style={{ padding: '4px 8px', background: '#2ecc71', color: '#0b0c10', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                              onClick={() => {
                                setRefunds(refunds.map(r => r.id === ref.id ? { ...r, status: 'Onaylandı' } : r));
                                setOrders(orders.map(o => o.id === ref.orderId ? { ...o, status: 'İade Edildi' } : o));
                                alert("İade talebi onaylandı.");
                              }}
                            >Onayla</button>
                            <button 
                              style={{ padding: '4px 8px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                              onClick={() => {
                                setRefunds(refunds.map(r => r.id === ref.id ? { ...r, status: 'Reddedildi' } : r));
                                alert("İade talebi reddedildi.");
                              }}
                            >Reddet</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#5e6b7c' }}>İşlem yapıldı</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminTab === 'invoices' && (
            <div className="admin-products-table-card glass-panel" style={{ overflowX: 'auto' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                Fatura Kayıt Arşivi
              </h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fatura No</th>
                    <th>İlişkili Sipariş No</th>
                    <th>Müşteri Adı</th>
                    <th>Tarih</th>
                    <th>Vergi Oranı</th>
                    <th>Toplam Tutar</th>
                    <th>Fatura Durumu</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: '#fff' }}>INV-{order.id?.replace('LVR-', '')}</td>
                      <td style={{ fontWeight: 600, color: '#c5a880' }}>{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.date || new Date(order.createdAt?.seconds * 1000).toLocaleDateString('tr-TR')}</td>
                      <td>%20 Dahil</td>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{order.amount?.toFixed(2)} TL</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, 
                          background: order.status === 'Başarılı' || order.status === 'hazırlanıyor' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: order.status === 'Başarılı' || order.status === 'hazırlanıyor' ? '#2ecc71' : '#e74c3c'
                        }}>
                          {order.status === 'Başarılı' || order.status === 'hazırlanıyor' ? 'Aktif' : 'İptal / İade'}
                        </span>
                      </td>
                      <td>
                        <button 
                          style={{ background: 'transparent', border: '1px solid #c5a880', color: '#c5a880', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: '0.3s' }}
                          onClick={() => setSelectedInvoice(order)}
                        >Faturayı Görüntüle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminTab === 'customers' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div className="admin-products-table-card glass-panel" style={{ overflowX: 'auto' }}>
                <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  Adres Kayıtları Veritabanı
                </h2>
                <table className="admin-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Müşteri</th>
                      <th>E-Posta</th>
                      <th>Teslimat Adresi</th>
                      <th>Şehir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td style={{ color: '#fff', fontWeight: 600 }}>{order.customerName}</td>
                        <td>{order.email}</td>
                        <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.address}>{order.address}</td>
                        <td>{order.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-products-table-card glass-panel" style={{ overflowX: 'auto' }}>
                <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  Kayıtlı Ödeme Kartı Bilgileri (Güvenli Log)
                </h2>
                <table className="admin-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Kart Sahibi</th>
                      <th>Maskeli Kart No</th>
                      <th>İlişkili Sipariş</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td style={{ color: '#fff', fontWeight: 600 }}>{order.cardName}</td>
                        <td style={{ fontFamily: 'monospace' }}>{order.cardMasked}</td>
                        <td>{order.id}</td>
                        <td>
                          <span style={{ color: '#2ecc71', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Doğrulandı
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cart Drawer */}
      <div className={`drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={20} style={{ color: '#c5a880' }} />
            <span>Alışveriş Sepetim</span>
          </div>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="drawer-body">
          {cart.length > 0 && (
            <div className="shipping-tracker">
              {subtotal >= 1500 ? (
                <div className="shipping-tracker-text">
                  <CheckCircle2 size={16} style={{ color: '#2ecc71' }} />
                  Tebrikler! <span>Kargo Ücretsiz</span>
                </div>
              ) : (
                <div className="shipping-tracker-text">
                  <span>{(1500 - subtotal).toFixed(2)} TL</span> daha ekle, kargo bedava olsun!
                </div>
              )}
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${Math.min((subtotal / 1500) * 100, 100)}%` }}></div>
              </div>
            </div>
          )}

          {cart.length > 0 ? (
            cart.map((item, index) => {
              const activePrice = item.product.isFlashSale && item.product.discountPrice ? item.product.discountPrice : item.product.price;
              return (
                <div key={index} className="drawer-item">
                  <img src={item.product.images[0]} className="drawer-item-img" alt="" />
                  <div className="drawer-item-info">
                    <h4 className="drawer-item-title">{item.product.title}</h4>
                    <div className="drawer-item-meta">Renk: {item.selectedColor} | Beden: {item.selectedSize}</div>
                    <div className="drawer-item-bottom">
                      <div className="qty-selector">
                        <button className="qty-btn" onClick={() => updateCartQty(index, -1)}><Minus size={10} /></button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateCartQty(index, 1)}><Plus size={10} /></button>
                      </div>
                      <span className="drawer-item-price">{(activePrice * item.quantity).toFixed(2)} TL</span>
                    </div>
                  </div>
                  <button className="remove-item-btn" onClick={() => removeFromCart(index)}><Trash2 size={14} /></button>
                </div>
              );
            })
          ) : (
            <div className="drawer-empty">
              <ShoppingBag size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
              <p>Sepetiniz henüz boş.</p>
              <button style={{ background: 'transparent', border: '1px solid #c5a880', color: '#c5a880', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', marginTop: '10px' }} onClick={() => setIsCartOpen(false)}>Alışverişe Başla</button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="coupon-container">
              <input type="text" placeholder="İndirim kuponu gir..." className="coupon-input" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button className="coupon-btn" onClick={applyCoupon}>Ekle</button>
            </div>

            {appliedCouponText && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#2ecc71', marginBottom: '10px' }}>
                <span>Uygulanan Kupon:</span>
                <span>{appliedCouponText}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Ara Toplam:</span>
              <span>{subtotal.toFixed(2)} TL</span>
            </div>
            {discountPercent > 0 && (
              <div className="summary-row" style={{ color: '#2ecc71' }}>
                <span>Kupon İndirimi (%{discountPercent}):</span>
                <span>-{discountAmount.toFixed(2)} TL</span>
              </div>
            )}
            <div className="summary-row">
              <span>Kargo Ücreti:</span>
              <span>{shippingFee === 0 ? "Ücretsiz" : `${shippingFee.toFixed(2)} TL`}</span>
            </div>
            <div className="summary-row total">
              <span>Toplam:</span>
              <span>{total.toFixed(2)} TL</span>
            </div>

            <button className="checkout-btn" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); setCheckoutStep("form"); }}>
              Siparişi Tamamla <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Favorites Drawer */}
      <div className={`drawer-overlay ${isFavOpen ? 'open' : ''}`} onClick={() => setIsFavOpen(false)}></div>
      <div className={`drawer ${isFavOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <Heart size={20} fill="#e74c3c" stroke="#e74c3c" />
            <span>Beğendiklerim</span>
          </div>
          <button className="close-btn" onClick={() => setIsFavOpen(false)}><X size={24} /></button>
        </div>

        <div className="drawer-body">
          {favorites.length > 0 ? (
            products.filter(p => favorites.includes(p.id)).map(product => {
              const activePrice = product.isFlashSale && product.discountPrice ? product.discountPrice : product.price;
              return (
                <div key={product.id} className="drawer-item" style={{ alignItems: 'center' }}>
                  <img src={product.images[0]} className="drawer-item-img" alt="" />
                  <div className="drawer-item-info">
                    <h4 className="drawer-item-title">{product.title}</h4>
                    <div className="drawer-item-price" style={{ margin: '4px 0' }}>{activePrice.toFixed(2)} TL</div>
                    <button style={{ background: '#c5a880', color: '#0b0c10', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => addToCart(product)}>
                      <ShoppingBag size={10} /> Sepete Ekle
                    </button>
                  </div>
                  <button className="remove-item-btn" onClick={() => toggleFavorite(product.id)}><Trash2 size={14} /></button>
                </div>
              );
            })
          ) : (
            <div className="drawer-empty">
              <Heart size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
              <p>Beğendiğiniz bir ürün bulunmuyor.</p>
              <button style={{ background: 'transparent', border: '1px solid #c5a880', color: '#c5a880', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', marginTop: '10px' }} onClick={() => setIsFavOpen(false)}>Koleksiyonları Gez</button>
            </div>
          )}
        </div>
      </div>

      {/* Account Drawer */}
      <div className={`drawer-overlay ${isAccountOpen ? 'open' : ''}`} onClick={() => setIsAccountOpen(false)}></div>
      <div className={`drawer ${isAccountOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <User size={20} style={{ color: '#c5a880' }} />
            <span>Hesabım</span>
          </div>
          <button className="close-btn" onClick={() => setIsAccountOpen(false)}><X size={24} /></button>
        </div>

        <div className="drawer-body">
          {currentUser ? (
            <div>
              <div style={{ textAlign: 'center', padding: '20px 0 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(197,168,128,0.15)', border: '2px solid #c5a880', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                  <User size={36} style={{ color: '#c5a880' }} />
                </div>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{currentUser.displayName || currentUser.name || 'Kullanıcı'}</h3>
                <p style={{ color: '#8892b0', fontSize: '13px', marginTop: '4px' }}>{currentUser.email}</p>
                <span style={{ display: 'inline-block', marginTop: '10px', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: 'rgba(197,168,128,0.15)', color: '#c5a880', border: '1px solid rgba(197,168,128,0.3)' }}>
                  Luvra Exclusive Üye
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(197,168,128,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                  <User size={18} style={{ color: '#c5a880' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Profil Bilgileri</div>
                    <div style={{ fontSize: '11px', color: '#8892b0' }}>Ad, soyad, e-posta düzenle</div>
                  </div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(197,168,128,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                  <ShoppingBag size={18} style={{ color: '#c5a880' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Siparişlerim</div>
                    <div style={{ fontSize: '11px', color: '#8892b0' }}>Geçmiş siparişlerinizi görüntüleyin</div>
                  </div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(197,168,128,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onClick={() => { setIsAccountOpen(false); setIsTrackingOpen(true); }}
                >
                  <Search size={18} style={{ color: '#c5a880' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Kargo Takibi</div>
                    <div style={{ fontSize: '11px', color: '#8892b0' }}>Siparişinizin kargo durumunu takip edin</div>
                  </div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(197,168,128,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onClick={() => { setIsAccountOpen(false); setIsReturnOpen(true); }}
                >
                  <Trash2 size={18} style={{ color: '#c5a880' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>İade Talebi</div>
                    <div style={{ fontSize: '11px', color: '#8892b0' }}>İade veya değişim talebinde bulunun</div>
                  </div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(197,168,128,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                  <Heart size={18} style={{ color: '#c5a880' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Adreslerim</div>
                    <div style={{ fontSize: '11px', color: '#8892b0' }}>Teslimat adreslerini yönetin</div>
                  </div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(197,168,128,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                  <Sparkles size={18} style={{ color: '#c5a880' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Luvra Puanlarım</div>
                    <div style={{ fontSize: '11px', color: '#8892b0' }}>250 puan kazandınız</div>
                  </div>
                </button>
              </div>

              <button 
                style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '10px', color: '#e74c3c', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: '0.3s' }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(231,76,60,0.25)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(231,76,60,0.15)'}
                onClick={() => {
                  logout();
                  setIsAccountOpen(false);
                }}
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <div className="drawer-empty">
              <User size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
              <p>Giriş yapmadınız.</p>
              <button 
                style={{ background: '#c5a880', color: '#0b0c10', border: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}
                onClick={() => {
                  setIsAccountOpen(false);
                  setCustomerLoginForm(prev => ({ ...prev, isRegister: false }));
                  setIsCustomerLoginOpen(true);
                }}
              >Giriş Yap</button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setQuickViewProduct(null)}><X size={18} /></button>

            <div className="quickview-layout">
              <div className="quickview-gallery">
                <div className="quickview-main-img">
                  <img src={quickViewProduct.images[quickViewImgIndex] || quickViewProduct.images[0]} alt="" />
                </div>
                <div className="quickview-thumbs">
                  {quickViewProduct.images.map((img, i) => (
                    <img key={i} src={img} className={`quickview-thumb ${i === quickViewImgIndex ? 'active' : ''}`} onClick={() => setQuickViewImgIndex(i)} alt="" />
                  ))}
                </div>
              </div>

              <div className="quickview-details">
                <div>
                  <span className="card-category" style={{ fontSize: '12px' }}>{quickViewProduct.category}</span>
                  <h2 className="quickview-title">{quickViewProduct.title}</h2>
                  
                  <div className="card-rating" style={{ marginBottom: '15px' }}>
                    <Star size={14} fill="#ffb800" stroke="#ffb800" />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{quickViewProduct.rating}</span>
                    <span style={{ color: '#8892b0' }}>({quickViewProduct.reviewsCount} Değerlendirme)</span>
                  </div>

                  <div className="quickview-price-row">
                    {quickViewProduct.isFlashSale && quickViewProduct.discountPrice ? (
                      <>
                        <span className="quickview-price" style={{ color: '#ff6f3c' }}>{quickViewProduct.discountPrice.toFixed(2)} TL</span>
                        <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '16px' }}>{quickViewProduct.price.toFixed(2)} TL</span>
                      </>
                    ) : (
                      <span className="quickview-price">{quickViewProduct.price.toFixed(2)} TL</span>
                    )}
                  </div>

                  <p className="quickview-desc">{quickViewProduct.description}</p>

                  {quickViewProduct.colors && quickViewProduct.colors.length > 0 && quickViewProduct.colors[0] !== "Standart" && (
                    <div className="option-select-group">
                      <div className="option-title">Renk Seçin: {quickViewColor}</div>
                      <div className="option-pills">
                        {quickViewProduct.colors.map(color => (
                          <button key={color} className={`option-pill ${quickViewColor === color ? 'active' : ''}`} onClick={() => setQuickViewColor(color)}>{color}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && quickViewProduct.sizes[0] !== "Standart" && (
                    <div className="option-select-group">
                      <div className="option-title">Beden Seçin: {quickViewSize}</div>
                      <div className="option-pills">
                        {quickViewProduct.sizes.map(size => (
                          <button key={size} className={`option-pill ${quickViewSize === size ? 'active' : ''}`} onClick={() => setQuickViewSize(size)}>{size}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="quickview-actions">
                    <button className="checkout-btn" style={{ margin: 0, flexGrow: 1 }} onClick={() => { addToCart(quickViewProduct, quickViewColor, quickViewSize); setQuickViewProduct(null); }}>
                      <ShoppingBag size={18} /> Sepete Ekle
                    </button>
                    <button className={`card-wishlist-btn ${favorites.includes(quickViewProduct.id) ? 'active' : ''}`} style={{ position: 'relative', top: 0, right: 0, width: '48px', height: '48px', flexShrink: 0 }} onClick={() => toggleFavorite(quickViewProduct.id)}>
                      <Heart size={20} fill={favorites.includes(quickViewProduct.id) ? "#e74c3c" : "none"} />
                    </button>
                  </div>

                  {quickViewProduct.features && (
                    <ul className="features-list">
                      {quickViewProduct.features.map((f, index) => (
                        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={12} style={{ color: '#c5a880' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="quickview-reviews">
                    <h3 style={{ fontSize: '13px', color: '#fff', marginBottom: '10px' }}>Öne Çıkan Değerlendirmeler</h3>
                    {MOCK_REVIEWS.map(rev => (
                      <div key={rev.id} className="review-item">
                        <div className="review-header">
                          <span className="review-user">{rev.user}</span>
                          <span style={{ display: 'flex', gap: '2px' }}>
                            {Array.from({ length: rev.rating }).map((_, rIdx) => (
                              <Star key={rIdx} size={10} fill="#ffb800" stroke="#ffb800" />
                            ))}
                          </span>
                        </div>
                        <p className="review-comment">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsCheckoutOpen(false)}><X size={18} /></button>

            {checkoutStep === "form" ? (
              <div className="checkout-layout">
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Güvenli Ödeme</h2>
                <form onSubmit={handleCheckoutSubmit} className="checkout-grid">
                  <div>
                    <h3 className="checkout-section-title">Teslimat Bilgileri</h3>
                    <div className="form-group">
                      <label className="form-label">Ad Soyad *</label>
                      <input type="text" className="form-input" required value={checkoutForm.name} onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})} placeholder="Örn: Ahmet Yılmaz" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-Posta *</label>
                      <input type="email" className="form-input" required value={checkoutForm.email} onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})} placeholder="Örn: ahmet@gmail.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Adres *</label>
                      <input type="text" className="form-input" required value={checkoutForm.address} onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})} placeholder="Mahalle, sokak, daire no..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Şehir *</label>
                      <input type="text" className="form-input" required value={checkoutForm.city} onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})} placeholder="Örn: İstanbul" />
                    </div>

                    <h3 className="checkout-section-title" style={{ marginTop: '25px' }}>Kart Bilgileri</h3>
                    <div className="form-group">
                      <label className="form-label">Kart Üzerindeki İsim *</label>
                      <input type="text" className="form-input" required value={checkoutForm.cardName} onChange={(e) => setCheckoutForm({...checkoutForm, cardName: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kart Numarası *</label>
                      <input type="text" maxLength="19" placeholder="xxxx xxxx xxxx xxxx" className="form-input" required value={checkoutForm.cardNumber} onChange={(e) => setCheckoutForm({...checkoutForm, cardNumber: e.target.value})} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Son Kullanma *</label>
                        <input type="text" placeholder="AA/YY" maxLength="5" className="form-input" required value={checkoutForm.cardExpiry} onChange={(e) => setCheckoutForm({...checkoutForm, cardExpiry: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVC *</label>
                        <input type="password" placeholder="xxx" maxLength="3" className="form-input" required value={checkoutForm.cardCvc} onChange={(e) => setCheckoutForm({...checkoutForm, cardCvc: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="checkout-summary-box">
                      <h3 className="checkout-section-title" style={{ borderBottom: 'none', marginBottom: '10px' }}>Sipariş Özeti</h3>
                      
                      <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '20px' }}>
                        {cart.map((item, idx) => {
                          const activePrice = item.product.isFlashSale && item.product.discountPrice ? item.product.discountPrice : item.product.price;
                          return (
                            <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', marginBottom: '8px' }}>
                              <span style={{ color: '#fff', flexGrow: 1 }}>{item.product.title} <span style={{ opacity: 0.5 }}>({item.quantity}x)</span></span>
                              <span style={{ color: '#c5a880', fontWeight: 'bold', flexShrink: 0 }}>{(activePrice * item.quantity).toFixed(2)} TL</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="summary-row">
                        <span>Ara Toplam:</span>
                        <span>{subtotal.toFixed(2)} TL</span>
                      </div>
                      {discountPercent > 0 && (
                        <div className="summary-row" style={{ color: '#2ecc71' }}>
                          <span>Kupon İndirimi:</span>
                          <span>-{discountAmount.toFixed(2)} TL</span>
                        </div>
                      )}
                      <div className="summary-row">
                        <span>Kargo Ücreti:</span>
                        <span>{shippingFee === 0 ? "Ücretsiz" : `${shippingFee.toFixed(2)} TL`}</span>
                      </div>
                      <div className="summary-row total" style={{ marginTop: '10px', paddingTop: '10px' }}>
                        <span>Genel Toplam:</span>
                        <span>{total.toFixed(2)} TL</span>
                      </div>

                      <button type="submit" className="checkout-btn" style={{ width: '100%', marginTop: '20px' }}>
                        Ödemeyi Tamamla ve Sipariş Ver
                      </button>
                      <p style={{ fontSize: '10px', color: '#5e6b7c', textAlign: 'center', marginTop: '10px' }}>
                        * Ödemeler Iyzico güvencesiyle işlenmektedir.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="order-success-screen">
                <div className="success-icon-wrapper">
                  <CheckCircle2 size={48} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#fff' }}>Siparişiniz Alındı!</h2>
                <p style={{ color: '#c5c6c7', maxWidth: '450px', lineHeight: 1.6 }}>
                  Sayın <b>{checkoutForm.name}</b>, siparişiniz başarıyla oluşturulmuştur. Paketiniz Luvra güvencesiyle en kısa sürede kargoya teslim edilecektir.
                </p>
                <button className="checkout-btn" onClick={() => setIsCheckoutOpen(false)} style={{ width: 'auto', padding: '12px 30px' }}>
                  Alışverişe Devam Et
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '600px', background: '#ffffff', color: '#1f2833', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" style={{ background: '#1f2833', color: '#fff', top: '10px', right: '10px' }} onClick={() => setSelectedInvoice(null)}><X size={18} /></button>
            <div id="printed-invoice" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #1f2833', paddingBottom: '15px', marginBottom: '15px' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', letterSpacing: '2px', color: '#0b0c10', margin: 0 }}>LUVRA STORE</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#5e6b7c' }}>Lüks E-Ticaret A.Ş. | Müşteri Faturası</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', textTransform: 'uppercase' }}>Fatura Bilgileri:</h4>
                  <p style={{ margin: '2px 0' }}><b>Fatura No:</b> INV-{selectedInvoice.id?.replace('LVR-', '')}</p>
                  <p style={{ margin: '2px 0' }}><b>Sipariş No:</b> {selectedInvoice.id}</p>
                  <p style={{ margin: '2px 0' }}><b>Tarih:</b> {selectedInvoice.date || new Date(selectedInvoice.createdAt?.seconds * 1000).toLocaleDateString('tr-TR')}</p>
                  <p style={{ margin: '2px 0' }}><b>Ödeme Tipi:</b> Kredi Kartı</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: '0 0 6px 0', textTransform: 'uppercase' }}>Alıcı Bilgileri:</h4>
                  <p style={{ margin: '2px 0' }}><b>Adı:</b> {selectedInvoice.customerName}</p>
                  <p style={{ margin: '2px 0' }}><b>E-Posta:</b> {selectedInvoice.email}</p>
                  <p style={{ margin: '2px 0' }}><b>Adres:</b> {selectedInvoice.address}</p>
                  <p style={{ margin: '2px 0' }}><b>Şehir:</b> {selectedInvoice.city}</p>
                </div>
              </div>
              <div style={{ width: '50%', marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Ara Toplam:</span>
                  <span>{(selectedInvoice.amount * 0.83).toFixed(2)} TL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>KDV (%20):</span>
                  <span>{(selectedInvoice.amount * 0.17).toFixed(2)} TL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0 4px 0', borderTop: '1px dashed #1f2833', paddingTop: '8px', fontWeight: 'bold' }}>
                  <span>Genel Toplam:</span>
                  <span>{selectedInvoice.amount?.toFixed(2)} TL</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '30px', color: '#8892b0', fontSize: '11px', borderTop: '1px solid #1f2833', paddingTop: '15px' }}>
                Alışverişiniz için teşekkür ederiz. Luvra Store kalitesini tercih ettiğiniz için mutluyuz!
              </div>
            </div>
            <button className="checkout-btn" style={{ marginTop: '20px', width: '100%' }} onClick={() => {
              const printContents = document.getElementById('printed-invoice').innerHTML;
              const originalContents = document.body.innerHTML;
              document.body.innerHTML = printContents;
              window.print();
              document.body.innerHTML = originalContents;
              window.location.reload();
            }}>Faturayı Yazdır / PDF İndir</button>
          </div>
        </div>
      )}

      {/* Customer Login Modal */}
      {isCustomerLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsCustomerLoginOpen(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '400px', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" style={{ background: '#1f2833', color: '#fff', top: '10px', right: '10px' }} onClick={() => setIsCustomerLoginOpen(false)}><X size={18} /></button>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              {customerLoginForm.isRegister ? 'Üye Ol' : 'Giriş Yap'}
            </h2>
            <form onSubmit={handleCustomerLogin}>
              {customerLoginForm.isRegister && (
                <div className="form-group">
                  <label className="form-label">Adınız Soyadınız *</label>
                  <input type="text" className="form-input" required value={customerLoginForm.name} onChange={(e) => setCustomerLoginForm({ ...customerLoginForm, name: e.target.value })} placeholder="Ahmet Yılmaz" />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">E-Posta Adresi *</label>
                <input type="email" className="form-input" required value={customerLoginForm.email} onChange={(e) => setCustomerLoginForm({ ...customerLoginForm, email: e.target.value })} placeholder="ahmet@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Şifre *</label>
                <input type="password" className="form-input" required value={customerLoginForm.password} onChange={(e) => setCustomerLoginForm({ ...customerLoginForm, password: e.target.value })} placeholder="••••••••" />
              </div>

              {customerLoginError && (
                <div style={{ color: customerLoginError.includes('başarılı') ? '#2ecc71' : 'var(--accent-red)', fontSize: '12px', margin: '10px 0', textAlign: 'center' }}>{customerLoginError}</div>
              )}

              <button type="submit" className="checkout-btn" style={{ width: '100%', marginTop: '10px' }}>
                {customerLoginForm.isRegister ? 'Üye Ol' : 'Giriş Yap'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '12px', color: '#8892b0' }}>
                {customerLoginForm.isRegister ? (
                  <span>Zaten üye misiniz?{' '}<a href="#" style={{ color: 'var(--text-gold)', textDecoration: 'underline' }} onClick={(e) => { e.preventDefault(); setCustomerLoginForm({ ...customerLoginForm, isRegister: false }); setCustomerLoginError(""); }}>Giriş Yapın</a></span>
                ) : (
                  <span>Hesabınız yok mu?{' '}<a href="#" style={{ color: 'var(--text-gold)', textDecoration: 'underline' }} onClick={(e) => { e.preventDefault(); setCustomerLoginForm({ ...customerLoginForm, isRegister: true }); setCustomerLoginError(""); }}>Üye Olun</a></span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Login Modal */}
      {isSellerLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsSellerLoginOpen(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '400px', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" style={{ background: '#1f2833', color: '#fff', top: '10px', right: '10px' }} onClick={() => setIsSellerLoginOpen(false)}><X size={18} /></button>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>Satıcı Girişi</h2>
            <form onSubmit={handleSellerLogin}>
              <div className="form-group">
                <label className="form-label">Kullanıcı Adı *</label>
                <input type="text" className="form-input" required value={sellerLoginForm.email} onChange={(e) => setSellerLoginForm({ ...sellerLoginForm, email: e.target.value })} placeholder="Kullanıcı adınızı girin" />
              </div>
              <div className="form-group">
                <label className="form-label">Şifre *</label>
                <input type="password" className="form-input" required value={sellerLoginForm.password} onChange={(e) => setSellerLoginForm({ ...sellerLoginForm, password: e.target.value })} placeholder="••••••••" />
              </div>

              {sellerLoginError && (
                <div style={{ color: 'var(--accent-red)', fontSize: '11px', margin: '10px 0', textAlign: 'center', lineHeight: 1.4 }}>{sellerLoginError}</div>
              )}

              <button type="submit" className="checkout-btn" style={{ width: '100%', marginTop: '10px' }}>Satıcı Girişi Yap</button>
            </form>
          </div>
        </div>
      )}

      {/* Kargo Takip Modal */}
      {isTrackingOpen && (
        <div className="modal-overlay" onClick={() => { setIsTrackingOpen(false); setTrackingResult(null); setTrackingNumber(""); }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" style={{ background: '#1f2833', color: '#fff', top: '10px', right: '10px' }} onClick={() => { setIsTrackingOpen(false); setTrackingResult(null); setTrackingNumber(""); }}><X size={18} /></button>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              Kargo Takibi
            </h2>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ flex: 1 }}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Sipariş numaranızı girin (ör: LVR-984712)"
              />
              <button 
                className="checkout-btn" 
                style={{ padding: '10px 20px' }}
                onClick={() => {
                  const found = orders.find(o => o.id === trackingNumber.trim());
                  if (found) {
                    setTrackingResult(found);
                  } else {
                    setTrackingResult({ notFound: true });
                  }
                }}
              >
                Sorgula
              </button>
            </div>

            {trackingResult && !trackingResult.notFound && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#8892b0' }}>Sipariş No</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#c5a880' }}>{trackingResult.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#8892b0' }}>Durum</div>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: 'rgba(46,204,113,0.15)', color: '#2ecc71' }}>
                      {trackingResult.status}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Kargo Süreci</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {[
                      { step: 'Sipariş Alındı', date: trackingResult.date, done: true },
                      { step: 'Kargoya Verildi', date: trackingResult.status !== 'hazırlanıyor' ? 'Kargoya verildi' : 'Bekleniyor', done: trackingResult.status !== 'hazırlanıyor' },
                      { step: 'Yolda', date: trackingResult.status === 'teslim edildi' ? 'Tamamlandı' : 'Bekleniyor', done: trackingResult.status === 'teslim edildi' },
                      { step: 'Teslim Edildi', date: trackingResult.status === 'teslim edildi' ? 'Tamamlandı' : 'Bekleniyor', done: trackingResult.status === 'teslim edildi' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.done ? '#2ecc71' : 'rgba(255,255,255,0.1)', border: item.done ? 'none' : '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}></div>
                          {i < 3 && <div style={{ width: '2px', height: '30px', background: item.done ? '#2ecc71' : 'rgba(255,255,255,0.1)' }}></div>}
                        </div>
                        <div style={{ paddingBottom: '8px' }}>
                          <div style={{ fontSize: '13px', fontWeight: item.done ? 600 : 400, color: item.done ? '#fff' : '#8892b0' }}>{item.step}</div>
                          <div style={{ fontSize: '11px', color: '#5e6b7c' }}>{item.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(197,168,128,0.08)', borderRadius: '8px', fontSize: '12px', color: '#8892b0' }}>
                  <b style={{ color: '#c5a880' }}>Ürünler:</b> {trackingResult.items}
                </div>
              </div>
            )}

            {trackingResult && trackingResult.notFound && (
              <div style={{ textAlign: 'center', padding: '30px', color: '#8892b0' }}>
                <ShieldAlert size={40} style={{ color: '#ff6f3c', marginBottom: '10px' }} />
                <p>Sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* İade Talebi Modal */}
      {isReturnOpen && (
        <div className="modal-overlay" onClick={() => { setIsReturnOpen(false); setReturnForm({ orderId: "", reason: "", description: "" }); }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" style={{ background: '#1f2833', color: '#fff', top: '10px', right: '10px' }} onClick={() => { setIsReturnOpen(false); setReturnForm({ orderId: "", reason: "", description: "" }); }}><X size={18} /></button>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              İade Talebi Oluştur
            </h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!returnForm.orderId || !returnForm.reason) {
                alert("Lütfen sipariş numarası ve iade nedenini seçin.");
                return;
              }
              const newReturn = {
                id: 'RFD-' + Math.floor(1000 + Math.random() * 9000),
                orderId: returnForm.orderId,
                reason: returnForm.reason,
                description: returnForm.description,
                status: 'Beklemede',
                date: new Date().toLocaleDateString('tr-TR')
              };
              const updatedReturns = [newReturn, ...userReturns];
              setUserReturns(updatedReturns);
              localStorage.setItem('luvra_returns', JSON.stringify(updatedReturns));
              alert(`İade talebiniz oluşturuldu! Takip numarası: ${newReturn.id}`);
              setIsReturnOpen(false);
              setReturnForm({ orderId: "", reason: "", description: "" });
            }}>
              <div className="form-group">
                <label className="form-label">Sipariş Numarası *</label>
                <select 
                  className="form-input" 
                  required
                  value={returnForm.orderId}
                  onChange={(e) => setReturnForm({ ...returnForm, orderId: e.target.value })}
                >
                  <option value="">Sipariş seçin...</option>
                  {orders.filter(o => o.userId === currentUser?.uid || o.email === currentUser?.email).map(order => (
                    <option key={order.id} value={order.id}>{order.id} - {order.items?.substring(0, 40)}...</option>
                  ))}
                  {orders.filter(o => o.userId === currentUser?.uid || o.email === currentUser?.email).length === 0 && (
                    <option value="manual">Sipariş numarası girilecek</option>
                  )}
                </select>
              </div>

              {returnForm.orderId === 'manual' && (
                <div className="form-group">
                  <label className="form-label">Sipariş Numarası *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="LVR-XXXXXX"
                    value={returnForm.orderId === 'manual' ? '' : returnForm.orderId}
                    onChange={(e) => setReturnForm({ ...returnForm, orderId: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">İade Nedeni *</label>
                <select 
                  className="form-input" 
                  required
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                >
                  <option value="">Neden seçin...</option>
                  <option value="Yanlış beden">Yanlış beden</option>
                  <option value="Ürün hasarlı">Ürün hasarlı / kusurlu</option>
                  <option value="Yanlış ürün geldi">Yanlış ürün gönderilmiş</option>
                  <option value="Beklentiyi karşılamadı">Beklentiyi karşılamadı</option>
                  <option value="Renk uyumsuzluğu">Renk / desen uyumsuzluğu</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea 
                  className="form-input" 
                  style={{ height: '80px', resize: 'vertical' }}
                  placeholder="İade nedenini detaylandırın..."
                  value={returnForm.description}
                  onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                />
              </div>

              <button type="submit" className="checkout-btn" style={{ width: '100%', marginTop: '10px' }}>
                İade Talebi Gönder
              </button>
            </form>

            {userReturns.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px' }}>Önceki Talepleriniz</h3>
                {userReturns.map(ret => (
                  <div key={ret.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#c5a880' }}>{ret.id}</span>
                      <span style={{ 
                        padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '11px',
                        background: ret.status === 'Onaylandı' ? 'rgba(46,204,113,0.15)' : ret.status === 'Reddedildi' ? 'rgba(231,76,60,0.15)' : 'rgba(197,168,128,0.15)',
                        color: ret.status === 'Onaylandı' ? '#2ecc71' : ret.status === 'Reddedildi' ? '#e74c3c' : '#c5a880'
                      }}>{ret.status}</span>
                    </div>
                    <div style={{ color: '#8892b0' }}>Sipariş: {ret.orderId} | {ret.reason}</div>
                    <div style={{ color: '#5e6b7c', marginTop: '4px' }}>{ret.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Pages Modal */}
      {activeFooterPage && (
        <div className="modal-overlay" onClick={() => setActiveFooterPage(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '650px', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveFooterPage(null)}><X size={18} /></button>

            {activeFooterPage === 'hakkimizda' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Hakkımızda</h2>
                <p style={{ color: '#c5c6c7', lineHeight: 1.8, fontSize: '14px', marginBottom: '15px' }}>
                  <b style={{ color: '#c5a880' }}>LUVRA STORE</b>, 2024 yılında Türkiye'nin önde gelen lüks moda ve yaşam tarzı markası olarak kuruldu. Amacımız, premium kalitedeki ürünleri ulaşılabilir fiyatlarla sunarak herkesin şıklığı deneyimlemesini sağlamaktır.
                </p>
                <p style={{ color: '#c5c6c7', lineHeight: 1.8, fontSize: '14px', marginBottom: '15px' }}>
                  Kadın ve erkek giyiminden lüks parfümlere, cilt bakım ürünlerinden ev dekorasyonuna kadar geniş bir yelpazede ürün sunuyoruz. Her bir ürünümüz, kalite ve tasarım titizliğiyle seçilmiştir.
                </p>
                <p style={{ color: '#c5c6c7', lineHeight: 1.8, fontSize: '14px', marginBottom: '20px' }}>
                  <b style={{ color: '#c5a880' }}>Vizyonumuz:</b> E-ticarette güvenilir, yenilikçi ve müşteri odaklı bir marka olarak uluslararası arenada tanınmak.
                </p>
                <p style={{ color: '#c5c6c7', lineHeight: 1.8, fontSize: '14px' }}>
                  <b style={{ color: '#c5a880' }}>Misyonumuz:</b> Müşterilerimize en kaliteli ürünleri, en hızlı teslimat ve en güvenilir alışveriş deneyimiyle sunmak.
                </p>
              </div>
            )}

            {activeFooterPage === 'kariyer' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Kariyer</h2>
                <p style={{ color: '#c5c6c7', lineHeight: 1.8, fontSize: '14px', marginBottom: '20px' }}>
                  LUVRA STORE olarak sürekli büyüyoruz ve ekibimize yeni yetenekler katıyoruz. Eğer dinamik, yaratıcı ve tutkulu bir ekibin parçası olmak istiyorsanız doğru yerdesiniz.
                </p>
                <h3 style={{ color: '#c5a880', fontSize: '16px', marginBottom: '12px' }}>Açık Pozisyonlar</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { title: 'Dijital Pazarlama Uzmanı', dept: 'Pazarlama', location: 'İstanbul' },
                    { title: 'Frontend Geliştirici', dept: 'Teknoloji', location: 'Uzaktan' },
                    { title: 'Müşteri Hizmetleri Danışmanı', dept: 'Operasyon', location: 'İstanbul' },
                    { title: 'Grafik Tasarımcı', dept: 'Tasarım', location: 'İstanbul' }
                  ].map((job, i) => (
                    <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{job.title}</div>
                        <div style={{ fontSize: '12px', color: '#8892b0', marginTop: '4px' }}>{job.dept} • {job.location}</div>
                      </div>
                      <button style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #c5a880', color: '#c5a880', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: '0.3s' }}
                        onMouseEnter={(e) => { e.target.style.background = '#c5a880'; e.target.style.color = '#0b0c10'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#c5a880'; }}
                        onClick={() => setActiveFooterPage('iletisim')}
                      >Başvur</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFooterPage === 'surdurulebilirlik' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Sürdürülebilirlik</h2>
                <p style={{ color: '#c5c6c7', lineHeight: 1.8, fontSize: '14px', marginBottom: '20px' }}>
                  LUVRA STORE olarak çevre bilincini iş modelimizin merkezine koyuyoruz. Gelecek nesillere daha yaşanabilir bir dünya bırakmak için sorumlu üretim ve tüketim ilkelerine bağlıyız.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  {[
                    { icon: '♻️', title: 'Geri Dönüşümlü Paketleme', desc: 'Tüm ambalajlarımız %100 geri dönüşümlü malzemelerden üretilmektedir.' },
                    { icon: '🌿', title: 'Doğal Ürünler', desc: 'Parfüm ve cilt bakım ürünlerimiz doğa dostu hammaddelerden üretilmektedir.' },
                    { icon: '⚡', title: 'Karbon Ayak İzi', desc: 'Lojistik süreçlerimizde karbon emisyonunu minimuma indiriyoruz.' },
                    { icon: '🤝', title: 'Adil Ticaret', desc: 'Tedarik zincirimizde adil çalışma koşullarını destekliyoruz.' }
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '6px' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#8892b0', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFooterPage === 'iletisim' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>İletişim</h2>
                <p style={{ color: '#c5c6c7', lineHeight: 1.8, fontSize: '14px', marginBottom: '20px' }}>
                  Sorularınız, önerileriniz veya talepleriniz için bize ulaşmaktan çekinmeyin. Müşteri memnuniyeti bizim için en üst önceliktir.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {[
                    { icon: <Sparkles size={20} />, title: 'Müşteri Hizmetleri', info: 'info@luvrastore.com', sub: '7/24 e-posta desteği' },
                    { icon: <Search size={20} />, title: 'Telefon', info: '+90 (500) 123 45 67', sub: 'Her gün 09:00 - 22:00' },
                    { icon: <Heart size={20} />, title: 'Sosyal Medya', info: '@luvrastore', sub: 'Instagram, TikTok, Twitter' },
                    { icon: <ShoppingBag size={20} />, title: 'Merkez', info: 'Kadıköy, İstanbul', sub: 'Atatürk Mah. Lüks Cad. No:1' }
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                      <div style={{ color: '#c5a880', marginBottom: '10px' }}>{item.icon}</div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ fontSize: '14px', color: '#c5a880', marginBottom: '4px' }}>{item.info}</div>
                      <div style={{ fontSize: '11px', color: '#8892b0' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFooterPage === 'iade' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Kolay İade & Değişim</h2>
                <p style={{ color: '#c5c6c7', lineHeight: 1.8, fontSize: '14px', marginBottom: '20px' }}>
                  LUVRA STORE'dan satın aldığınız ürünleri <b style={{ color: '#c5a880' }}>14 gün</b> içerisinde koşulsuz iade edebilir veya değiştirebilirsiniz.
                </p>
                <h3 style={{ color: '#c5a880', fontSize: '15px', marginBottom: '12px' }}>İade Koşulları</h3>
                <ul style={{ color: '#c5c6c7', fontSize: '13px', lineHeight: 2, paddingLeft: '20px', marginBottom: '20px' }}>
                  <li>Ürünün kullanılmamış ve etiketinin koparılmamış olması gerekmektedir.</li>
                  <li>Orijinal ambalajı ile birlikte gönderilmesi gerekmektedir.</li>
                  <li>İade talebi oluşturulduktan sonra 48 saat içerisinde kargoya verilmelidir.</li>
                  <li>Kargo ücreti ilk iade işlemlerinde firmamız tarafından karşılanmaktadır.</li>
                  <li>Flaş ürünlerde ve özel indirimli ürünlerde iade hakkı saklıdır.</li>
                </ul>
                <h3 style={{ color: '#c5a880', fontSize: '15px', marginBottom: '12px' }}>Değişim Süreci</h3>
                <p style={{ color: '#c5c6c7', fontSize: '13px', lineHeight: 1.8 }}>
                  Beden veya renk değişikliği için müşteri hizmetlerimize ulaşmanız yeterlidir. Stok durumuna göre aynı gün veya en geç 3 iş günü içerisinde değişim gerçekleştirilir.
                </p>
                <button style={{ marginTop: '20px', padding: '10px 24px', background: '#c5a880', color: '#0b0c10', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => { setActiveFooterPage(null); setIsReturnOpen(true); }}
                >İade Talebi Oluştur</button>
              </div>
            )}

            {activeFooterPage === 'sss' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Sıkça Sorulan Sorular</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { q: 'Siparişim ne zaman kargoya verilir?', a: 'Siparişleriniz onaylandıktan sonra 1-2 iş günü içerisinde kargoya verilir. Resmi tatillerde bu süre uzayabilir.' },
                    { q: 'Kargo ücreti ne kadar?', a: '1500 TL ve üzeri alışverişlerde kargo ücretsizdir. 1500 TL altı siparişlerde kargo ücreti 59.90 TL\'dir.' },
                    { q: 'Ürünlerin orijinalliği nedir?', a: 'Tüm ürünlerimiz LUVRA STORE güvencesiyle orijinal ve sertifikalıdır. %100 müşteri memnuniyeti garantisi sunuyoruz.' },
                    { q: 'Hediye paketi yapıyor musunuz?', a: 'Evet, tüm siparişlerimiz özel hediye paketi ile gönderilir. Ek hediye notu eklemek için sipariş sırasında not bölümüne yazabilirsiniz.' },
                    { q: 'Ödeme yöntemleri nelerdir?', a: 'Kredi kartı, banka kartı ile güvenli ödeme yapabilirsiniz. 3D Secure koruması ile işlemleriniz güvendedir.' },
                    { q: 'Ürünleri mağazadan teslim alabilir miyim?', a: 'Şu anda sadece online satış yapmaktayız. Ancak yakında İstanbul\'da bir showroom açmayı planlıyoruz.' }
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                      <div style={{ fontWeight: 600, color: '#c5a880', fontSize: '13px', marginBottom: '8px' }}>{item.q}</div>
                      <div style={{ fontSize: '13px', color: '#c5c6c7', lineHeight: 1.6 }}>{item.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFooterPage === 'guvenli' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Güvenli Alışveriş Rehberi</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[
                    { step: '1', title: 'Hesap Oluşturun', desc: 'Üye olarak siparişlerinizi takip edebilir, favori ürünlerinizi kaydedebilirsiniz.' },
                    { step: '2', title: 'Ürünleri Keşfedin', desc: 'Kategoriler, filtreler ve arama ile aradığınız ürüne kolayca ulaşın.' },
                    { step: '3', title: 'Sepete Ekleyin', desc: 'Renk ve beden seçiminizi yapın, ürünü sepete ekleyin.' },
                    { step: '4', title: 'Güvenle Ödeyin', desc: '3D Secure korumasıyla kredi kartınızla güvenli ödeme yapın.' },
                    { step: '5', title: 'Kargonuzu Takip Edin', desc: 'Siparişiniz kargoya verildiğinde bilgilendirilirsiniz. Hesabınızdan kargo durumunu takip edebilirsiniz.' }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(197,168,128,0.15)', border: '1px solid rgba(197,168,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#c5a880', fontSize: '14px', flexShrink: 0 }}>{item.step}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                        <div style={{ fontSize: '13px', color: '#8892b0', lineHeight: 1.5 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '10px', fontSize: '13px', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} />
                  Tüm ödemeleriniz 256-bit SSL şifreleme ile korunmaktadır.
                </div>
              </div>
            )}

            {activeFooterPage === 'kvkk' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>KVKK Aydınlatma Metni</h2>
                <div style={{ color: '#c5c6c7', fontSize: '13px', lineHeight: 1.8 }}>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>1. Veri Sorumlusu</b><br/>
                  Lüks E-Ticaret A.Ş. ("LUVRA STORE") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz.</p>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>2. Toplanan Kişisel Veriler</b><br/>
                  Adınız, soyadınız, e-posta adresiniz, teslimat adresiniz, telefon numaranız, ödeme kartı bilgileriniz (maskeli), alışveriş geçmişi ve IP adresiniz.</p>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>3. Verilerin Kullanım Amacı</b><br/>
                  Sipariş processing, teslimat, müşteri hizmetleri, pazarlama iletişimi, yasal yükümlülüklerin yerine getirilmesi.</p>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>4. Veri Saklama Süresi</b><br/>
                  Kişisel verileriniz, hukuki yükümlülüklerin yerine getirilmesi ve yasal süre boyunca saklanmaktadır.</p>
                  <p><b style={{ color: '#c5a880' }}>5. Haklarınız</b><br/>
                  KVKK kapsamında verilerinize erişme, düzeltme, silme ve işlenmesini talep etme haklarınız bulunmaktadır. Detaylar için info@luvrastore.com adresine başvurabilirsiniz.</p>
                </div>
              </div>
            )}

            {activeFooterPage === 'sozlesme' && (
              <div style={{ padding: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Kullanıcı Sözleşmesi</h2>
                <div style={{ color: '#c5c6c7', fontSize: '13px', lineHeight: 1.8 }}>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>Madde 1 - Taraflar</b><br/>
                  Bu sözleşme, Lüks E-Ticaret A.Ş. ("Satıcı") ile siteye üye olan kullanıcı ("Alıcı") arasında düzenlenmiştir.</p>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>Madde 2 - Konu</b><br/>
                  Bu sözleşmenin konusu, Alıcı'nın Satıcı'ya ait internet sitesinden elektronik ortamda sipariş verdiği ürünlerin satışı ve teslimi ile ilgili hak ve yükümlülüklerin belirlenmesidir.</p>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>Madde 3 - Ürün Bilgileri</b><br/>
                  Satın alınan ürünlerin nitelikleri, miktarı, satış fiyatı, ödeme şekli ve teslimat koşulları sipariş onay sayfasında belirtildiği gibidir.</p>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>Madde 4 - Ödeme</b><br/>
                  Alıcı, kredi kartı ile online ödeme yapabilir. 3D Secure ile güvenli ödeme sağlanmaktadır. Tüm fiyatlar KDV dahildir.</p>
                  <p style={{ marginBottom: '15px' }}><b style={{ color: '#c5a880' }}>Madde 5 - Teslimat</b><br/>
                  Siparişler, onayından itibaren 1-3 iş günü içinde kargoya verilir. 1500 TL üzeri alışverişlerde kargo ücretsizdir.</p>
                  <p><b style={{ color: '#c5a880' }}>Madde 6 - Cayma Hakkı</b><br/>
                  Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde cayma hakkına sahiptir. Ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trend Ürünler Story Viewer */}
      {isStoryViewerOpen && (
        <div className="story-viewer-overlay" onClick={() => setIsStoryViewerOpen(false)}>
          <div className="story-viewer-container" onClick={(e) => e.stopPropagation()}>
            <button className="story-viewer-close" onClick={() => setIsStoryViewerOpen(false)}>
              <X size={24} />
            </button>

            <div className="story-progress-bar-container">
              {trendSlides.map((_, idx) => (
                <div key={idx} className="story-progress-segment">
                  <div 
                    className="story-progress-fill"
                    style={{
                      width: idx < activeStorySlide ? '100%' : idx === activeStorySlide ? `${storyProgress}%` : '0%'
                    }}
                  ></div>
                </div>
              ))}
            </div>

            <div className="story-header">
              <div className="story-header-left">
                <img 
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=40&auto=format&fit=crop&q=80" 
                  alt="LUVRA" 
                  className="story-avatar"
                />
                <div>
                  <span className="story-username">luvrastore</span>
                  <span className="story-timestamp">Şimdi</span>
                </div>
              </div>
              <Sparkles size={18} style={{ color: '#c5a880' }} />
            </div>

            <div className="story-slide-area" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width / 2) {
                handleStoryClick('prev');
              } else {
                handleStoryClick('next');
              }
            }}>
              <img 
                src={trendSlides[activeStorySlide].image} 
                alt={trendSlides[activeStorySlide].title}
                className="story-slide-image"
              />
              <div className="story-slide-gradient"></div>
              <div className="story-slide-info">
                <h3 className="story-slide-title">{trendSlides[activeStorySlide].title}</h3>
                <p className="story-slide-subtitle">{trendSlides[activeStorySlide].subtitle}</p>
                <button 
                  className="story-slide-cta"
                  onClick={(e) => {
                    e.stopPropagation();
                    const product = products.find(p => p.id === trendSlides[activeStorySlide].productId);
                    if (product) {
                      setIsStoryViewerOpen(false);
                      handleQuickView(product);
                    }
                  }}
                >
                  <ShoppingBag size={14} /> Ürünü İncele
                </button>
              </div>
            </div>

            <div className="story-nav-left" onClick={(e) => { e.stopPropagation(); handleStoryClick('prev'); }}></div>
            <div className="story-nav-right" onClick={(e) => { e.stopPropagation(); handleStoryClick('next'); }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
