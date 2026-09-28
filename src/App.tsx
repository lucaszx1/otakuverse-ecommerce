import React, { useState, useEffect } from 'react';
import {
  DEFAULT_IMAGE_URLS,
  ImageAssetMap,
  PRODUCTS,
  ProductItem,
  CrossSellItem,
  formatBRL
} from './data/storeData';
import {
  UserProfile,
  OrderRecord,
  DEFAULT_DEMO_USER,
  getCurrentStoredUser,
  setCurrentStoredUser,
  getStoredOrders
} from './data/authStorage';
import { TopNavBar, Footer, ScreenName } from './components/Layout';
import { HomeScreen } from './screens/HomeScreen';
import { CatalogProfileScreen } from './screens/CatalogProfileScreen';
import { CheckoutScreen, CartEntry } from './screens/CheckoutScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ImageLinksModal } from './components/ImageLinksModal';
import { SafeImage } from './components/SafeImage';

const INITIAL_CART: CartEntry[] = [
  {
    id: 'figure-warrior',
    title: 'Figure Guerreiro das Sombras 1/7',
    subtitle: 'Edição Limitada • Apex Studio',
    description: 'Efeito de energia violeta translúcido • Base diorama com iluminação LED integrada',
    price: 849.90,
    qty: 1,
    serialInfo: 'Selo Toei Holográfico #0482/1500',
    scaleTag: '1/7 Scale',
    imageKey: 'figureWarrior'
  },
  {
    id: 'poster-tokyo',
    title: 'Pôster Wall Scroll Neo-Tokyo',
    subtitle: 'Arte Autoral • Tecido Premium',
    description: 'Dimensão 60×90cm com hastes magnéticas em madeira e cordão de suspensão',
    price: 149.90,
    qty: 1,
    serialInfo: 'Impressão UV Silk 300DPI',
    scaleTag: 'Wall Scroll',
    imageKey: 'posterTokyo'
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [catalogOnlyFavorites, setCatalogOnlyFavorites] = useState<boolean>(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'dados' | 'pedidos' | 'favoritos'>('dados');
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    getCurrentStoredUser()
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() => getStoredOrders());

  const [couponCode, setCouponCode] = useState<string>('SENAI10');
  const [couponApplied, setCouponApplied] = useState<boolean>(true);

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('otakuverse-theme');
    return saved ? saved === 'dark' : true;
  });

  const [images, setImages] = useState<ImageAssetMap>(() => {
    try {
      const saved = localStorage.getItem('otakuverse-image-urls');
      if (saved) {
        return { ...DEFAULT_IMAGE_URLS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_IMAGE_URLS;
  });

  const [cart, setCart] = useState<CartEntry[]>(() => {
    try {
      const saved = localStorage.getItem('otakuverse-cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CART;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('otakuverse-favorites');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['figure-warrior'];
  });

  const [isImageLinksModalOpen, setIsImageLinksModalOpen] = useState<boolean>(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    subtitle: string;
    icon: string;
  }>({
    visible: false,
    title: '',
    subtitle: '',
    icon: 'check_circle'
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('otakuverse-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('otakuverse-image-urls', JSON.stringify(images));
    } catch {
      // ignore
    }
  }, [images]);

  useEffect(() => {
    try {
      localStorage.setItem('otakuverse-cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('otakuverse-favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const triggerToast = (title: string, subtitle = '', icon = 'check_circle') => {
    setToast({ visible: true, title, subtitle, icon });
  };

  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleNavigate = (screen: ScreenName) => {
    if (screen !== 'catalog') {
      setCatalogOnlyFavorites(false);
    }
    if (screen !== 'profile') {
      setProfileInitialTab('dados');
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentStoredUser(null);
    setCurrentUser(null);
    triggerToast(
      'Sessão Encerrada',
      'Você saiu da sua conta. Seus dados continuam salvos no navegador.',
      'logout'
    );
    handleNavigate('login');
  };

  const handleQuickDemoLogin = () => {
    setCurrentStoredUser(DEFAULT_DEMO_USER);
    setCurrentUser(DEFAULT_DEMO_USER);
    triggerToast(
      'Conectado como Akira!',
      'Sessão demo iniciada e salva no localStorage.',
      'verified_user'
    );
    handleNavigate('profile');
  };

  const handleToggleFavorite = (id: string) => {
    const product = PRODUCTS.find((p) => p.id === id);
    const productName = product ? product.shortTitle : 'Produto';
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        triggerToast(
          'Removido dos Favoritos',
          `"${productName}" foi retirado da sua lista de favoritos.`,
          'favorite_border'
        );
        return prev.filter((item) => item !== id);
      } else {
        triggerToast(
          'Adicionado aos Favoritos! ♥',
          `"${productName}" salvo nos seus Favoritos.`,
          'favorite'
        );
        return [...prev, id];
      }
    });
  };

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.shortTitle,
          subtitle: product.subtitle,
          description: product.description,
          price: product.price,
          qty: 1,
          serialInfo: product.serialInfo || 'Lote Oficial Verificado',
          scaleTag: product.scaleTag || 'Oficial',
          imageKey: product.imageKey
        }
      ];
    });
    triggerToast(
      'Item adicionado ao carrinho!',
      `"${product.shortTitle}" incluído na sua encomenda.`,
      'shopping_bag'
    );
  };

  const handleAddCrossSell = (item: CrossSellItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [
        ...prev,
        {
          id: item.id,
          title: item.title,
          subtitle: 'Proteção & Conservação Museum-Grade',
          description: item.description,
          price: item.price,
          qty: 1,
          serialInfo: 'Acessório Oficial OtakuVerse',
          scaleTag: 'Custódia',
          icon: item.icon
        }
      ];
    });
    triggerToast(
      'Proteção Adicionada!',
      `"${item.title}" somado ao seu pedido #OTK-8942.`,
      'add_task'
    );
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const handleUpdateImage = (key: keyof ImageAssetMap, url: string) => {
    setImages((prev) => ({ ...prev, [key]: url }));
    triggerToast('Link de Imagem Atualizado!', `O ativo "${key}" agora usa a nova URL direta.`, 'link');
  };

  const handleResetImages = () => {
    setImages(DEFAULT_IMAGE_URLS);
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const favoriteProducts = PRODUCTS.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <TopNavBar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onOpenFavorites={() => setIsFavoritesModalOpen(true)}
        cartCount={totalCartItems}
        favoritesCount={favorites.length}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        editMode={editMode}
        onToggleEditMode={() => {
          setEditMode(!editMode);
          triggerToast(
            !editMode ? 'Modo Edição de Links Ativado' : 'Modo Edição Desativado',
            !editMode
              ? 'Passe o mouse sobre qualquer imagem e clique em "Link URL" para trocar o endereço direto.'
              : 'As imagens voltaram ao modo de visualização normal.',
            'link'
          );
        }}
        onOpenLinksModal={() => setIsImageLinksModalOpen(true)}
        images={images}
        onUpdateImage={handleUpdateImage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-grow">
        {currentScreen === 'home' && (
          <HomeScreen
            images={images}
            editMode={editMode}
            onUpdateImage={handleUpdateImage}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            searchQuery={searchQuery}
            onOpenImageLinksModal={() => setIsImageLinksModalOpen(true)}
            onTriggerToast={triggerToast}
          />
        )}

        {currentScreen === 'catalog' && (
          <CatalogProfileScreen
            images={images}
            editMode={editMode}
            onUpdateImage={handleUpdateImage}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onShowToast={(msg) => triggerToast(msg, 'Catálogo OtakuVerse atualizado.')}
            initialOnlyFavorites={catalogOnlyFavorites}
          />
        )}

        {currentScreen === 'checkout' && (
          <CheckoutScreen
            images={images}
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onAddCrossSell={handleAddCrossSell}
            onNavigate={handleNavigate}
            onTriggerToast={triggerToast}
            currentUser={currentUser}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponApplied={couponApplied}
            setCouponApplied={setCouponApplied}
          />
        )}

        {currentScreen === 'payment' && (
          <PaymentScreen
            images={images}
            cart={cart}
            couponCode={couponCode}
            couponApplied={couponApplied}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onTriggerToast={triggerToast}
            onOrderCompleted={(newOrder) => {
              setOrders((prev) => [newOrder, ...prev]);
            }}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterScreen
            onNavigate={handleNavigate}
            onRegisterSuccess={(user) => {
              setCurrentUser(user);
              handleNavigate('profile');
            }}
            onTriggerToast={triggerToast}
          />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            images={images}
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            onNavigate={handleNavigate}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              handleNavigate('profile');
            }}
            onTriggerToast={triggerToast}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            images={images}
            editMode={editMode}
            onUpdateImage={handleUpdateImage}
            currentUser={currentUser}
            orders={orders}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onLogout={handleLogout}
            onQuickDemoLogin={handleQuickDemoLogin}
            onNavigate={handleNavigate}
            onTriggerToast={triggerToast}
            initialTab={profileInitialTab}
          />
        )}
      </div>

      {currentScreen !== 'login' && (
        <Footer
          onNavigate={handleNavigate}
          images={images}
          editMode={editMode}
          onUpdateImage={handleUpdateImage}
        />
      )}

      {/* Favorites Modal / Drawer when clicking the Heart "Favoritos" button */}
      {isFavoritesModalOpen && (
        <div
          onClick={() => setIsFavoritesModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-surface-container rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>
                <div>
                  <h2 className="font-headline font-bold text-lg text-on-surface">
                    Meus Favoritos ({favoriteProducts.length})
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Produtos que você marcou com o coração no catálogo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFavoritesModalOpen(false)}
                className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer"
                aria-label="Fechar Favoritos"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Favorites List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {favoriteProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <span className="material-symbols-outlined text-5xl text-outline block">
                    favorite_border
                  </span>
                  <p className="font-headline font-bold text-base text-on-surface">
                    Sua lista de favoritos está vazia
                  </p>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    Clique no ícone de coração em qualquer produto na vitrine ou no catálogo para salvá-lo aqui.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFavoritesModalOpen(false);
                      handleNavigate('catalog');
                    }}
                    className="mt-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Explorar Produtos
                  </button>
                </div>
              ) : (
                favoriteProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-tertiary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-lowest shrink-0">
                        <SafeImage
                          src={images[product.imageKey]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary font-bold block">
                          {product.subtitle}
                        </span>
                        <h3 className="font-headline font-bold text-sm text-on-surface">
                          {product.title}
                        </h3>
                        <span className="font-mono font-bold text-sm text-primary block mt-0.5">
                          {formatBRL(product.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="px-3.5 py-2 rounded-lg bg-primary-container text-on-primary-container font-headline font-bold text-xs flex items-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                        <span>Adicionar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(product.id)}
                        title="Remover dos Favoritos"
                        className="p-2 rounded-lg bg-tertiary/15 text-tertiary hover:bg-error/20 hover:text-error transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFavoritesModalOpen(false);
                  setCatalogOnlyFavorites(true);
                  setCurrentScreen('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-tertiary">filter_alt</span>
                <span>Filtrar Favoritos no Catálogo</span>
              </button>

              <div className="flex items-center gap-2">
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsFavoritesModalOpen(false);
                      setProfileInitialTab('favoritos');
                      setCurrentScreen('profile');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-headline font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">account_circle</span>
                    <span>Ver no Meu Perfil</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFavoritesModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Image Links & HTML Exporter Modal */}
      <ImageLinksModal
        isOpen={isImageLinksModalOpen}
        onClose={() => setIsImageLinksModalOpen(false)}
        images={images}
        onUpdateImage={handleUpdateImage}
        onResetImages={handleResetImages}
        onTriggerToast={triggerToast}
      />

      {/* Global Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 bg-surface-container-highest/95 backdrop-blur-xl px-4 py-3.5 rounded-sm shadow-[0_12px_32px_rgba(0,0,0,0.6)] border border-primary/30 flex items-center gap-3 text-on-surface max-w-md ${
          toast.visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-9 h-9 rounded-sm bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
          <span className="material-symbols-outlined text-[20px]">{toast.icon}</span>
        </div>
        <div>
          <p className="font-headline text-sm font-bold text-on-surface">
            {toast.title}
          </p>
          {toast.subtitle && (
            <p className="text-xs text-on-surface-variant mt-0.5">{toast.subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
