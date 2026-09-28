import React from 'react';
import { UserProfile } from '../data/authStorage';
import { ImageAssetMap } from '../data/storeData';
import { SafeImage } from './SafeImage';

export type ScreenName =
  | 'home'
  | 'catalog'
  | 'checkout'
  | 'payment'
  | 'register'
  | 'login'
  | 'profile';

interface TopNavBarProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  onOpenFavorites: () => void;
  cartCount: number;
  favoritesCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  onOpenLinksModal: () => void;
  images: ImageAssetMap;
  onUpdateImage: (key: keyof ImageAssetMap, newUrl: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentScreen,
  onNavigate,
  onOpenFavorites,
  cartCount,
  favoritesCount,
  isDark,
  onToggleTheme,
  editMode,
  images,
  onUpdateImage,
  searchQuery,
  onSearchChange,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleMobileNav = (screen: ScreenName) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-container-low/95 backdrop-blur-xl border-b border-outline-variant/15">
      {/* Main Neo-Akiba Header */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3 lg:gap-8">
          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Abrir menu de navegação"
            aria-expanded={mobileMenuOpen}
            className="lg:hidden p-2 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleMobileNav('home')}
            className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-gradient-to-br from-primary-container to-secondary-container p-0.5 shadow-lg shadow-primary-container/20 shrink-0">
              <div className="w-full h-full bg-surface-container-lowest rounded-[5px] flex items-center justify-center overflow-hidden">
                <SafeImage
                  src={images.logo}
                  alt="OtakuVerse Logo"
                  assetKey="logo"
                  editMode={editMode}
                  onUpdateUrl={onUpdateImage}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain group-hover:scale-110 transition-transform"
                />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-bold tracking-tighter text-on-surface font-headline block leading-none">
                Otaku<span className="text-primary">Verse</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-tertiary block mt-0.5">
                Akihabara Direct
              </span>
            </div>
          </button>

          <nav aria-label="Navegação Principal" className="hidden lg:flex items-center gap-6 text-sm font-headline tracking-tight">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`transition-colors py-1 cursor-pointer ${currentScreen === 'home'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
                }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className={`transition-colors py-1 cursor-pointer ${currentScreen === 'catalog'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
                }`}
            >
              Catálogo de Produtos
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="text-on-surface-variant hover:text-on-surface font-medium transition-colors py-1 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ofertas</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-secondary-container text-on-secondary-container rounded-sm font-bold">
                Hot
              </span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('payment')}
              className={`transition-colors py-1 cursor-pointer ${currentScreen === 'payment'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
                }`}
            >
              Pagamento
            </button>
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          <div className="hidden md:flex items-center bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3.5 py-2 w-48 lg:w-64 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentScreen !== 'catalog' && e.target.value.trim().length > 0) {
                  onNavigate('catalog');
                }
              }}
              placeholder="Buscar figures, mangás..."
              aria-label="Buscar produtos"
              className="bg-transparent border-none text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none w-full font-body"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            ) : (
              <kbd className="hidden sm:inline-block text-[10px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-sm">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Alternar tema Claro/Escuro"
            className="p-2 sm:p-2.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/15 flex items-center justify-center cursor-pointer"
            title="Alternar Modo Claro / Escuro"
          >
            <span className="material-symbols-outlined text-xl">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Favorites Button (Heart) */}
          <button
            type="button"
            onClick={onOpenFavorites}
            aria-label="Favoritos"
            title="Ver Meus Produtos Favoritos"
            className={`relative px-2.5 sm:px-3 py-2 rounded-sm transition-all border flex items-center gap-1.5 cursor-pointer ${favoritesCount > 0
                ? 'bg-tertiary/15 hover:bg-tertiary/25 text-tertiary border-tertiary/40'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-tertiary border-outline-variant/15'
              }`}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={favoritesCount > 0 ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
            <span className="hidden xl:inline text-xs font-headline font-bold">
              Favoritos
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-full font-mono text-[10px] font-bold flex items-center justify-center ${favoritesCount > 0
                  ? 'bg-tertiary text-on-tertiary'
                  : 'bg-surface-container-highest text-on-surface-variant'
                }`}
            >
              {favoritesCount}
            </span>
          </button>

          {/* Shopping Cart */}
          <button
            type="button"
            onClick={() => onNavigate('checkout')}
            aria-label="Carrinho de Compras"
            className="relative p-2 sm:p-2.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/15 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-container text-on-primary-container font-mono text-[11px] font-bold flex items-center justify-center shadow-md">
              {cartCount}
            </span>
          </button>

          <div className="h-6 w-[1px] bg-outline-variant/20 hidden sm:block"></div>

          {/* Auth / Profile Buttons */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1.5 rounded-sm border transition-all cursor-pointer ${currentScreen === 'profile'
                    ? 'bg-primary/15 border-primary text-primary'
                    : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/25 text-on-surface'
                  }`}
                title="Acessar Área de Perfil do Colecionador"
              >
                <div className="w-7 h-7 rounded-sm overflow-hidden border border-primary/40 shrink-0 bg-surface-container-lowest">
                  <SafeImage
                    src={currentUser.avatarUrl || images.avatar}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block text-xs font-headline font-bold leading-none text-on-surface">
                    {currentUser.nickname || currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className="block text-[10px] font-mono text-tertiary leading-none mt-0.5">
                    Meu Perfil
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Sair da Conta"
                className="p-2 rounded-sm bg-surface-container hover:bg-error/20 text-on-surface-variant hover:text-error border border-outline-variant/15 transition-colors hidden sm:flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="px-3 py-2 text-xs font-headline font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="px-3.5 py-2 rounded-sm bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline text-xs font-bold tracking-wide uppercase shadow-lg shadow-primary-container/25 hover:opacity-95 transition-all cursor-pointer"
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Menu Mobile"
          className="lg:hidden bg-surface-container border-t border-outline-variant/20 px-4 py-4 space-y-3"
        >
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant/25 rounded-sm px-3 py-2">
            <span className="material-symbols-outlined text-on-surface-variant text-base mr-2">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentScreen !== 'catalog' && e.target.value.trim().length > 0) {
                  onNavigate('catalog');
                }
              }}
              placeholder="Buscar figures, mangás, posters..."
              className="bg-transparent border-none text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-headline font-bold">
            <button
              type="button"
              onClick={() => handleMobileNav('home')}
              className={`p-2.5 rounded-sm flex items-center gap-2 border cursor-pointer ${currentScreen === 'home'
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/15 text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-base">home</span>
              <span>Início</span>
            </button>
            <button
              type="button"
              onClick={() => handleMobileNav('catalog')}
              className={`p-2.5 rounded-sm flex items-center gap-2 border cursor-pointer ${currentScreen === 'catalog'
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/15 text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>Catálogo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleMobileNav('home');
                setTimeout(() => {
                  document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' });
                }, 60);
              }}
              className="p-2.5 rounded-sm flex items-center gap-2 border bg-surface-container-low border-outline-variant/15 text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-secondary">local_fire_department</span>
              <span>Ofertas Hot</span>
            </button>
            <button
              type="button"
              onClick={() => handleMobileNav('checkout')}
              className={`p-2.5 rounded-sm flex items-center gap-2 border cursor-pointer ${currentScreen === 'checkout'
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/15 text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-base">shopping_bag</span>
              <span>Carrinho ({cartCount})</span>
            </button>
            <button
              type="button"
              onClick={() => handleMobileNav('payment')}
              className={`p-2.5 rounded-sm flex items-center gap-2 border cursor-pointer ${currentScreen === 'payment'
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/15 text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-base">payments</span>
              <span>Pagamento</span>
            </button>
            <button
              type="button"
              onClick={() => handleMobileNav(currentUser ? 'profile' : 'login')}
              className={`p-2.5 rounded-sm flex items-center gap-2 border cursor-pointer ${currentScreen === 'profile' || currentScreen === 'login'
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/15 text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-base">account_circle</span>
              <span>{currentUser ? 'Meu Perfil' : 'Entrar / Conta'}</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

interface FooterProps {
  onNavigate: (screen: ScreenName) => void;
  images: ImageAssetMap;
  editMode: boolean;
  onUpdateImage: (key: keyof ImageAssetMap, newUrl: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  images,
  editMode,
  onUpdateImage,
}) => {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/15 pt-16 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-outline-variant/15">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-primary-container to-secondary-container p-0.5">
                <div className="w-full h-full bg-surface-container-lowest rounded-[5px] flex items-center justify-center overflow-hidden">
                  <SafeImage
                    src={images.logo}
                    alt="OtakuVerse Logo"
                    assetKey="logo"
                    editMode={editMode}
                    onUpdateUrl={onUpdateImage}
                    className="w-7 h-7 object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tighter text-on-surface font-headline">
                Otaku<span className="text-primary">Verse</span>
              </span>
            </div>
            <p className="text-on-surface-variant text-sm max-w-sm leading-relaxed">
              Curadoria especializada em Action Figures escaladas, Nendoroids, Mangás e Artbooks originais importados diretamente do Japão para colecionadores exigentes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant font-mono text-[11px] rounded-sm border border-outline-variant/15">
                CNPJ 48.991.002/0001-88
              </span>
              <span className="px-2.5 py-1 bg-tertiary/10 text-tertiary font-mono text-[11px] rounded-sm border border-tertiary/20">
                Selo Akiba Authentic
              </span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface">
              Categorias
            </h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li>
                <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-primary transition-colors cursor-pointer">
                  Scale Figures (1/7 & 1/4)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-primary transition-colors cursor-pointer">
                  Nendoroids & Chibis
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-primary transition-colors cursor-pointer">
                  Posters & Fine Art
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-primary transition-colors cursor-pointer">
                  Moda Streetwear Otaku
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-primary transition-colors cursor-pointer">
                  Mangás & Artbooks
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface">
              Acesso Rápido
            </h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li>
                <button type="button" onClick={() => onNavigate('profile')} className="hover:text-primary transition-colors cursor-pointer">
                  Área de Perfil do Colecionador
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('login')} className="hover:text-primary transition-colors cursor-pointer">
                  Entrar na Minha Conta
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('register')} className="hover:text-primary transition-colors cursor-pointer">
                  Criar Conta de Colecionador
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('checkout')} className="hover:text-primary transition-colors cursor-pointer">
                  Carrinho de Compras
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('payment')} className="hover:text-primary transition-colors cursor-pointer">
                  Forma de Pagamento
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface">
              Atendimento
            </h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">mail</span>
                <span>suporte@otakuverse.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-base">schedule</span>
                <span>Seg a Sex: 09h às 19h</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">location_on</span>
                <span>Liberdade, São Paulo - SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>© 2025 OtakuVerse Collector Hub. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-6">
            <button type="button" onClick={() => onNavigate('home')} className="hover:text-on-surface transition-colors cursor-pointer">
              Termos de Uso
            </button>
            <button type="button" onClick={() => onNavigate('home')} className="hover:text-on-surface transition-colors cursor-pointer">
              Privacidade
            </button>
            <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-on-surface transition-colors cursor-pointer">
              Garantia de Autenticidade
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
