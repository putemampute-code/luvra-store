const ORDERS_KEY = 'luvra_orders';

const getOrders = () => {
  const saved = localStorage.getItem(ORDERS_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveOrders = (orders) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const createOrder = async (orderData) => {
  const orders = getOrders();
  const newOrder = {
    ...orderData,
    id: orderData.id || 'LVR-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString()
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder.id;
};

export const getOrdersByUser = async (userId) => {
  return getOrders().filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getAllOrders = async () => {
  return getOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getOrderById = async (id) => {
  return getOrders().find(o => o.id === id) || null;
};

export const updateOrderStatus = async (id, status) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) throw new Error('Sipariş bulunamadı');
  orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
  saveOrders(orders);
};
