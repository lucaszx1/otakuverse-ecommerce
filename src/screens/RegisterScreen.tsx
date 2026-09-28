import React, { useState } from 'react';
import { ScreenName } from '../components/Layout';
import { UserProfile, registerStoredUser } from '../data/authStorage';

interface RegisterScreenProps {
  onNavigate: (screen: ScreenName, navKey?: string) => void;
  onRegisterSuccess: (user: UserProfile) => void;
  onTriggerToast: (title: string, subtitle: string, icon?: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigate,
  onRegisterSuccess,
  onTriggerToast
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>(['Mecha / Gunpla', 'Cyberpunk']);

  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(true);
  const [vipAlerts, setVipAlerts] = useState(true);

  const formatCPF = (val: string) => {
    let v = val.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  };

  const formatPhone = (val: string) => {
    let v = val.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (v.length > 5) {
      return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (v.length > 2) {
      return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    return v;
  };

  const formatCEP = (val: string) => {
    let v = val.replace(/\D/g, '').slice(0, 8);
    return v.replace(/^(\d{5})(\d)/, '$1-$2');
  };

  const fetchCEP = async (rawCep: string) => {
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade ? `${data.localidade} - ${data.uf}` : '');
        onTriggerToast('CEP Localizado', `${data.logradouro || 'Endereço'} preenchido automaticamente.`, 'location_on');
      }
    } catch {
      // Fallback if offline
    }
  };

