import React, { useState, useEffect } from 'react';
import { ImageAssetMap, PRODUCTS, ProductItem, formatBRL } from '../data/storeData';
import { SafeImage } from '../components/SafeImage';
import { ScreenName } from '../components/Layout';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';

interface HomeScreenProps {
  images: ImageAssetMap;
  editMode?: boolean;
  onUpdateImage?: (key: keyof ImageAssetMap, url: string) => void;
  searchQuery: string;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onNavigate: (screen: ScreenName, navKey?: string, categoryFilter?: string) => void;
  onOpenImageLinksModal?: () => void;
  onTriggerToast?: (title: string, subtitle: string, icon?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  images,
  searchQuery,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onNavigate,
  onOpenImageLinksModal = () => {},
  onTriggerToast = () => {}
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceBracket, setPriceBracket] = useState<string>('all');
  const [maxPriceSlider, setMaxPriceSlider] = useState<number>(1300);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [timer, setTimer] = useState({ hours: 8, mins: 42, secs: 19 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        let { hours, mins, secs } = prev;
        if (secs > 0) {
          secs -= 1;
        } else {
          secs = 59;
          if (mins > 0) {
            mins -= 1;
          } else {
            mins = 59;
            hours = hours > 0 ? hours - 1 : 8;
          }
        }
        return { hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePriceBracketChange = (value: string) => {
    setPriceBracket(value);
    if (value === 'under-150') setMaxPriceSlider(150);
    else if (value === '150-500') setMaxPriceSlider(500);
    else if (value === '500-1000') setMaxPriceSlider(1000);
    else setMaxPriceSlider(1300);
  };

  const homeProducts = PRODUCTS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'favorites'
        ? favorites.includes(item.id)
        : item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesBracket = true;
    if (priceBracket === 'under-150') matchesBracket = item.price <= 150;
    else if (priceBracket === '150-500') matchesBracket = item.price > 150 && item.price <= 500;
    else if (priceBracket === '500-1000') matchesBracket = item.price > 500 && item.price <= 1000;
    else if (priceBracket === 'above-1000') matchesBracket = item.price > 1000;

    const matchesSlider = item.price <= maxPriceSlider;

    return matchesCategory && matchesSearch && matchesBracket && matchesSlider;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const filterTabs = [
    { key: 'all', label: `Todas as Obras (${PRODUCTS.length})` },
    { key: 'favorites', label: `♥ Favoritos (${favorites.length})` },
    { key: 'figures', label: 'Figures 1/7 & 1/4 Scale' },
    { key: 'nendoroids', label: 'Nendoroid & Chibi' },
    { key: 'posters', label: 'Wall Scrolls & Pôsteres' },
    { key: 'apparel', label: 'Roupas & Streetwear Otaku' },
    { key: 'manga', label: 'Mangás & Artbooks' },
  ];

  const getBadgeStyle = (style: ProductItem['badgeMainStyle']) => {
    switch (style) {
      case 'tertiary':
        return 'bg-tertiary-container/90 text-on-tertiary-container';
      case 'secondary':
        return 'bg-secondary-container/90 text-on-secondary-container';
      case 'primary':
        return 'bg-primary-container/90 text-on-primary-container';
      default:
        return 'bg-surface-container-high/90 text-on-surface';
    }
  };

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setPriceBracket('all');
    setMaxPriceSlider(1300);
    setSortBy('featured');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Immersive Editorial Hero */}
      <section className="relative w-full -mt-8 overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary-container blur-[140px]"></div>
          <div className="absolute bottom-0 right-10 w-[500px] h-[500px] rounded-full bg-tertiary-container blur-[160px] opacity-30"></div>
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  className="text-secondary"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        <div className="relative max-w-[1440px] mx-auto px-margin-mobile md:px-margin pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col lg:flex-row items-center justify-between gap-space-xl">
          <div className="flex-1 max-w-2xl z-10">
            <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container/90 backdrop-blur-md shadow-sm mb-space-lg">
              <span className="flex h-2 w-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-badge text-label-badge uppercase tracking-widest text-primary">
                Ofertas Exclusivas Importadas do Japão 100% Originais
              </span>
            </div>

            <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero tracking-tight text-on-surface mb-space-md leading-none">
              O Seu Portal <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
                Definitivo
              </span>{' '}
              de Colecionáveis.
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl leading-relaxed max-w-xl">
              Curadoria museum-grade de scale figures 1/7, estátuas exclusivas, wall scrolls têxteis e peças autênticas diretamente de Akihabara para colecionadores exigentes.
            </p>

            <div className="flex flex-wrap items-center gap-space-md">
              <a
                href="#catalogo"
                className="px-space-xl py-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold shadow-[0_0_24px_rgba(124,58,237,0.45)] hover:shadow-[0_0_32px_rgba(124,58,237,0.7)] transition-all flex items-center gap-space-xs group"
              >
                <span>Explorar Catálogo</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  east
                </span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('catalog', 'catalogo-geral', 'all')}
                className="px-space-lg py-4 rounded-xl bg-surface-container-high/60 backdrop-blur-md text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-space-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <span>Catálogo Completo & Perfil</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-space-md mt-space-xl pt-space-lg bg-surface-container-low/40 rounded-xl px-space-md py-space-sm backdrop-blur-sm">
              <div>
                <p className="font-headline-lg text-headline-lg text-primary font-bold tabular-nums">
                  1.800+
                </p>
                <p className="font-body-sm text-body-sm text-outline">Peças Autênticas</p>
              </div>
              <div>
                <p className="font-headline-lg text-headline-lg text-tertiary font-bold">Zero</p>
                <p className="font-body-sm text-body-sm text-outline">Taxas Ocultas</p>
              </div>
              <div>
                <p className="font-headline-lg text-headline-lg text-secondary font-bold tabular-nums">
                  100%
                </p>
                <p className="font-body-sm text-body-sm text-outline">Garantia Toei/GS</p>
              </div>
            </div>
          </div>

          {/* Hero Focal Figure Showcase */}
          <div className="flex-1 w-full max-w-xl relative flex justify-center items-center">
            <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-[90px]"></div>
            <div className="relative w-full aspect-square max-w-[500px] rounded-full p-2 bg-gradient-to-tr from-surface-container-highest via-secondary-container/30 to-tertiary-container/30 shadow-[0_16px_48px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-surface-container-lowest flex items-center justify-center group">
                <SafeImage
                  alt="Guerreiro das Sombras com lâmina de energia roxa"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  src={images.figureWarrior}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6 right-6 p-space-md rounded-xl bg-surface-container-high/90 backdrop-blur-xl shadow-xl flex items-center justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-label-badge text-label-badge font-bold uppercase mb-1">
                      Destaque da Temporada
                    </span>
                    <p className="font-headline-md text-headline-md text-on-surface">
                      Shadow Knight 1/7
                    </p>
                    <p className="font-body-sm text-body-sm text-outline">
                      Efeito Lâmina Neon Fluorescente
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-label-badge text-label-badge text-outline block">
                      A partir de
                    </span>
                    <span className="font-headline-lg text-headline-lg text-primary font-bold tabular-nums">
                      R$ 849,90
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip / Trust Signals */}
      <section className="w-full bg-surface-container-low py-space-lg">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="p-space-md rounded-xl bg-surface-container flex items-start gap-space-md shadow-sm">
              <div className="p-3 rounded-lg bg-primary-container/20 text-primary">
                <span className="material-symbols-outlined text-[26px]">shield</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface text-base">
                  Embalagem Blindada
                </h2>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                  Tripla camada de plástico bolha reforçado anti-impacto para proteção total da caixa original.
                </p>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex items-start gap-space-md shadow-sm">
              <div className="p-3 rounded-lg bg-tertiary-container/20 text-tertiary">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface text-base">
                  100% Autêntico
                </h2>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                  Importação com lacres oficiais e selos holográficos Toei Animation, Good Smile e Aniplex.
                </p>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex items-start gap-space-md shadow-sm">
              <div className="p-3 rounded-lg bg-secondary-container/20 text-secondary">
                <span className="material-symbols-outlined text-[26px]">credit_card</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface text-base">
                  Parcelamento em 12x
                </h2>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                  Parcele sua coleção em até 12x sem juros no cartão ou garanta 10% OFF pagando via PIX.
                </p>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex items-start gap-space-md shadow-sm">
              <div className="p-3 rounded-lg bg-surface-variant text-on-surface-variant">
                <span className="material-symbols-outlined text-[26px]">support_agent</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface text-base">
                  Suporte Especializado
                </h2>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                  Equipe composta inteiramente por colecionadores para tirar dúvidas sobre escalas e lotes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Category Bar & Price Filter Controls */}
      <section className="w-full pt-space-xl pb-space-md" id="catalogo">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <span className="font-label-badge text-label-badge text-primary uppercase tracking-widest font-bold">
                Curadoria Exclusiva
              </span>
              <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface mt-1">
                Coleção em Evidência & Catálogo
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-body-sm text-body-sm text-outline max-w-md hidden sm:block">
                Explore estátuas em escala, artes em tecido e relíquias com filtro de preço em tempo real.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('catalog', 'catalogo-geral', 'all')}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-primary font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                <span>Abrir Página de Catálogo Geral</span>
              </button>
            </div>
          </div>

          {/* Filter & Price Control Panel */}
          <div className="bg-surface-container-low rounded-2xl p-space-md shadow-lg mb-space-md flex flex-col gap-space-md">
            {/* Row 1: Category Filter Pills */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
              {filterTabs.map((tab) => {
                const isActive = selectedCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedCategory(tab.key)}
                    className={`px-space-md py-2 rounded-full font-label-lg text-label-lg transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Row 2: Price Filter Dropdown, Interactive Slider, and Sort Selector */}
            <div className="pt-space-sm border-t border-outline-variant/20 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              {/* Price Range Quick Chips & Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md mr-1">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    payments
                  </span>
                  <span>Filtrar Preço:</span>
                </div>

                {[
                  { value: 'all', label: 'Todos os Preços' },
                  { value: 'under-150', label: 'Até R$ 150' },
                  { value: '150-500', label: 'R$ 150 a R$ 500' },
                  { value: '500-1000', label: 'R$ 500 a R$ 1.000' },
                  { value: 'above-1000', label: 'Acima de R$ 1.000' },
                ].map((bracket) => (
                  <button
                    key={bracket.value}
                    type="button"
                    onClick={() => handlePriceBracketChange(bracket.value)}
                    className={`px-3 py-1.5 rounded-xl font-label-md text-label-md transition-all cursor-pointer ${
                      priceBracket === bracket.value
                        ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm ring-1 ring-primary/40'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {bracket.label}
                  </button>
                ))}
              </div>

              {/* Slider + Sort Dropdown */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-surface-container px-3.5 py-1.5 rounded-xl">
                  <label
                    htmlFor="home-price-slider"
                    className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap"
                  >
                    Teto: <strong className="text-primary tabular-nums">{formatBRL(maxPriceSlider)}</strong>
                  </label>
                  <input
                    id="home-price-slider"
                    type="range"
                    min={130}
                    max={1300}
                    step={10}
                    value={maxPriceSlider}
                    onChange={(e) => {
                      setMaxPriceSlider(Number(e.target.value));
                      setPriceBracket('all');
                    }}
                    className="w-28 sm:w-36 accent-primary cursor-pointer"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Ordenar produtos por"
                  className="bg-surface-container px-space-md py-2 rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                >
                  <option value="featured">Ordenar: Relevância</option>
                  <option value="price-asc">Preço: Menor para Maior</option>
                  <option value="price-desc">Preço: Maior para Menor</option>
                </select>

                {(selectedCategory !== 'all' || priceBracket !== 'all' || maxPriceSlider < 1300 || sortBy !== 'featured') && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-highest text-tertiary hover:bg-tertiary-container hover:text-on-tertiary-container font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                    Limpar ({homeProducts.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Grid */}
      <section className="w-full pb-space-xl" id="destaques">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
          {homeProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {homeProducts.map((product) => {
                const isFav = favorites.includes(product.id);
                const imgUrl = images[product.imageKey];
                return (
                  <article
                    key={product.id}
                    className="group rounded-2xl bg-surface-container-low overflow-hidden shadow-md hover:shadow-[0_12px_36px_rgba(124,58,237,0.25)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square w-full bg-surface-container-lowest overflow-hidden">
                        <SafeImage
                          alt={product.title}
                          src={imgUrl}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-1 rounded-md backdrop-blur-md font-label-badge text-label-badge font-bold uppercase shadow-sm ${getBadgeStyle(
                              product.badgeMainStyle
                            )}`}
                          >
                            {product.badgeMain}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-highest/80 backdrop-blur-md text-primary font-label-badge text-label-badge font-semibold">
                            {product.badgeSub}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(product.id);
                          }}
                          aria-label={`Favoritar ${product.title}`}
                          title={isFav ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
                          className={`absolute top-3 right-3 z-30 px-2.5 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer shadow-md ${
                            isFav
                              ? 'bg-tertiary text-on-tertiary scale-105 ring-2 ring-white/30'
                              : 'bg-surface-container-highest/80 text-on-surface hover:bg-tertiary/20 hover:text-tertiary'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isFav ? 'material-symbols-filled' : ''
                            }`}
                            style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            favorite
                          </span>
                          {isFav && (
                            <span className="text-[10px] font-mono uppercase font-bold pr-0.5">
                              Salvo
                            </span>
                          )}
                        </button>

                        <div className="absolute bottom-3 left-3 bg-surface-container-high/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-body-sm text-outline">
                          {product.bottomOverlayTag}
                        </div>

                        <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(product)}
                            title="Ficha Técnica & Detalhes"
                            className="bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-label-badge text-secondary hover:text-primary flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">visibility</span>
                            Ficha
                          </button>
                          <button
                            type="button"
                            onClick={onOpenImageLinksModal}
                            title="Ver ou editar link direto desta imagem"
                            className="bg-surface-container-lowest/90 backdrop-blur-md px-2 py-1 rounded-md text-[11px] font-label-badge text-primary flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">link</span>
                            URL
                          </button>
                        </div>
                      </div>

                      <div className="p-space-md">
                        <div className="flex items-center gap-1 text-primary mb-1">
                          <span className="material-symbols-outlined material-symbols-filled text-[16px]">
                            star
                          </span>
                          <span className="material-symbols-outlined material-symbols-filled text-[16px]">
                            star
                          </span>
                          <span className="material-symbols-outlined material-symbols-filled text-[16px]">
                            star
                          </span>
                          <span className="material-symbols-outlined material-symbols-filled text-[16px]">
                            star
                          </span>
                          <span className="material-symbols-outlined material-symbols-filled text-[16px]">
                            {product.rating < 5 ? 'star_half' : 'star'}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline ml-1">
                            {product.reviewLabel}
                          </span>
                        </div>

                        <h3
                          onClick={() => setQuickViewProduct(product)}
                          className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                        >
                          {product.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-space-md pt-0">
                      <div className="flex items-baseline justify-between mb-space-sm pt-space-xs">
                        <div>
                          {product.oldPrice && (
                            <span className="font-body-sm text-body-sm text-outline line-through block text-xs tabular-nums">
                              {formatBRL(product.oldPrice)}
                            </span>
                          )}
                          <span className="font-headline-lg text-headline-lg text-on-surface font-bold tabular-nums">
                            {formatBRL(product.price)}
                          </span>
                        </div>
                        <span className="text-xs text-primary font-body-sm">
                          {product.installmentsText}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onAddToCart(product)}
                          className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-semibold flex items-center justify-center gap-space-xs hover:bg-inverse-primary hover:shadow-[0_0_16px_rgba(124,58,237,0.4)] transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                          <span>{product.ctaLabel}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(product.id)}
                          title={isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                          className={`p-3 rounded-xl transition-all cursor-pointer ${
                            isFav
                              ? 'bg-tertiary text-on-tertiary shadow-md'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-tertiary'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isFav ? 'material-symbols-filled' : ''
                            }`}
                            style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            favorite
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(product)}
                          title="Inspecionar Ficha Técnica"
                          className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-space-xl bg-surface-container-low rounded-3xl p-space-lg">
              <span className="material-symbols-outlined text-outline text-[48px] mb-2 block">
                filter_alt_off
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Nenhum item encontrado nesta faixa de preço
              </h3>
              <p className="font-body-md text-body-md text-outline mt-1">
                Tente aumentar o limite de preço ou limpar os filtros ativos.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-4 px-space-lg py-2.5 bg-primary-container text-on-primary-container rounded-xl font-label-lg text-label-lg font-semibold cursor-pointer"
              >
                Restaurar Todos os Produtos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Flash Offer Countdown Section */}
      <section id="ofertas" className="w-full py-space-xl bg-surface-container-lowest relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 via-transparent to-tertiary-container/10 pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin relative z-10">
          <div className="rounded-3xl bg-gradient-to-br from-surface-container to-surface-container-high p-space-lg md:p-space-xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-space-xl">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-badge text-label-badge font-bold uppercase mb-space-sm">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span>Oferta Relâmpago de Pré-Reserva</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface mb-space-sm leading-tight">
                Combo Colecionador Shonen: <br />
                Desconto de até <span className="text-primary font-bold">35% OFF</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg leading-relaxed">
                Reserve a estátua Kaelen Vane junto com o Wall Scroll Neo-Tokyo e ganhe o stand com acabamento em acrílico fumê inteiramente grátis.
              </p>
              <div className="flex flex-wrap items-center gap-space-md">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(PRODUCTS[2]);
                    onAddToCart(PRODUCTS[1]);
                    onNavigate('checkout', 'carrinho');
                  }}
                  className="px-space-xl py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_20px_rgba(210,187,255,0.4)] hover:shadow-[0_0_28px_rgba(210,187,255,0.6)] transition-all cursor-pointer"
                >
                  Resgatar Combo VIP
                </button>
                <span className="font-body-sm text-body-sm text-outline">
                  Resta apenas 14 combos
                </span>
              </div>
            </div>

            {/* Styled Timer Boxes */}
            <div className="flex items-center gap-space-sm sm:gap-space-md tabular-nums">
              <div className="flex flex-col items-center justify-center w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md shadow-md">
                <span className="font-display-hero text-headline-xl sm:text-display-hero-mobile text-primary font-bold">
                  {String(timer.hours).padStart(2, '0')}
                </span>
                <span className="font-label-badge text-label-badge text-outline uppercase tracking-wider">
                  Horas
                </span>
              </div>
              <span className="font-headline-xl text-headline-xl text-outline">:</span>
              <div className="flex flex-col items-center justify-center w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md shadow-md">
                <span className="font-display-hero text-headline-xl sm:text-display-hero-mobile text-tertiary font-bold">
                  {String(timer.mins).padStart(2, '0')}
                </span>
                <span className="font-label-badge text-label-badge text-outline uppercase tracking-wider">
                  Min
                </span>
              </div>
              <span className="font-headline-xl text-headline-xl text-outline">:</span>
              <div className="flex flex-col items-center justify-center w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md shadow-md">
                <span className="font-display-hero text-headline-xl sm:text-display-hero-mobile text-secondary font-bold">
                  {String(timer.secs).padStart(2, '0')}
                </span>
                <span className="font-label-badge text-label-badge text-outline uppercase tracking-wider">
                  Seg
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collector Showcase & Community Unboxing Gallery */}
      <section className="w-full py-space-xl bg-surface">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <span className="font-label-badge text-label-badge text-tertiary uppercase tracking-widest font-bold">
                #OtakuVerseClub
              </span>
              <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface mt-1">
                Showcase de Colecionadores
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-outline max-w-md">
              Confira o display real na estante dos nossos clientes e membros verificados da comunidade brasileira de colecionáveis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {/* Review 1 */}
            <article className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-space-sm mb-space-md">
                  <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-lg">
                    RF
                  </div>
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface text-base">
                      Rodrigo F. (São Paulo - SP)
                    </p>
                    <p className="font-body-sm text-body-sm text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        verified
                      </span>{' '}
                      Colecionador Nível 4
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-primary mb-space-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className="material-symbols-outlined material-symbols-filled text-[16px]"
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-space-md">
                  "A estátua do Guerreiro das Sombras superou qualquer expectativa. A lâmina roxa reflete sob a fita de LED do nicho perfeitamente. A embalagem veio à prova de bomba!"
                </p>
              </div>
              <div className="w-full h-44 rounded-xl overflow-hidden bg-surface-container-lowest">
                <SafeImage
                  alt="Unboxing do Guerreiro das Sombras na estante"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                  src={images.figureWarrior}
                />
              </div>
            </article>

            {/* Review 2 */}
            <article className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-space-sm mb-space-md">
                  <div className="w-12 h-12 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary font-bold text-lg">
                    MC
                  </div>
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface text-base">
                      Marina C. (Curitiba - PR)
                    </p>
                    <p className="font-body-sm text-body-sm text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">
                        verified
                      </span>{' '}
                      Compradora Verificada
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-primary mb-space-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className="material-symbols-outlined material-symbols-filled text-[16px]"
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-space-md">
                  "O wall scroll tem tecido encorpado e nada de brilho plástico barato. As cores cyberpunk em neon são ultra vivas, dá outra vida para o meu setup de stream."
                </p>
              </div>
              <div className="w-full h-44 rounded-xl overflow-hidden bg-surface-container-lowest">
                <SafeImage
                  alt="Wall scroll ambientado na parede da cliente"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  src={images.posterTokyo}
                />
              </div>
            </article>

            {/* Review 3 */}
            <article className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-space-sm mb-space-md">
                  <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary font-bold text-lg">
                    TM
                  </div>
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface text-base">
                      Tiago M. (Belo Horizonte - MG)
                    </p>
                    <p className="font-body-sm text-body-sm text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-secondary">
                        verified
                      </span>{' '}
                      Pré-venda VIP
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-primary mb-space-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className="material-symbols-outlined material-symbols-filled text-[16px]"
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-space-md">
                  "Acompanhei a pré-venda da Kaelen Vane com receio do desembaraço alfandegário, mas a OtakuVerse cuidou de absolutamente tudo. Chegou sem qualquer taxa extra!"
                </p>
              </div>
              <div className="w-full h-44 rounded-xl overflow-hidden bg-surface-container-lowest">
                <SafeImage
                  alt="Figure Kaelen Vane exposta com caixa de colecionador"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  src={images.figureMecha}
                />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        images={images}
        isFavorite={quickViewProduct ? favorites.includes(quickViewProduct.id) : false}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
        onToggleFavorite={onToggleFavorite}
        onCopyUrl={(url, label) => {
          navigator.clipboard.writeText(url);
          onTriggerToast('Link Direto Copiado!', `URL de "${label}" copiada.`, 'link');
        }}
      />
    </div>
  );
};
