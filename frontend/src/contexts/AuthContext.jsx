import { createContext, useContext, useState, useEffect } from 'react';

// Context oluştur (global state container)
const AuthContext = createContext(null);

// Hook - diğer componentler bu hook'u kullanarak user bilgisine erişir
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider - App'i wrap eder, tüm componentlere user bilgisi sağlar
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde localStorage'dan user'ı oku
  useEffect(() => {
    console.log('🔄 AuthContext: Initializing...');
    const storedUser = localStorage.getItem('smartkitchen_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('✅ AuthContext: User restored from localStorage:', parsedUser);
      } catch (error) {
        console.error('❌ Failed to parse stored user:', error);
        localStorage.removeItem('smartkitchen_user');
      }
    } else {
      console.log('ℹ️ AuthContext: No stored user found');
    }
    setLoading(false);
  }, []);

  // Login fonksiyonu - user bilgisini kaydet
  const login = (userData) => {
    console.log('🔐 AuthContext: Logging in user:', userData);
    setUser(userData);
    localStorage.setItem('smartkitchen_user', JSON.stringify(userData));
    console.log('✅ AuthContext: User saved to localStorage');
  };

  // Logout fonksiyonu - user bilgisini temizle
  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartkitchen_user');
  };

  // Context değeri - tüm componentler buna erişebilir
  const value = {
    user,           // Mevcut kullanıcı (null ise logout)
    loading,        // Sayfa ilk yüklenirken true
    login,          // Login fonksiyonu
    logout,         // Logout fonksiyonu
    isAuthenticated: !!user  // Boolean: giriş yapılmış mı?
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
