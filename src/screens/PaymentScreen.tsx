import React, { useState } from 'react';
import { ImageAssetMap, formatBRL } from '../data/storeData';
import { UserProfile, OrderRecord, addStoredOrder } from '../data/authStorage';
import { SafeImage } from '../components/SafeImage';
import { ScreenName } from '../components/Layout';
import { CartEntry } from './CheckoutScreen';

interface PaymentScreenProps {
  images: ImageAssetMap;
  cart: CartEntry[];
  couponCode: string;
  couponApplied: boolean;
  currentUser: UserProfile | null;
  onNavigate: (screen: ScreenName) => void;
  onTriggerToast: (title: string, subtitle: string, icon?: string) => void;
  onOrderCompleted: (order: OrderRecord) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  images,
  cart,
  couponCode,
  couponApplied,
  currentUser,
  onNavigate,
  onTriggerToast,
  onOrderCompleted,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'card' | 'boleto'>('pix');

  // Credit Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [cardHolder, setCardHolder] = useState(
    currentUser?.fullName.toUpperCase() || 'KENJI A TAKAHASHI'
  );
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvv, setCardCvv] = useState('774');
  const [installments, setInstallments] = useState<number>(6);

  // Processing & Confirmed Order State
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'confirmed'>('idle');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const couponDiscount = couponApplied ? Number((subtotal * 0.1).toFixed(2)) : 0;
  const afterCoupon = Math.max(0, Number((subtotal - couponDiscount).toFixed(2)));
  const pixDiscount = selectedMethod === 'pix' ? Number((afterCoupon * 0.05).toFixed(2)) : 0;
  const finalPayable = Math.max(0, Number((afterCoupon - pixDiscount).toFixed(2)));
  const installmentAmount = Number((afterCoupon / installments).toFixed(2));

  const pixPayload =
    '00020126580014BR.GOV.BCB.PIX013693f0b21a-4c28-4ef7-b2f3-otakuverse899825204000053039865408' +
    finalPayable.toFixed(2) +
    '5802BR5910OtakuVerse6009SaoPaulo62070503***6304C7D2';

  const boletoCode = '34191.79001 01043.510047 91020.150008 9 98420000089982';

  const formatCardNumberInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  const formatExpiryInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const shippingDestination = currentUser
    ? `${currentUser.street}, ${currentUser.number}${
        currentUser.complement ? ` (${currentUser.complement})` : ''
      } - ${currentUser.city} • CEP ${currentUser.cep}`
    : 'Av. Paulista, 1578, Apto 142 - São Paulo/SP • CEP 01310-200';

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentStatus !== 'idle') return;
    setPaymentStatus('processing');

    setTimeout(() => {
      const orderId = `OV-${Math.floor(10000 + Math.random() * 89999)}`;
      const now = new Date();
      const dateStr = `${now.toLocaleDateString('pt-BR')} às ${now
        .toLocaleTimeString('pt-BR')
        .slice(0, 5)}`;

      const paymentDetailsLabel =
        selectedMethod === 'pix'
          ? 'Pix Instantâneo (-5% OFF)'
          : selectedMethod === 'card'
          ? `Cartão de Crédito (${installments}x de ${formatBRL(installmentAmount)})`
          : 'Boleto Bancário Custódia';

      const newOrder: OrderRecord = {
        id: orderId,
        userEmail: currentUser?.email || 'colecionador@neo.tokyo',
        userName: currentUser?.fullName || 'Kenji Akira Takahashi',
        createdAt: dateStr,
        items: cart.map((c) => ({
          id: c.id,
          title: c.title,
          qty: c.qty,
          price: c.price,
          imageKey: c.imageKey,
          scaleTag: c.scaleTag,
        })),
        subtotal,
        discount: couponDiscount,
        pixDiscount,
        total: finalPayable,
        paymentMethod: selectedMethod,
        paymentDetails: paymentDetailsLabel,
        status:
          selectedMethod === 'boleto'
            ? 'Aguardando Confirmação'
            : 'Pago • Em Separação no Cofre',
        shippingAddress: shippingDestination,
      };

      addStoredOrder(newOrder);
      setConfirmedOrder(newOrder);
      setPaymentStatus('confirmed');
      onOrderCompleted(newOrder);
      onTriggerToast(
        `Pagamento Confirmado (#${orderId})!`,
        `Pedido registrado no seu Histórico de Pedidos com sucesso.`,
        'verified'
      );
    }, 900);
  };

  if (paymentStatus === 'confirmed' && confirmedOrder) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12">
        <div className="bg-surface-container rounded-2xl p-8 border border-primary/40 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4 shadow-lg">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-tertiary/15 text-tertiary font-mono text-xs font-bold uppercase tracking-widest mb-2">
              Comprovante Oficial • #{confirmedOrder.id}
            </span>
            <h1 className="font-headline text-3xl font-bold text-on-surface">
              Pagamento Concluído com Sucesso!
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-lg">
              Seu pedido foi salvo no <strong>localStorage</strong> e já está disponível na sua{' '}
              <strong>Área de Perfil</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-xs font-mono uppercase text-outline block">Forma Escolhida</span>
              <strong className="text-sm text-on-surface mt-1 block">
                {confirmedOrder.paymentDetails}
              </strong>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-xs font-mono uppercase text-outline block">Status do Lote</span>
              <strong className="text-sm text-tertiary mt-1 block">{confirmedOrder.status}</strong>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-xs font-mono uppercase text-outline block">Total Pago</span>
              <strong className="text-lg font-mono text-primary mt-0.5 block">
                {formatBRL(confirmedOrder.total)}
              </strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 mb-6">
            <span className="text-xs font-mono uppercase text-outline block mb-2">
              Destino de Entrega Blindada:
            </span>
            <p className="text-sm text-on-surface font-medium">{confirmedOrder.shippingAddress}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="px-6 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-headline font-bold text-sm flex items-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">account_circle</span>
              <span>Ver Pedido no Meu Perfil</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="px-6 py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              <span>Voltar ao Catálogo</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin py-space-lg">
      {/* Breadcrumb & Step Bar */}
      <div className="w-full mb-space-xl">
        <div className="flex items-center gap-2 text-outline font-label-md text-label-md uppercase tracking-wider mb-space-sm">
          <button
            type="button"
            onClick={() => onNavigate('checkout')}
            className="hover:text-primary transition-colors uppercase flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Voltar ao Resumo do Pedido</span>
          </button>
          <span>/</span>
          <span className="text-primary font-bold">Etapa 04 • Forma de Pagamento</span>
        </div>

        <div className="bg-surface-container-low p-space-md rounded-xl shadow-lg relative overflow-hidden">
          <div className="grid grid-cols-4 gap-space-sm items-center relative z-10">
            <div className="flex items-center gap-space-xs text-secondary opacity-75">
              <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">done</span>
              </div>
              <span className="hidden sm:inline font-label-md text-label-md font-semibold text-on-surface">
                01. Carrinho
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-secondary opacity-75">
              <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">done</span>
              </div>
              <span className="hidden sm:inline font-label-md text-label-md font-semibold text-on-surface">
                02. Identificação
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('checkout')}
              className="flex items-center gap-space-xs text-secondary opacity-85 cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">done</span>
              </div>
              <span className="hidden sm:inline font-label-md text-label-md font-semibold text-on-surface hover:text-primary">
                03. Resumo do Pedido
              </span>
            </button>
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-badge text-label-badge uppercase tracking-widest text-primary font-bold">
                  Etapa 04
                </span>
                <span className="font-label-lg text-label-lg text-primary font-bold">
                  Forma de Pagamento
                </span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-secondary via-primary-container to-tertiary w-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left 8 Columns: Payment Method Selector & Interactive Details */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="bg-surface-container rounded-xl p-space-lg shadow-md border border-outline-variant/15">
            <div className="mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                Gateway Criptografado • 256-Bit SSL
              </span>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                Escolha sua Forma de Pagamento
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Selecione como deseja quitar sua encomenda para liberar o envio blindado imediato.
              </p>
            </div>

            {/* 3 Method Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedMethod('pix')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedMethod === 'pix'
                    ? 'bg-primary/15 border-primary shadow-lg shadow-primary/10'
                    : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl text-primary">qr_code_2</span>
                  <span className="px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono text-[10px] font-bold">
                    -5% OFF EXTRA
                  </span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">Pix Instantâneo</p>
                  <p className="text-xs text-on-surface-variant">Liberação em 10 segundos</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedMethod === 'card'
                    ? 'bg-primary/15 border-primary shadow-lg shadow-primary/10'
                    : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl text-secondary">
                    credit_card
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                    ATÉ 12X S/ JUROS
                  </span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">
                    Cartão de Crédito
                  </p>
                  <p className="text-xs text-on-surface-variant">Visa, Master, Elo, Amex</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('boleto')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedMethod === 'boleto'
                    ? 'bg-primary/15 border-primary shadow-lg shadow-primary/10'
                    : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl text-tertiary">
                    barcode_scanner
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono text-[10px] font-bold">
                    3 DIAS ÚTEIS
                  </span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">
                    Boleto Custódia
                  </p>
                  <p className="text-xs text-on-surface-variant">Pagável em qualquer banco</p>
                </div>
              </button>
            </div>

            {/* Method 1: PIX */}
            {selectedMethod === 'pix' && (
              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/15">
                  <div>
                    <span className="px-2.5 py-0.5 rounded bg-tertiary/15 text-tertiary font-mono text-xs font-bold uppercase">
                      Economia de {formatBRL(pixDiscount)} aplicada
                    </span>
                    <h2 className="font-headline font-bold text-xl text-on-surface mt-1">
                      Escaneie o QR Code ou use o Pix Copia e Cola
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-outline block">Valor final no Pix:</span>
                    <strong className="font-mono text-2xl font-extrabold text-primary">
                      {formatBRL(finalPayable)}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-4 bg-white rounded-xl shadow-lg shrink-0 flex flex-col items-center">
                    <svg className="w-36 h-36 text-slate-900" fill="currentColor" viewBox="0 0 120 120">
                      <path d="M10 10h30v30H10V10zm6 6v18h18V16H16z" />
                      <rect x="20" y="20" width="10" height="10" />
                      <path d="M80 10h30v30H80V10zm6 6v18h18V16H86z" />
                      <rect x="90" y="20" width="10" height="10" />
                      <path d="M10 80h30v30H10V80zm6 6v18h18V86H16z" />
                      <rect x="20" y="90" width="10" height="10" />
                      <rect x="48" y="12" width="6" height="6" />
                      <rect x="58" y="18" width="6" height="6" />
                      <rect x="68" y="12" width="6" height="6" />
                      <rect x="48" y="30" width="6" height="6" />
                      <rect x="60" y="32" width="8" height="6" />
                      <rect x="12" y="48" width="6" height="6" />
                      <rect x="24" y="58" width="6" height="6" />
                      <rect x="36" y="48" width="8" height="8" />
                      <rect x="48" y="48" width="6" height="6" />
                      <rect x="60" y="52" width="6" height="6" />
                      <rect x="74" y="48" width="8" height="8" />
                      <rect x="90" y="50" width="6" height="6" />
                      <rect x="102" y="58" width="8" height="6" />
                      <rect x="48" y="66" width="6" height="6" />
                      <rect x="62" y="68" width="6" height="6" />
                      <rect x="72" y="66" width="6" height="6" />
                      <rect x="48" y="80" width="6" height="8" />
                      <rect x="60" y="84" width="8" height="6" />
                      <rect x="80" y="80" width="6" height="6" />
                      <rect x="94" y="84" width="8" height="6" />
                      <rect x="54" y="96" width="6" height="12" />
                      <rect x="70" y="98" width="10" height="6" />
                      <rect x="88" y="96" width="8" height="8" />
                      <rect x="100" y="90" width="6" height="14" />
                    </svg>
                    <span className="text-[10px] font-mono text-slate-700 font-bold uppercase mt-2">
                      Banco Central • Pix Oficial
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <label className="block text-xs font-mono uppercase text-on-surface-variant">
                      Chave Pix Copia e Cola:
                    </label>
                    <div className="flex items-center gap-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/25">
                      <input
                        type="text"
                        readOnly
                        value={pixPayload}
                        className="w-full bg-transparent text-xs font-mono text-on-surface focus:outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(pixPayload);
                          onTriggerToast(
                            'Código Pix Copiado!',
                            'Cole no aplicativo do seu banco para concluir.',
                            'content_copy'
                          );
                        }}
                        className="px-3.5 py-2 rounded-lg bg-primary text-on-primary font-mono text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        <span>Copiar</span>
                      </button>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Após realizar o Pix ou para simular a confirmação imediata, clique em{' '}
                      <strong>"Confirmar Pagamento e Concluir Pedido"</strong> ao lado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Method 2: CREDIT CARD */}
            {selectedMethod === 'card' && (
              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-6">
                {/* Visual Credit Card Preview */}
                <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-primary-container via-surface-container-highest to-secondary-container text-white shadow-2xl border border-white/15 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs uppercase tracking-widest opacity-80">
                      OtakuVerse Black Member
                    </span>
                    <span className="material-symbols-outlined text-2xl">contactless</span>
                  </div>
                  <div className="font-mono text-xl sm:text-2xl tracking-widest font-bold mb-6">
                    {cardNumber || '0000 0000 0000 0000'}
                  </div>
                  <div className="flex items-end justify-between text-xs font-mono">
                    <div>
                      <span className="block text-[10px] opacity-70 uppercase">Titular</span>
                      <span className="font-bold uppercase">{cardHolder || 'NOME NO CARTÃO'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] opacity-70 uppercase">Validade</span>
                      <span className="font-bold">{cardExpiry || 'MM/AA'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                      Nome Impresso no Cartão
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="EX: KENJI A TAKAHASHI"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                      Validade (MM/AA)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                      placeholder="09/29"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                      CVV (Código de Segurança)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                      Parcelamento Sem Juros
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                        <option key={n} value={n}>
                          {n}x de {formatBRL(afterCoupon / n)} sem juros (Total:{' '}
                          {formatBRL(afterCoupon)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Method 3: BOLETO */}
            {selectedMethod === 'boleto' && (
              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-tertiary font-bold">
                      Boleto Bancário Registrado
                    </span>
                    <h3 className="font-headline font-bold text-lg text-on-surface">
                      Linha Digitável para Pagamento
                    </h3>
                  </div>
                  <span className="font-mono font-bold text-xl text-primary">
                    {formatBRL(finalPayable)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <code className="text-xs font-mono text-on-surface break-all">{boletoCode}</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(boletoCode);
                      onTriggerToast(
                        'Linha Digitável Copiada!',
                        'Cole no seu internet banking para pagar o boleto.',
                        'content_copy'
                      );
                    }}
                    className="px-3.5 py-2 rounded-lg bg-primary text-on-primary font-mono text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Copiar Boleto
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Sua figure permanece reservada no cofre climatizado por 3 dias úteis até a compensação bancária.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Columns: Final Order Summary & Confirm Payment CTA */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 flex flex-col gap-space-md">
          <form
            onSubmit={handleConfirmPayment}
            className="bg-surface-container rounded-xl p-space-lg shadow-xl border border-outline-variant/20 flex flex-col gap-space-md"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Resumo para Pagamento
              </h3>
              <span className="text-xs font-mono text-primary font-bold">
                {cart.reduce((a, b) => a + b.qty, 0)} itens
              </span>
            </div>

            {/* Compact item list */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-lowest overflow-hidden shrink-0 flex items-center justify-center">
                    {item.imageKey ? (
                      <SafeImage
                        src={images[item.imageKey]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-primary text-lg">
                        {item.icon || 'inventory_2'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate">{item.title}</p>
                    <p className="text-outline">Qtd: {item.qty}x</p>
                  </div>
                  <span className="font-mono font-bold text-on-surface">
                    {formatBRL(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-outline-variant/15 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-mono">{formatBRL(subtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-secondary">
                  <span>Cupom ({couponCode || 'SENAI10'})</span>
                  <span className="font-mono">- {formatBRL(couponDiscount)}</span>
                </div>
              )}
              {selectedMethod === 'pix' && (
                <div className="flex justify-between text-tertiary font-medium">
                  <span>Desconto Pix (-5%)</span>
                  <span className="font-mono">- {formatBRL(pixDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>Frete Blindado</span>
                <span className="text-tertiary font-bold text-xs uppercase">Grátis</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low flex items-baseline justify-between">
              <span className="font-headline font-bold text-sm uppercase text-on-surface">
                Total a Pagar
              </span>
              <span className="font-mono font-extrabold text-2xl text-primary">
                {formatBRL(finalPayable)}
              </span>
            </div>

            <button
              type="submit"
              disabled={paymentStatus !== 'idle'}
              className="w-full py-3.5 px-4 rounded-xl bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-headline font-bold text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {paymentStatus === 'idle' ? (
                <>
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                  <span>Confirmar Pagamento Agora</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">
                    progress_activity
                  </span>
                  <span>Processando Pagamento...</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('checkout')}
              className="w-full py-2 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors text-center cursor-pointer"
            >
              ← Voltar e revisar itens do pedido
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
