import React, { useState, useRef, useEffect } from 'react';
import { ImageAssetMap, PRODUCTS, ProductItem, formatBRL } from '../data/storeData';
import {
  UserProfile,
  OrderRecord,
  DEFAULT_DEMO_USER,
  updateStoredUserProfile,
} from '../data/authStorage';
import { SafeImage } from '../components/SafeImage';
import { ScreenName } from '../components/Layout';

interface ProfileScreenProps {
  images: ImageAssetMap;
  editMode: boolean;
  onUpdateImage: (key: keyof ImageAssetMap, newUrl: string) => void;
  currentUser: UserProfile | null;
  orders: OrderRecord[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onQuickDemoLogin: () => void;
  onNavigate: (screen: ScreenName) => void;
  onTriggerToast: (title: string, subtitle: string, icon?: string) => void;
  initialTab?: 'dados' | 'pedidos' | 'favoritos';
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  images,
  editMode,
  onUpdateImage,
  currentUser,
  orders,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onUpdateUser,
  onLogout,
  onQuickDemoLogin,
  onNavigate,
  onTriggerToast,
  initialTab = 'dados',
}) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'pedidos' | 'favoritos'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Form states synced with currentUser
  const [fullName, setFullName] = useState(currentUser?.fullName || DEFAULT_DEMO_USER.fullName);
  const [nickname, setNickname] = useState(currentUser?.nickname || DEFAULT_DEMO_USER.nickname);
  const [email, setEmail] = useState(currentUser?.email || DEFAULT_DEMO_USER.email);
  const [phone, setPhone] = useState(currentUser?.phone || DEFAULT_DEMO_USER.phone);
  const [cpf, setCpf] = useState(currentUser?.cpf || DEFAULT_DEMO_USER.cpf);
  const [collectorTitle, setCollectorTitle] = useState(
    currentUser?.collectorTitle || DEFAULT_DEMO_USER.collectorTitle
  );
  const [bio, setBio] = useState(currentUser?.bio || DEFAULT_DEMO_USER.bio);
  const [cep, setCep] = useState(currentUser?.cep || DEFAULT_DEMO_USER.cep);
  const [street, setStreet] = useState(currentUser?.street || DEFAULT_DEMO_USER.street);
  const [number, setNumber] = useState(currentUser?.number || DEFAULT_DEMO_USER.number);
  const [complement, setComplement] = useState(
    currentUser?.complement || DEFAULT_DEMO_USER.complement
  );
  const [neighborhood, setNeighborhood] = useState(
    currentUser?.neighborhood || DEFAULT_DEMO_USER.neighborhood
  );
  const [city, setCity] = useState(currentUser?.city || DEFAULT_DEMO_USER.city);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showUrlBox, setShowUrlBox] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setNickname(currentUser.nickname);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setCpf(currentUser.cpf);
      setCollectorTitle(currentUser.collectorTitle);
      setBio(currentUser.bio);
      setCep(currentUser.cep);
      setStreet(currentUser.street);
      setNumber(currentUser.number);
      setComplement(currentUser.complement);
      setNeighborhood(currentUser.neighborhood);
      setCity(currentUser.city);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16">
        <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/25 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">lock_person</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Área Exclusiva do Colecionador
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Faça login com sua conta cadastrada no <strong>localStorage</strong> ou crie seu
            passaporte gratuito para gerenciar seu perfil, avatar e histórico de pedidos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="px-5 py-3 rounded-xl bg-primary-container text-on-primary-container font-headline font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Ir para Login
            </button>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Criar Nova Conta
            </button>
            <button
              type="button"
              onClick={onQuickDemoLogin}
              className="px-5 py-3 rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/30 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Entrar com Conta Demo (Akira)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      fullName,
      nickname,
      email,
      phone,
      cpf,
      collectorTitle,
      bio,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
    };
    updateStoredUserProfile(updated);
    onUpdateUser(updated);
    onTriggerToast(
      'Perfil Salvo no localStorage!',
      'Seus dados pessoais e endereço foram atualizados.',
      'verified_user'
    );
  };

  const handleFileAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const updated = { ...currentUser, avatarUrl: reader.result };
        updateStoredUserProfile(updated);
        onUpdateUser(updated);
        onTriggerToast('Foto de Perfil Atualizada!', 'Salva na sua conta do navegador.', 'photo_camera');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAvatarUrl = () => {
    if (!avatarUrlInput.trim()) return;
    const updated = { ...currentUser, avatarUrl: avatarUrlInput.trim() };
    updateStoredUserProfile(updated);
    onUpdateUser(updated);
    onUpdateImage('avatar', avatarUrlInput.trim());
    setShowUrlBox(false);
    setAvatarUrlInput('');
  };

  const favoriteProducts = PRODUCTS.filter((p) => favorites.includes(p.id));

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Collector Header Banner */}
      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-primary shadow-[0_0_25px_rgba(124,58,237,0.3)] bg-surface-container-highest">
                <SafeImage
                  src={currentUser.avatarUrl || images.avatar}
                  alt={currentUser.fullName}
                  assetKey="avatar"
                  editMode={editMode}
                  onUpdateUrl={onUpdateImage}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-md bg-primary text-on-primary font-mono text-[10px] font-bold uppercase shadow-md cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">photo_camera</span>
                <span>Foto</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileAvatar}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-mono text-[11px] font-bold uppercase">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>Conta Autenticada • Membro desde {currentUser.createdAt}</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
                {currentUser.fullName}
              </h1>
              <p className="text-sm font-mono text-primary">
                @{currentUser.nickname} • {currentUser.collectorTitle}
              </p>
              <p className="text-xs text-on-surface-variant max-w-xl">{currentUser.bio}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUrlBox(!showUrlBox)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-mono text-on-surface-variant hover:text-on-surface border border-outline-variant/20 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-primary">link</span>
                  <span>Trocar Avatar via Link Direto</span>
                </button>
              </div>

              {showUrlBox && (
                <div className="pt-2 flex items-center gap-2 max-w-md">
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/meu-avatar.jpg"
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs font-mono text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={handleApplyAvatarUrl}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-mono font-bold cursor-pointer"
                  >
                    Salvar URL
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-headline font-semibold border border-outline-variant/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>Explorar Catálogo</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-error/15 hover:bg-error/25 text-error text-xs font-headline font-bold border border-error/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/20 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('dados')}
          className={`px-4 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'dados'
              ? 'bg-primary text-on-primary shadow-lg'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">badge</span>
          <span>Meus Dados & Endereço</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`px-4 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pedidos'
              ? 'bg-primary text-on-primary shadow-lg'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">receipt_long</span>
          <span>Meus Pedidos ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favoritos')}
          className={`px-4 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'favoritos'
              ? 'bg-primary text-on-primary shadow-lg'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">favorite</span>
          <span>Lista de Desejos ({favoriteProducts.length})</span>
        </button>
      </div>

      {/* TAB 1: DADOS & ENDEREÇO */}
      {activeTab === 'dados' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-surface-container rounded-2xl p-6 sm:p-8 border border-outline-variant/20 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
            <div>
              <h2 className="font-headline font-bold text-xl text-on-surface">
                Dados Cadastrais & Endereço de Entrega
              </h2>
              <p className="text-xs text-on-surface-variant">
                Alterações salvas automaticamente no armazenamento local (`localStorage`) do seu navegador.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-primary/15 text-primary font-mono text-xs font-bold">
              localStorage Ativo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                Nickname / Usuário
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                Título no Clube OtakuVerse
              </label>
              <select
                value={collectorTitle}
                onChange={(e) => setCollectorTitle(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option>Curador de Figures 1/7</option>
                <option>Caçador de Edições Limitadas</option>
                <option>Mestre do Mecha & Gunpla</option>
                <option>Arquivista de Mangás Raros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                WhatsApp / Celular
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                CPF (Nota Fiscal)
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                Bio da Coleção
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/15">
            <h3 className="font-headline font-bold text-base text-on-surface mb-3">
              Endereço Principal de Recebimento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Rua / Logradouro
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Cidade / UF
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary-container text-on-primary-container font-headline font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Salvar Alterações no Perfil</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MEUS PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-surface-container rounded-2xl p-8 text-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">
                inventory_2
              </span>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Nenhum pedido finalizado ainda
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                Quando você concluir um pagamento na tela de Forma de Pagamento, ele aparecerá aqui.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('checkout')}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase cursor-pointer"
              >
                Ir para Meu Carrinho
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 space-y-4 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-outline-variant/15">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-primary">
                        Pedido #{order.id}
                      </span>
                      <span className="text-xs text-outline">• {order.createdAt}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {order.paymentDetails} — Entrega: {order.shippingAddress}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-tertiary/15 text-tertiary font-mono text-xs font-bold">
                      {order.status}
                    </span>
                    <strong className="font-mono text-lg text-on-surface">
                      {formatBRL(order.total)}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-surface-container-low flex items-center gap-3"
                    >
                      {item.imageKey && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-lowest shrink-0">
                          <SafeImage
                            src={images[item.imageKey]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-headline font-bold text-xs text-on-surface truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] font-mono text-outline">
                          {item.qty}x • {formatBRL(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FAVORITOS */}
      {activeTab === 'favoritos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.length === 0 ? (
            <div className="sm:col-span-3 bg-surface-container rounded-2xl p-8 text-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">
                favorite_border
              </span>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Sua lista de desejos está vazia
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase cursor-pointer"
              >
                Explorar Colecionáveis
              </button>
            </div>
          ) : (
            favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/20 flex flex-col justify-between"
              >
                <div className="aspect-[4/3] bg-surface-container-lowest relative">
                  <SafeImage
                    src={images[product.imageKey]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 text-secondary flex items-center justify-center cursor-pointer"
                    title="Remover dos favoritos"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-primary">
                      {product.categoryLabel}
                    </span>
                    <h4 className="font-headline font-bold text-base text-on-surface">
                      {product.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15">
                    <strong className="font-mono text-lg text-primary">
                      {formatBRL(product.price)}
                    </strong>
                    <button
                      type="button"
                      onClick={() => onAddToCart(product)}
                      className="px-3.5 py-2 rounded-lg bg-primary text-on-primary font-headline font-bold text-xs uppercase cursor-pointer"
                    >
                      + Carrinho
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
