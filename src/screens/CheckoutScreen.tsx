import React, { useState, useEffect } from 'react';
import {
  ImageAssetMap,
  CROSS_SELL_ITEMS,
  CrossSellItem,
  formatBRL
} from '../data/storeData';
import { UserProfile } from '../data/authStorage';
import { SafeImage } from '../components/SafeImage';
import { ScreenName } from '../components/Layout';

export interface CartEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  qty: number;
  serialInfo: string;
  scaleTag: string;
  imageKey?: keyof ImageAssetMap;
  icon?: string;
}

interface CheckoutScreenProps {
  images: ImageAssetMap;
  cart: CartEntry[];
  onUpdateQty: (id: string, delta: number) => void;
  onAddCrossSell: (item: CrossSellItem) => void;
  onNavigate: (screen: ScreenName, navKey?: string) => void;
  onTriggerToast: (title: string, subtitle: string, icon?: string) => void;
  currentUser: UserProfile | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponApplied: boolean;
  setCouponApplied: (applied: boolean) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  images,
  cart,
  onUpdateQty,
  onAddCrossSell,
  onNavigate,
  onTriggerToast,
  currentUser,
  couponCode,
  setCouponCode,
  couponApplied,
  setCouponApplied
}) => {
  const [editingCart, setEditingCart] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const [address, setAddress] = useState({
    recipient: currentUser?.fullName || 'Kenji Takahashi',
    street: currentUser
      ? `${currentUser.street}, ${currentUser.number}${currentUser.complement ? ` - ${currentUser.complement}` : ''}`
      : 'Av. Paulista, 1578, Apto 142 - Bela Vista',
    cityZip: currentUser
      ? `${currentUser.city} • CEP ${currentUser.cep}`
      : 'São Paulo - SP • CEP 01310-200',
    phone: currentUser?.phone || '(11) 98765-4321'
  });

  useEffect(() => {
    if (currentUser) {
      setAddress({
        recipient: currentUser.fullName,
        street: `${currentUser.street}, ${currentUser.number}${currentUser.complement ? ` - ${currentUser.complement}` : ''}`,
        cityZip: `${currentUser.city} • CEP ${currentUser.cep}`,
        phone: currentUser.phone
      });
    }
  }, [currentUser]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = couponApplied ? Number((subtotal * 0.1).toFixed(2)) : 0;
  const finalTotal = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  const pixPreviewTotal = Number((finalTotal * 0.95).toFixed(2));
  const installmentValue = Number((finalTotal / 12).toFixed(2));

  const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      onTriggerToast(
        'Carrinho Vazio',
        'Adicione pelo menos 1 colecionável antes de prosseguir para o pagamento.',
        'shopping_bag'
      );
      return;
    }
    onTriggerToast(
      'Avançando para Pagamento',
      'Escolha entre Pix (-5% OFF), Cartão em até 12x ou Boleto.',
      'payments'
    );
    onNavigate('payment');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin py-space-lg">
      {/* Header Simples do Carrinho */}
      <div className="w-full mb-space-lg">
        <div className="flex items-center gap-2 text-outline font-label-md text-label-md uppercase tracking-wider mb-space-xs">
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="hover:text-primary transition-colors uppercase cursor-pointer"
          >
            Catálogo
          </button>
          <span>/</span>
          <span className="text-on-surface">Meu Carrinho</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-lg text-on-surface font-bold">
          Carrinho & Destino de Entrega
        </h1>
      </div>

      {/* Main Content Grid: Somente Itens Selecionados e Destino na esquerda + Resumo na direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Column: Somente Itens Selecionados & Destino */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* 1. Section: Itens Selecionados */}
          <div className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-md text-headline-md text-on-surface">
                  Itens Selecionados
                </span>
                <span className="bg-surface-container-highest text-secondary font-label-badge text-label-badge px-2.5 py-0.5 rounded-full tabular-nums">
                  {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Itens'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingCart(!editingCart)}
                className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{editingCart ? 'Concluir Edição' : 'Editar Quantidades'}</span>
                <span className="material-symbols-outlined text-[14px]">
                  {editingCart ? 'check' : 'edit'}
                </span>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low rounded-xl border border-outline-variant/15">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">
                  shopping_bag
                </span>
                <p className="font-headline font-bold text-base text-on-surface">
                  Seu carrinho está vazio
                </p>
                <p className="text-xs text-on-surface-variant mt-1 mb-4">
                  Explore o catálogo oficial para adicionar figures e colecionáveis.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Ir para o Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-space-md bg-surface-container-low rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-sm transition-all hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-space-md">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-container-lowest shrink-0 shadow-inner flex items-center justify-center">
                      {item.imageKey ? (
                        <SafeImage
                          alt={item.title}
                          src={images[item.imageKey]}
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-primary text-4xl">
                          {item.icon || 'inventory_2'}
                        </span>
                      )}
                      <span
                        className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded font-label-badge text-label-badge uppercase ${
                          item.scaleTag === '1/7 Scale'
                            ? 'bg-tertiary-container text-on-tertiary-container'
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}
                      >
                        {item.scaleTag}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-label-badge text-label-badge uppercase tracking-wider text-secondary">
                        {item.subtitle}
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                        {item.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-outline">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-space-md mt-space-xs font-label-md text-label-md text-on-surface-variant">
                        <div className="flex items-center gap-2 bg-surface-container px-2 py-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-6 h-6 rounded bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container cursor-pointer"
                          >
                            -
                          </button>
                          <strong className="text-on-surface tabular-nums">{item.qty}x</strong>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-6 h-6 rounded bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span>{item.serialInfo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <p className="font-headline-lg text-headline-lg text-primary font-bold tabular-nums">
                      {formatBRL(item.price * item.qty)}
                    </p>
                    <span className="font-label-badge text-label-badge text-secondary font-medium">
                      Elegível para -5% no Pix
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 2. Section: Destino */}
          <div className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="p-2 rounded-xl bg-secondary-container/30 text-secondary">
                  <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Destino
                  </h3>
                  <p className="font-body-sm text-body-sm text-outline">
                    Embalagem reforçada com plástico bolha triplo e caixa dupla
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAddress(!editingAddress)}
                className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{editingAddress ? 'Salvar' : 'Alterar'}</span>
                <span className="material-symbols-outlined text-[14px]">
                  {editingAddress ? 'check' : 'edit'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Recipient & Address */}
              <div className="p-space-md bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-space-xs text-outline mb-2">
                  <span className="material-symbols-outlined text-[18px]">person_pin_circle</span>
                  <span className="font-label-md text-label-md uppercase tracking-wider">
                    Endereço de Entrega
                  </span>
                </div>
                {editingAddress ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={address.recipient}
                      onChange={(e) => setAddress({ ...address, recipient: e.target.value })}
                      className="w-full bg-surface-container-lowest px-2.5 py-1.5 rounded-lg font-body-sm text-on-surface"
                    />
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-surface-container-lowest px-2.5 py-1.5 rounded-lg font-body-sm text-on-surface"
                    />
                    <input
                      type="text"
                      value={address.cityZip}
                      onChange={(e) => setAddress({ ...address, cityZip: e.target.value })}
                      className="w-full bg-surface-container-lowest px-2.5 py-1.5 rounded-lg font-body-sm text-on-surface"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-label-lg text-label-lg font-bold text-on-surface">
                      {address.recipient}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {address.street}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {address.cityZip}
                    </p>
                    <p className="font-body-sm text-body-sm text-outline mt-2">
                      Contato: {address.phone}
                    </p>
                  </>
                )}
              </div>

              {/* Shipping Method Spec */}
              <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-space-xs text-outline mb-2">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="font-label-md text-label-md uppercase tracking-wider">
                      Modalidade de Envio
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">
                      Sedex Otaku Express
                    </span>
                    <span className="bg-primary/20 text-primary font-label-badge text-label-badge px-2 py-0.5 rounded-full font-bold">
                      SEGURO TOTAL
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Estimativa: <strong>2 a 4 dias úteis</strong> após expedição.
                  </p>
                  <p className="font-body-sm text-body-sm text-tertiary mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    Embalagem Blindada anti-impacto inclusa
                  </p>
                </div>
                <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline">Custo Logístico:</span>
                  <span className="font-label-lg text-label-lg text-primary font-bold">
                    Grátis (Cupom SENAI10)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Summary & Ir para Pagamento */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-space-md">
          <div className="bg-surface-container rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md relative overflow-hidden">
            {/* Subtle corner flare */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary-container/20 blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-space-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                Resumo do Pedido
              </h3>
              <span className="material-symbols-outlined text-primary text-[22px]">
                receipt_long
              </span>
            </div>

            {/* Price Ledger Breakdown */}
            <div className="space-y-space-sm font-body-md text-body-md">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Subtotal dos Produtos</span>
                <span className="font-semibold text-on-surface tabular-nums">
                  {formatBRL(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="flex items-center gap-1">
                  Frete Seguro Colecionador
                </span>
                <div className="flex items-center gap-2">
                  <span className="line-through text-outline font-body-sm text-body-sm tabular-nums">
                    R$ 24,90
                  </span>
                  <span className="text-tertiary font-semibold uppercase text-xs">Grátis</span>
                </div>
              </div>

              {/* Coupon Tag Applied */}
              {couponApplied && (
                <div className="flex items-center justify-between text-secondary">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">loyalty</span>
                    <span className="font-label-md text-label-md font-semibold">
                      Cupom {couponCode || 'SENAI10'}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums">- {formatBRL(discountAmount)}</span>
                </div>
              )}
            </div>

            {/* Total Calculation Highlight */}
            <div className="pt-space-md bg-surface-container-low p-space-md rounded-xl flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <span className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wide">
                  Total do Pedido
                </span>
                <div className="text-right">
                  <p className="font-headline-xl text-headline-xl text-primary font-extrabold leading-none tracking-tight tabular-nums">
                    {formatBRL(finalTotal)}
                  </p>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-tertiary text-right mt-1 font-medium">
                ou <strong>{formatBRL(pixPreviewTotal)}</strong> no Pix (-5% OFF)
              </p>
              <p className="font-body-sm text-body-sm text-outline text-right">
                ou até{' '}
                <strong className="text-on-surface tabular-nums">
                  12x de {formatBRL(installmentValue)}
                </strong>{' '}
                sem juros
              </p>
            </div>

            {/* Coupon Input Form */}
            <div className="flex items-center gap-space-xs mt-space-xs">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="CUPOM VIP"
                className="flex-1 bg-surface-container-lowest px-space-md py-2.5 rounded-xl font-label-md text-label-md text-primary font-bold uppercase tracking-wider focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (couponApplied) {
                    setCouponApplied(false);
                    onTriggerToast('Cupom Removido', 'O desconto de 10% foi desativado.', 'loyalty');
                  } else {
                    setCouponApplied(true);
                    if (!couponCode.trim()) setCouponCode('SENAI10');
                    onTriggerToast('Cupom Ativado!', '10% OFF + Frete Blindado Grátis aplicados.', 'loyalty');
                  }
                }}
                className="px-space-md py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-outline hover:text-on-surface rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer"
              >
                {couponApplied ? 'Remover' : 'Aplicar'}
              </button>
            </div>

            {/* Primary Action: Ir para Pagamento */}
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="w-full py-3.5 px-space-md rounded-xl bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-headline-md text-headline-md font-bold tracking-tight shadow-xl hover:shadow-primary-container/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-space-sm mt-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">payments</span>
              <span>Ir para Pagamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Recommendations for Figure Custody */}
      <div className="mt-space-xl pt-space-lg">
        <div className="flex items-center justify-between mb-space-md">
          <div>
            <span className="font-label-badge text-label-badge text-tertiary uppercase tracking-wider font-bold">
              Comprados Frequentemente Juntos
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Proteção & Cuidados para sua Figure
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {CROSS_SELL_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container p-space-md rounded-xl shadow-md flex items-center justify-between gap-space-md hover:bg-surface-container-high transition-colors"
            >
              <div className="flex items-center gap-space-sm">
                <div
                  className={`w-14 h-14 rounded-lg bg-surface-container-lowest flex items-center justify-center shrink-0 ${item.colorClass}`}
                >
                  <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                </div>
                <div>
                  <p className="font-label-lg text-label-lg font-bold text-on-surface">
                    {item.title}
                  </p>
                  <p className="font-body-sm text-body-sm text-outline">{item.description}</p>
                  <p className="font-label-md text-label-md text-primary font-bold mt-1 tabular-nums">
                    {formatBRL(item.price)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAddCrossSell(item)}
                aria-label={`Adicionar ${item.title}`}
                className="p-2.5 rounded-lg bg-surface-container-highest hover:bg-primary-container hover:text-on-primary-container text-on-surface transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
