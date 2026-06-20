const USERS_KEY = 'luvra_users';
const AUTH_KEY = 'luvra_current_user';

const getUsers = () => {
  const saved = localStorage.getItem(USERS_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = async (email, password, name) => {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('auth/email-already-in-use');
  }
  const newUser = {
    uid: 'user-' + Date.now(),
    email,
    password,
    name,
    displayName: name,
    role: 'customer',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginUser = async (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('auth/invalid-credential');
  }
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
};

export const logoutUser = async () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getUserProfile = async (uid) => {
  const users = getUsers();
  const user = users.find(u => u.uid === uid);
  if (!user) return null;
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserProfile = async (uid, data) => {
  const users = getUsers();
  const index = users.findIndex(u => u.uid === uid);
  if (index === -1) return null;
  users[index] = { ...users[index], ...data };
  saveUsers(users);
  const { password: _, ...userWithoutPassword } = users[index];
  return userWithoutPassword;
};

export const onAuthChange = (callback) => {
  const saved = localStorage.getItem(AUTH_KEY);
  if (saved) {
    callback(JSON.parse(saved));
  } else {
    callback(null);
  }
};