  const getPasswordStrength = (val: string) => {
    let s = 0;
    if (val.length >= 6) s++;
    if (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)) s++;
    if (val.length >= 10 && /[^A-Za-z0-9]/.test(val)) s++;
    return s;
  };

  const strength = getPasswordStrength(password);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      onTriggerToast(
        'Senhas não conferem',
        'Digite a mesma senha nos dois campos para concluir seu cadastro.',
        'error'
      );
      return;
    }

    const cleanName = fullName.trim() || 'Renan Takahashi';
    const cleanEmail = email.trim() || 'colecionador@otakuverse.com.br';
    const derivedNick = cleanEmail.split('@')[0] || cleanName.toLowerCase().replace(/\s+/g, '.');

    const { user } = registerStoredUser({
      fullName: cleanName,
      nickname: derivedNick,
      email: cleanEmail,
      cpf: cpf || '000.000.000-00',
      phone: phone || '(11) 98765-4321',
      password: password || '123456',
      collectorTitle: 'Curador de Figures 1/7',
      bio: `Colecionador focado em ${selectedTags.join(', ') || 'Figures Originais'}.`,
      favoriteTags: selectedTags,
      cep: cep || '01503-000',
      street: street || 'Av. Liberdade',
      number: number || '777',
      complement: complement || '',
      neighborhood: neighborhood || 'Liberdade',
      city: city || 'São Paulo - SP'
    });

    onTriggerToast(
      'Conta Salva no localStorage!',
      `Bem-vindo, ${user.fullName}! Você já está conectado na sua Área de Perfil.`,
      'celebration'
    );
    onRegisterSuccess(user);
  };

  const allTags = [
    'Shonen',
    'Mecha / Gunpla',
    'Cyberpunk',
    'Seinen',
    'Nendoroids',
    'Escalas 1/7 & 1/4',
    'Cosplay & Moda Harajuku'
  ];

  return (
    <div className="w-full py-space-xl px-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low shadow-2xl border border-outline-variant/20">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary-container/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-secondary-container/25 blur-3xl pointer-events-none"></div>

          <div className="relative p-space-lg flex flex-col gap-space-lg">
            {/* Header Brand & Emblem */}
            <div className="flex flex-col items-center text-center gap-space-xs">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-highest shadow-md">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 120 120"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="60" cy="60" r="54" stroke="#cebdff" strokeOpacity="0.35" strokeWidth="4" />
                  <circle cx="60" cy="60" r="42" stroke="#d2bbff" strokeDasharray="140 40" strokeWidth="5" />
                  <path
                    d="M60 22 C42 22 28 36 28 54 C28 72 60 102 60 102 C60 102 92 72 92 54 C92 36 78 22 60 22 Z"
                    fill="#211c33"
                    stroke="#d2bbff"
                    strokeWidth="4"
                  />
                  <circle cx="60" cy="52" r="14" stroke="#eaddff" strokeWidth="4" />
                  <path d="M38 72 L82 32" stroke="#ffb0cd" strokeLinecap="round" strokeWidth="4" />
                  <circle cx="78" cy="36" fill="#ffd9e4" r="3" />
                </svg>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-headline-lg text-headline-lg tracking-wider text-on-surface">
                  <span>OTAKU</span>
                  <span className="text-primary font-bold">V</span>
                  <span>ERSE</span>
                </div>
                <span className="font-label-badge text-label-badge text-primary uppercase tracking-widest bg-secondary-container/40 px-2.5 py-0.5 rounded-full mt-1">
                  Portal Oficial do Colecionador
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                Crie seu passaporte para o acervo curado de figures originais, importações diretas de Akihabara e lançamentos exclusivos.
              </p>
            </div>

            {/* 3-Step Indicator */}
            <div className="flex items-center justify-between p-space-sm bg-surface-container rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md">
                  1
                </div>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Perfil
                </span>
              </div>
              <div className="h-0.5 w-6 bg-surface-variant"></div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                  2
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Coleção
                </span>
              </div>
              <div className="h-0.5 w-6 bg-surface-variant"></div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                  3
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Envio
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
              {/* Dados Pessoais */}
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">person</span>
                  <h2 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
                    Dados Pessoais
                  </h2>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="fullName">
                    Nome Completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ex: Renan Takahashi"
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                    E-mail de Acesso
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colecionador@otakuverse.com.br"
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="cpf">
                        CPF
                      </label>
                      <span className="font-label-badge text-label-badge text-tertiary">
                        Nota Fiscal
                      </span>
                    </div>
                    <input
                      id="cpf"
                      type="text"
                      required
                      maxLength={14}
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm tabular-nums"
                    />
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="phone">
                      WhatsApp / Celular
                    </label>
                    <input
                      id="phone"
                      type="text"
                      required
                      maxLength={15}
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Credenciais & Segurança */}
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">lock</span>
                  <h2 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
                    Credenciais & Segurança
                  </h2>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                    Senha Master
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2.5 pr-10 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>

                  {/* 3-Bar Strength Meter */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength === 1
                          ? 'bg-error'
                          : strength === 2
                          ? 'bg-secondary'
                          : strength === 3
                          ? 'bg-primary'
                          : 'bg-surface-variant'
                      }`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength === 2
                          ? 'bg-secondary'
                          : strength === 3
                          ? 'bg-primary'
                          : 'bg-surface-variant'
                      }`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength === 3 ? 'bg-primary' : 'bg-surface-variant'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={`font-label-badge text-label-badge ${
                        strength === 1
                          ? 'text-error'
                          : strength === 2
                          ? 'text-secondary'
                          : strength === 3
                          ? 'text-primary'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {strength === 1
                        ? 'Senha Fraca'
                        : strength === 2
                        ? 'Senha Boa'
                        : strength === 3
                        ? 'Senha Ultra Segura'
                        : 'Mínimo 8 caracteres'}
                    </span>
                    <span className="font-label-badge text-label-badge text-outline">
                      Letras, números e símbolos
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant"
                    htmlFor="confirmPassword"
                  >
                    Confirmar Senha
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>

              {/* Seu Foco de Coleção */}
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">category</span>
                    <h2 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
                      Seu Foco de Coleção
                    </h2>
                  </div>
                  <span className="font-label-badge text-label-badge text-secondary font-semibold">
                    Feed Personalizado
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Selecione suas categorias favoritas para receber alertas antecipados de pré-vendas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const isActive = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-secondary-container text-on-secondary-container font-semibold'
                            : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span>{tag}</span>
                        <span className="material-symbols-outlined text-xs">check</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                      local_shipping
                    </span>
                    <h2 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
                      Endereço de Entrega
                    </h2>
                  </div>
                  <span className="font-label-badge text-label-badge text-on-tertiary-container bg-tertiary-container/30 px-2 py-0.5 rounded">
                    Envio Protegido
                  </span>
                </div>

                <div className="flex gap-space-sm items-end">
                  <div className="flex flex-col gap-space-xs flex-1">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="cep">
                      CEP
                    </label>
                    <input
                      id="cep"
                      type="text"
                      required
                      maxLength={9}
                      value={cep}
                      onChange={(e) => setCep(formatCEP(e.target.value))}
                      onBlur={(e) => fetchCEP(e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm tabular-nums"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchCEP(cep)}
                    className="h-10 px-3 bg-surface-bright text-on-surface hover:bg-surface-variant rounded-lg font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">search</span>
                    <span>Buscar</span>
                  </button>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="street">
                    Logradouro / Rua
                  </label>
                  <input
                    id="street"
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Avenida Liberdade"
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-space-sm">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="number">
                      Número
                    </label>
                    <input
                      id="number"
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="777"
                      className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col gap-space-xs">
                    <label
                      className="font-label-md text-label-md text-on-surface-variant"
                      htmlFor="complement"
                    >
                      Complemento (opcional)
                    </label>
                    <input
                      id="complement"
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto 42, Bloco B"
                      className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-space-xs">
                    <label
                      className="font-label-md text-label-md text-on-surface-variant"
                      htmlFor="neighborhood"
                    >
                      Bairro
                    </label>
                    <input
                      id="neighborhood"
                      type="text"
                      required
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Liberdade"
                      className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="city">
                      Cidade / UF
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="São Paulo - SP"
                      className="w-full px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex flex-col gap-3 p-space-md bg-surface-container rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary-container bg-surface-variant focus:ring-primary"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                    Concordo com os{' '}
                    <span className="text-primary hover:underline">
                      Termos de Serviço da OtakuVerse
                    </span>{' '}
                    e as políticas de importação alfandegária.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vipAlerts}
                    onChange={(e) => setVipAlerts(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary-container bg-surface-variant focus:ring-primary"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                    Quero receber avisos em primeira mão de drops japoneses, lotes limitados e cupons VIP via WhatsApp e E-mail.
                  </span>
                </label>
              </div>

              {/* Submit Action */}
              <div className="flex flex-col gap-space-sm pt-2">
                <button
                  type="submit"
                  className="group relative flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-headline-md tracking-wide shadow-lg hover:shadow-primary-container/40 active:scale-[0.98] transition-all overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-fixed-dim/20 to-primary-container opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-xl">bolt</span>
                  <span className="relative z-10 text-center font-bold">
                    Concluir Cadastro & Ganhar 10% OFF
                  </span>
                </button>
                <div className="flex items-center justify-center gap-1.5 text-center">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Já possui conta no portal?
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('login', 'login')}
                    className="font-label-md text-label-md text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Acesse sua Área
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
