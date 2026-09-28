import React, { useState, useRef, useMemo } from 'react';
import { ImageAssetMap, PRODUCTS, ProductItem, formatBRL } from '../data/storeData';
import { SafeImage } from '../components/SafeImage';
import { ScreenName } from '../components/Layout';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';

interface CatalogProfileScreenProps {
  images: ImageAssetMap;
  editMode: boolean;
  onUpdateImage: (key: keyof ImageAssetMap, newUrl: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onNavigate: (screen: ScreenName) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onShowToast: (msg: string) => void;
  initialOnlyFavorites?: boolean;
}

type PricePreset = 'all' | 'under300' | '300to700' | 'over700' | 'discount';
type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'discount' | 'name';
type AvailabilityFilter = 'all' | 'in-stock' | 'pre-order' | 'limited';
type ViewLayout = 'grid-2' | 'grid-3' | 'list';

const ALL_CATEGORIES = ['Figures & Estátuas', 'Posters & Wall Scrolls', 'Vestuário Techwear', 'Mangás & Artbooks'];
const ALL_SCALES = ['1/7 Scale', 'Chibi 10cm', 'A2 (42x59cm)', 'Techwear', 'Hardcover A4', '60x90cm'];
const ALL_FRANCHISES = [
  'Dark Souls / Berserk',
  'Cyberpunk / Sci-Fi',
  'Mecha / Eva',
  'Magical / Fantasy',
  'Streetwear / Akiba',
  'Artbook / Shonen',
];

export const CatalogProfileScreen: React.FC<CatalogProfileScreenProps> = ({
  images,
  editMode,
  onUpdateImage,
  onAddToCart,
  onNavigate,
  favorites,
  onToggleFavorite,
  searchQuery,
  onSearchChange,
  onShowToast,
  initialOnlyFavorites = false,
}) => {
  // Price filter states
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [pricePreset, setPricePreset] = useState<PricePreset>('all');

  // Category, scale, franchise, availability & sort states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedScales, setSelectedScales] = useState<string[]>([]);
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(initialOnlyFavorites);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid-2');
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  React.useEffect(() => {
    setOnlyFavorites(initialOnlyFavorites);
  }, [initialOnlyFavorites]);

  // Collector Profile interactive state
  const [profileSectionOpen, setProfileSectionOpen] = useState<boolean>(true);
  const [collectorName, setCollectorName] = useState('Akira Kurosawa');
  const [collectorEmail] = useState('akira.collector@otakuverse.jp');
  const [collectorTitle, setCollectorTitle] = useState('Curador de Figures 1/7');
  const [collectorBio, setCollectorBio] = useState(
    'Colecionador focado em estátuas de escala 1/7, edições limitadas de Dark Fantasy e Mecha clássico importados diretamente de Akihabara.'
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [directAvatarUrlInput, setDirectAvatarUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetSelect = (preset: PricePreset) => {
    setPricePreset(preset);
    if (preset === 'all') {
      setMinPrice(0);
      setMaxPrice(1500);
    } else if (preset === 'under300') {
      setMinPrice(0);
      setMaxPrice(300);
    } else if (preset === '300to700') {
      setMinPrice(300);
      setMaxPrice(700);
    } else if (preset === 'over700') {
      setMinPrice(700);
      setMaxPrice(1500);
    } else if (preset === 'discount') {
      setMinPrice(0);
      setMaxPrice(1500);
    }
  };

  const handleMinPriceChange = (val: number) => {
    const safeVal = Math.max(0, Math.min(val, maxPrice));
    setMinPrice(safeVal);
    setPricePreset('all');
  };

  const handleMaxPriceChange = (val: number) => {
    const safeVal = Math.max(minPrice, Math.min(val, 1500));
    setMaxPrice(safeVal);
    setPricePreset('all');
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleScale = (scale: string) => {
    setSelectedScales((prev) =>
      prev.includes(scale) ? prev.filter((s) => s !== scale) : [...prev, scale]
    );
  };

  const toggleFranchise = (franchise: string) => {
    setSelectedFranchises((prev) =>
      prev.includes(franchise) ? prev.filter((f) => f !== franchise) : [...prev, franchise]
    );
  };

  const resetAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(1500);
    setPricePreset('all');
    setSelectedCategories([]);
    setSelectedScales([]);
    setSelectedFranchises([]);
    setAvailabilityFilter('all');
    setOnlyFavorites(false);
    setSortBy('relevance');
    onSearchChange('');
    onShowToast('Todos os filtros do catálogo foram redefinidos.');
  };

  // Count products per category for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CATEGORIES.forEach((cat) => {
      counts[cat] = PRODUCTS.filter((p) => p.categoryLabel === cat).length;
    });
    return counts;
  }, []);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Price filter
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchesDiscountPreset = pricePreset === 'discount' ? Boolean(p.oldPrice && p.oldPrice > p.price) : true;

      // Category filter (empty = all categories)
      const matchesCat =
        selectedCategories.length === 0 || selectedCategories.includes(p.categoryLabel);

      // Scale filter
      const matchesScale =
        selectedScales.length === 0 || (p.scale && selectedScales.includes(p.scale));

      // Franchise filter
      const matchesFranchise =
        selectedFranchises.length === 0 || (p.franchise && selectedFranchises.includes(p.franchise));

      // Availability filter
      const matchesAvailability =
        availabilityFilter === 'all'
          ? true
          : availabilityFilter === 'in-stock'
          ? p.inStock && p.badge !== 'Pré-Venda'
          : availabilityFilter === 'pre-order'
          ? p.badge === 'Pré-Venda'
          : Boolean(p.badge && (p.badge.includes('Limitada') || p.badge.includes('Exclusivo') || p.badge.includes('Numerada')));

      // Favorites filter
      const matchesFav = onlyFavorites ? favorites.includes(p.id) : true;

      // Search query
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        (p.franchise && p.franchise.toLowerCase().includes(q)) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(q));

      return (
        matchesPrice &&
        matchesDiscountPreset &&
        matchesCat &&
        matchesScale &&
        matchesFranchise &&
        matchesAvailability &&
        matchesFav &&
        matchesSearch
      );
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'discount') {
        const discA = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const discB = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return discB - discA;
      }
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [
    minPrice,
    maxPrice,
    pricePreset,
    selectedCategories,
    selectedScales,
    selectedFranchises,
    availabilityFilter,
    onlyFavorites,
    favorites,
    searchQuery,
    sortBy,
  ]);

  const activeFilterCount =
    (minPrice > 0 || maxPrice < 1500 ? 1 : 0) +
    (pricePreset !== 'all' ? 1 : 0) +
    selectedCategories.length +
    selectedScales.length +
    selectedFranchises.length +
    (availabilityFilter !== 'all' ? 1 : 0) +
    (onlyFavorites ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setAvatarPreviewUrl(ev.target.result as string);
        onShowToast('Pré-visualização do avatar carregada!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = () => {
    if (avatarPreviewUrl) {
      onUpdateImage('avatar', avatarPreviewUrl);
      setAvatarPreviewUrl(null);
      onShowToast('Foto de perfil salva com sucesso!');
    }
  };

  const handleApplyDirectAvatarUrl = () => {
    if (directAvatarUrlInput.trim()) {
      onUpdateImage('avatar', directAvatarUrlInput.trim());
      setAvatarPreviewUrl(null);
      setDirectAvatarUrlInput('');
      setShowUrlInput(false);
      onShowToast('Link direto de avatar aplicado!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Sub-header Breadcrumb & Collector Status Bar */}
      <div className="bg-surface-container-low border-b border-outline-variant/15">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <button onClick={() => onNavigate('home')} className="hover:text-on-surface transition-colors">
              Início
            </button>
            <span className="text-outline">/</span>
            <span className="text-primary font-semibold">Catálogo Geral de Produtos</span>
            <span className="hidden sm:inline text-outline">•</span>
            <span className="hidden sm:inline text-on-surface-variant font-mono">
              {filteredProducts.length} de {PRODUCTS.length} itens exibidos
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-mono uppercase tracking-wider transition-all ${
                onlyFavorites
                  ? 'bg-secondary-container/25 border-secondary text-secondary font-bold'
                  : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-xs" style={onlyFavorites ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                favorite
              </span>
              Favoritos ({favorites.length})
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="text-on-surface-variant font-medium">Status:</span>
              <span className="text-tertiary font-bold tracking-wide uppercase font-mono">Colecionador Mestre Nv. 42</span>
            </div>
            <button
              onClick={() => {
                setProfileSectionOpen(true);
                document.getElementById('perfil-colecionador')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-primary hover:underline font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">manage_accounts</span>
              Personalizar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-grow max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-12">
        {/* SECTION 1: FULL PRODUCT CATALOG WITH MULTI-DIMENSIONAL & PRICE FILTERS */}
        <section aria-labelledby="catalog-heading">
          {/* Top Catalog Header + Quick Search & Price Bar */}
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-outline-variant/15">
              <div>
                <div className="inline-flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Acervo Oficial Akihabara • Importação Direta
                </div>
                <h1 id="catalog-heading" className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
                  Catálogo de Colecionáveis
                </h1>
                <p className="text-on-surface-variant text-sm mt-1">
                  Filtre por faixa de preço exata, categoria, escala, franquia ou disponibilidade imediata no Brasil.
                </p>
              </div>

              {/* Search + Sort + View Mode Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar figure, série, marca..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-sm pl-9 pr-8 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
                    Ordenar:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-surface-container-lowest text-on-surface text-xs font-medium px-3 py-2 rounded-sm border border-outline-variant/25 focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="price-asc">Menor Preço (R$ ↑)</option>
                    <option value="price-desc">Maior Preço (R$ ↓)</option>
                    <option value="discount">Maior Desconto (%)</option>
                    <option value="name">Ordem Alfabética (A–Z)</option>
                  </select>
                </div>

                {/* Layout Toggle */}
                <div className="hidden sm:flex items-center bg-surface-container-lowest p-1 rounded-sm border border-outline-variant/20">
                  <button
                    onClick={() => setViewLayout('grid-2')}
                    className={`p-1.5 rounded-sm transition-colors ${
                      viewLayout === 'grid-2' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Grade Editorial (2 Colunas)"
                  >
                    <span className="material-symbols-outlined text-base block">grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewLayout('grid-3')}
                    className={`p-1.5 rounded-sm transition-colors ${
                      viewLayout === 'grid-3' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Grade Compacta (3 Colunas)"
                  >
                    <span className="material-symbols-outlined text-base block">apps</span>
                  </button>
                  <button
                    onClick={() => setViewLayout('list')}
                    className={`p-1.5 rounded-sm transition-colors ${
                      viewLayout === 'list' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Visualização em Lista Técnica"
                  >
                    <span className="material-symbols-outlined text-base block">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Category Pills + Quick Price Range Pills */}
            <div className="pt-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Category Quick Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mr-1">
                  Categorias:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    setOnlyFavorites(false);
                  }}
                  className={`px-3 py-1.5 rounded-sm text-xs font-headline font-semibold transition-all cursor-pointer ${
                    selectedCategories.length === 0 && !onlyFavorites
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/15'
                  }`}
                >
                  Todas ({PRODUCTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyFavorites(!onlyFavorites)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-headline font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    onlyFavorites
                      ? 'bg-tertiary text-on-tertiary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:text-tertiary border border-outline-variant/15'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-xs"
                    style={onlyFavorites ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    favorite
                  </span>
                  <span>Favoritos ({favorites.length})</span>
                </button>
                {ALL_CATEGORIES.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-headline font-medium transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-primary/20 text-primary border border-primary/50 font-semibold'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/15'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] font-mono opacity-75">({categoryCounts[cat] || 0})</span>
                    </button>
                  );
                })}
              </div>

              {/* Price Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mr-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">payments</span>
                  Faixa Rápida:
                </span>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'under300', label: 'Até R$ 300' },
                  { id: '300to700', label: 'R$ 300 – R$ 700' },
                  { id: 'over700', label: 'Acima de R$ 700' },
                  { id: 'discount', label: '🔥 Em Oferta' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id as PricePreset)}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-mono uppercase tracking-wider transition-all border ${
                      pricePreset === preset.id
                        ? 'bg-tertiary/15 border-tertiary text-tertiary font-bold'
                        : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Ribbon (if any filter is active) */}
          {activeFilterCount > 0 && (
            <div className="mb-6 bg-surface-container px-4 py-3 rounded-sm border border-primary/25 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">filter_alt</span>
                  Filtros Ativos ({activeFilterCount}):
                </span>

                {(minPrice > 0 || maxPrice < 1500) && (
                  <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface text-xs font-mono px-2.5 py-1 rounded-sm border border-outline-variant/25">
                    Preço: R$ {minPrice} – R$ {maxPrice}
                    <button
                      onClick={() => {
                        setMinPrice(0);
                        setMaxPrice(1500);
                        setPricePreset('all');
                      }}
                      className="text-on-surface-variant hover:text-error"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                )}

                {pricePreset === 'discount' && (
                  <span className="inline-flex items-center gap-1.5 bg-secondary-container/30 text-secondary text-xs font-mono px-2.5 py-1 rounded-sm border border-secondary/30">
                    Apenas Ofertas
                    <button onClick={() => setPricePreset('all')} className="hover:text-on-surface">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                )}

                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface text-xs px-2.5 py-1 rounded-sm border border-outline-variant/25"
                  >
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="text-on-surface-variant hover:text-error">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}

                {selectedScales.map((sc) => (
                  <span
                    key={sc}
                    className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface text-xs font-mono px-2.5 py-1 rounded-sm border border-outline-variant/25"
                  >
                    Escala: {sc}
                    <button onClick={() => toggleScale(sc)} className="text-on-surface-variant hover:text-error">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}

                {selectedFranchises.map((fr) => (
                  <span
                    key={fr}
                    className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface text-xs px-2.5 py-1 rounded-sm border border-outline-variant/25"
                  >
                    {fr}
                    <button onClick={() => toggleFranchise(fr)} className="text-on-surface-variant hover:text-error">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}

                {availabilityFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface text-xs font-mono px-2.5 py-1 rounded-sm border border-outline-variant/25">
                    Status: {availabilityFilter}
                    <button onClick={() => setAvailabilityFilter('all')} className="text-on-surface-variant hover:text-error">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={resetAllFilters}
                className="text-xs font-mono uppercase tracking-wider text-secondary hover:underline font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Limpar Tudo
              </button>
            </div>
          )}

          {/* 12-Column Grid: Left Filter Sidebar (3 cols) + Product Showcase (9 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Filters (3 columns on lg) */}
            <aside className="lg:col-span-3 bg-surface-container-low p-5 rounded-sm border border-outline-variant/15 space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">tune</span>
                  Filtros Avançados
                </h2>
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-primary hover:underline font-mono"
                >
                  Limpar
                </button>
              </div>

              {/* 1. PRICE FILTER SECTION (WITH MIN/MAX INPUTS & DUAL-CONTROL SLIDER) */}
              <div className="space-y-4 bg-surface-container p-4 rounded-sm border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">attach_money</span>
                    Filtro de Preço
                  </h3>
                  <span className="font-mono text-[11px] text-primary font-semibold">
                    R$ {minPrice} – R$ {maxPrice}
                  </span>
                </div>

                {/* Numeric Min & Max Inputs */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-on-surface-variant mb-1">
                      Mínimo (R$)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={maxPrice}
                      step={20}
                      value={minPrice}
                      onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                      className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-sm px-2.5 py-1.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-on-surface-variant mb-1">
                      Máximo (R$)
                    </label>
                    <input
                      type="number"
                      min={minPrice}
                      max={1500}
                      step={20}
                      value={maxPrice}
                      onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                      className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-sm px-2.5 py-1.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Interactive Range Slider for Max Price */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                    <span>Teto de Preço:</span>
                    <span className="text-on-surface font-bold">Até R$ {maxPrice},00</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1500"
                    step="20"
                    value={maxPrice}
                    onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                    aria-label="Limite máximo de preço"
                    className="w-full accent-primary bg-surface-container-highest h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                    <span>R$ 100</span>
                    <span>R$ 750</span>
                    <span>R$ 1.500</span>
                  </div>
                </div>
              </div>

              {/* 2. CATEGORY CHECKBOXES */}
              <div className="space-y-3">
                <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Categoria de Produto
                </h3>
                <div className="space-y-2 text-sm">
                  {ALL_CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center justify-between gap-2.5 cursor-pointer group">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="rounded-sm bg-surface-container-lowest border-outline-variant text-primary focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-on-surface group-hover:text-primary transition-colors text-xs">
                          {cat}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-sm">
                        {categoryCounts[cat] || 0}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. AVAILABILITY STATUS */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/15">
                <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Disponibilidade & Lote
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'in-stock', label: 'Pronta Entrega' },
                    { id: 'pre-order', label: 'Pré-Venda' },
                    { id: 'limited', label: 'Ed. Limitada' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setAvailabilityFilter(st.id as AvailabilityFilter)}
                      className={`px-2.5 py-1.5 rounded-sm text-xs font-medium border text-left transition-all ${
                        availabilityFilter === st.id
                          ? 'bg-primary/15 border-primary text-primary font-semibold'
                          : 'bg-surface-container border-outline-variant/15 text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. SCALE / FORMAT */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/15">
                <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Escala & Formato
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SCALES.map((scale) => {
                    const active = selectedScales.includes(scale);
                    return (
                      <button
                        key={scale}
                        onClick={() => toggleScale(scale)}
                        className={`px-2.5 py-1 rounded-sm text-[11px] font-mono border transition-colors ${
                          active
                            ? 'bg-primary/20 border-primary text-primary font-bold'
                            : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {scale}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. FRANCHISE / UNIVERSE */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/15">
                <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Universo & Estética
                </h3>
                <div className="space-y-2">
                  {ALL_FRANCHISES.map((franchise) => (
                    <label key={franchise} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedFranchises.includes(franchise)}
                        onChange={() => toggleFranchise(franchise)}
                        className="rounded-sm bg-surface-container-lowest border-outline-variant text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-on-surface-variant group-hover:text-on-surface transition-colors text-xs">
                        {franchise}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid (9 columns on lg) */}
            <div className="lg:col-span-9">
              {filteredProducts.length === 0 ? (
                <div className="bg-surface-container-low border border-outline-variant/15 rounded-sm p-12 text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">search_off</span>
                  <h3 className="font-headline text-xl font-bold text-on-surface">
                    Nenhum colecionável encontrado nesta faixa de preço ou filtro
                  </h3>
                  <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                    Tente ampliar o limite máximo de preço (atualmente R$ {maxPrice}) ou redefinir as categorias selecionadas.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-sm"
                  >
                    Restaurar Todos os Produtos
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewLayout === 'list'
                      ? 'space-y-4'
                      : viewLayout === 'grid-3'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                      : 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                  }
                >
                  {filteredProducts.map((product) => {
                    const isFav = favorites.includes(product.id);
                    const discountPct =
                      product.oldPrice && product.oldPrice > product.price
                        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                        : null;

                    if (viewLayout === 'list') {
                      return (
                        <article
                          key={product.id}
                          className="group bg-surface-container-low rounded-sm border border-outline-variant/15 hover:border-primary/40 transition-all duration-300 flex flex-col sm:flex-row overflow-hidden"
                        >
                          <div className="relative sm:w-56 aspect-square sm:aspect-auto bg-surface-container-lowest overflow-hidden shrink-0">
                            <SafeImage
                              src={images[product.imageKey]}
                              alt={product.title}
                              assetKey={product.imageKey}
                              editMode={editMode}
                              onUpdateUrl={onUpdateImage}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            {product.badge && (
                              <span
                                className={`absolute top-3 left-3 ${
                                  product.badgeColor === 'secondary'
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : product.badgeColor === 'tertiary'
                                    ? 'bg-tertiary-container text-on-tertiary-container border border-tertiary/30'
                                    : 'bg-primary text-on-primary'
                                } text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-sm`}
                              >
                                {product.badge}
                              </span>
                            )}
                          </div>

                          <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
                                  {product.categoryLabel} • {product.scale}
                                </span>
                                {product.rating && (
                                  <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                                    ★ {product.rating} <span className="text-on-surface-variant">({product.reviewsCount})</span>
                                  </span>
                                )}
                              </div>
                              <h3
                                onClick={() => setQuickViewProduct(product)}
                                className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors cursor-pointer"
                              >
                                {product.title}
                              </h3>
                              <p className="text-xs text-on-surface-variant mt-1">{product.subtitle}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                {product.manufacturer && (
                                  <span className="text-[11px] font-mono bg-surface-container px-2 py-0.5 rounded-sm text-on-surface-variant">
                                    Fabricante: {product.manufacturer}
                                  </span>
                                )}
                                {product.franchise && (
                                  <span className="text-[11px] font-mono bg-surface-container px-2 py-0.5 rounded-sm text-on-surface-variant">
                                    {product.franchise}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-outline-variant/15 flex flex-wrap items-center justify-between gap-4">
                              <div>
                                {product.oldPrice ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-on-surface-variant line-through font-mono">
                                      {formatBRL(product.oldPrice)}
                                    </span>
                                    {discountPct && (
                                      <span className="text-[10px] font-mono font-bold bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-sm">
                                        -{discountPct}%
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-on-surface-variant block">Preço Oficial</span>
                                )}
                                <span className="font-mono font-bold text-xl text-on-surface">
                                  {formatBRL(product.price)}
                                </span>
                                <span className="text-[11px] text-tertiary font-mono block">{product.installment}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onToggleFavorite(product.id)}
                                  title={isFav ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
                                  className={`px-3 py-2.5 rounded-sm text-xs font-headline font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isFav
                                      ? 'bg-tertiary text-on-tertiary shadow-md'
                                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-tertiary'
                                  }`}
                                >
                                  <span
                                    className="material-symbols-outlined text-sm"
                                    style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                  >
                                    favorite
                                  </span>
                                  <span>{isFav ? 'Favoritado' : 'Favoritar'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setQuickViewProduct(product)}
                                  className="px-3 py-2.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-headline font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">visibility</span>
                                  Ficha Técnica
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onAddToCart(product)}
                                  className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                  Adicionar
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }

                    return (
                      <article
                        key={product.id}
                        className="group bg-surface-container-low rounded-sm border border-outline-variant/15 hover:border-primary/40 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 shadow-lg"
                      >
                        <div className="relative aspect-[4/3] w-full bg-surface-container-lowest overflow-hidden">
                          <SafeImage
                            src={images[product.imageKey]}
                            alt={product.title}
                            assetKey={product.imageKey}
                            editMode={editMode}
                            onUpdateUrl={onUpdateImage}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.badge && (
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span
                                className={`${
                                  product.badgeColor === 'secondary'
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : product.badgeColor === 'tertiary'
                                    ? 'bg-tertiary-container text-on-tertiary-container border border-tertiary/30'
                                    : 'bg-primary text-on-primary'
                                } text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-sm tracking-wider shadow-md`}
                              >
                                {product.badge}
                              </span>
                              {discountPct && (
                                <span className="bg-secondary text-on-secondary text-[10px] font-mono font-bold px-2 py-1 rounded-sm shadow-md">
                                  -{discountPct}%
                                </span>
                              )}
                            </div>
                          )}
                          <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(product.id);
                              }}
                              aria-label="Favoritar produto"
                              title={isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                              className={`px-2.5 h-8 rounded-sm backdrop-blur-md flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md ${
                                isFav
                                  ? 'bg-tertiary text-on-tertiary scale-105'
                                  : 'bg-surface-container-lowest/85 text-on-surface-variant hover:text-tertiary'
                              }`}
                            >
                              <span
                                className="material-symbols-outlined text-base"
                                style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                              >
                                favorite
                              </span>
                              {isFav && (
                                <span className="text-[10px] font-mono uppercase font-bold">
                                  Salvo
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickViewProduct(product);
                              }}
                              aria-label="Inspecionar peça"
                              title="Ficha Técnica e Link Direto"
                              className="w-8 h-8 self-end rounded-sm bg-surface-container-lowest/85 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-mono uppercase tracking-widest text-primary block">
                                {product.categoryLabel}
                              </span>
                              {product.scale && (
                                <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded-sm text-on-surface-variant border border-outline-variant/15">
                                  {product.scale}
                                </span>
                              )}
                            </div>
                            <h3
                              onClick={() => setQuickViewProduct(product)}
                              className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                            >
                              {product.title}
                            </h3>
                            <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                              {product.subtitle}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-outline-variant/15 flex items-end justify-between gap-2">
                            <div>
                              {product.oldPrice ? (
                                <span className="text-xs text-on-surface-variant line-through font-mono block">
                                  {formatBRL(product.oldPrice)}
                                </span>
                              ) : (
                                <span className="text-xs text-on-surface-variant block">À vista no PIX</span>
                              )}
                              <span className="font-mono font-bold text-xl text-on-surface">
                                {formatBRL(product.price)}
                              </span>
                              <span className="text-[11px] text-tertiary font-mono block">
                                {product.installment}
                              </span>
                            </div>
                            <button
                              onClick={() => onAddToCart(product)}
                              className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-all flex items-center gap-1.5 shadow-md shadow-primary/10 active:scale-95"
                            >
                              <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                              <span>Adicionar</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: COLLECTOR PROFILE & AVATAR CUSTOMIZATION (Collapsible / Accessible below catalog) */}
        <section
          id="perfil-colecionador"
          aria-labelledby="profile-heading"
          className="bg-surface-container-low rounded-sm border border-outline-variant/15 p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-widest mb-2">
                <span className="material-symbols-outlined text-xs">verified</span>
                Passaporte Oficial OtakuVerse
              </div>
              <h2 id="profile-heading" className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                Perfil do Colecionador & Avatar
              </h2>
            </div>
            <button
              onClick={() => setProfileSectionOpen(!profileSectionOpen)}
              className="self-start sm:self-auto px-3.5 py-2 rounded-sm bg-surface-container border border-outline-variant/20 text-xs font-mono uppercase tracking-wider text-on-surface hover:border-primary transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">
                {profileSectionOpen ? 'expand_less' : 'expand_more'}
              </span>
              {profileSectionOpen ? 'Recolher Painel' : 'Expandir Painel'}
            </button>
          </div>

          {profileSectionOpen && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
              {/* Avatar Upload & Preview Column */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-md overflow-hidden border-2 border-primary/50 shadow-[0_0_25px_rgba(124,58,237,0.25)] bg-surface-container-highest relative">
                    <SafeImage
                      src={avatarPreviewUrl || images.avatar}
                      alt="Foto de perfil atual do colecionador"
                      assetKey="avatar"
                      editMode={editMode}
                      onUpdateUrl={onUpdateImage}
                      className="w-full h-full object-cover"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-surface-container-lowest/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-primary text-2xl">photo_camera</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface mt-1">
                        Trocar Foto
                      </span>
                    </div>
                  </div>
                  <span
                    className="absolute -bottom-2 -right-2 bg-tertiary text-on-tertiary font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm shadow"
                    title="Nível Verificado"
                  >
                    PRO
                  </span>
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-on-surface">Sua Foto de Perfil</h3>
                    <p className="text-xs text-on-surface-variant">
                      Formatos suportados: JPG, PNG, WEBP ou Link Direto HTML.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer bg-surface-container-highest hover:bg-surface-bright text-on-surface font-headline text-xs font-semibold px-3.5 py-2 rounded-sm border border-outline-variant/30 transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">upload_file</span>
                      <span>Escolher Arquivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-mono text-xs px-3 py-2 rounded-sm border border-outline-variant/25 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm text-tertiary">link</span>
                      <span>Link Direto</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveAvatar}
                      disabled={!avatarPreviewUrl}
                      className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline text-xs font-bold px-4 py-2 rounded-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Salvar Foto
                    </button>
                  </div>

                  {showUrlInput && (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="url"
                        value={directAvatarUrlInput}
                        onChange={(e) => setDirectAvatarUrlInput(e.target.value)}
                        placeholder="https://exemplo.com/avatar.jpg"
                        className="bg-surface-container-lowest border border-outline-variant/30 rounded-sm px-2.5 py-1.5 text-xs text-on-surface font-mono w-full focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDirectAvatarUrl}
                        className="bg-tertiary text-on-tertiary font-mono text-xs font-bold px-3 py-1.5 rounded-sm shrink-0"
                      >
                        OK
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Collector Details Form */}
              <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-outline-variant/15 pt-6 lg:pt-0 lg:pl-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onShowToast('Dados do perfil de colecionador atualizados!');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <label htmlFor="collector-name" className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">
                      Nome de Exibição (Nickname)
                    </label>
                    <input
                      id="collector-name"
                      type="text"
                      value={collectorName}
                      onChange={(e) => setCollectorName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary rounded-sm px-3.5 py-2 text-sm text-on-surface focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="collector-title" className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">
                      Título de Colecionador
                    </label>
                    <select
                      id="collector-title"
                      value={collectorTitle}
                      onChange={(e) => setCollectorTitle(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary rounded-sm px-3.5 py-2 text-sm text-on-surface focus:outline-none transition-colors"
                    >
                      <option>Curador de Figures 1/7</option>
                      <option>Caçador de Edições Limitadas</option>
                      <option>Mestre do Mecha & Gunpla</option>
                      <option>Arquivista de Mangás Raros</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="collector-bio" className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">
                      Bio da Estante / Foco da Coleção ({collectorEmail})
                    </label>
                    <textarea
                      id="collector-bio"
                      rows={2}
                      value={collectorBio}
                      onChange={(e) => setCollectorBio(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary rounded-sm px-3.5 py-2 text-sm text-on-surface focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant">
                      <span>Peças Verificadas: <strong className="text-on-surface">14</strong></span>
                      <span>•</span>
                      <span>Lista de Desejos: <strong className="text-secondary">{favorites.length}</strong></span>
                    </div>
                    <button
                      type="submit"
                      className="bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface font-headline text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-colors"
                    >
                      Atualizar Dados do Perfil
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        images={images}
        isFavorite={quickViewProduct ? favorites.includes(quickViewProduct.id) : false}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
        onToggleFavorite={onToggleFavorite}
        onCopyDirectUrl={(url) => {
          navigator.clipboard.writeText(url);
          onShowToast('Link direto da imagem copiado!');
        }}
      />
    </div>
  );
};
