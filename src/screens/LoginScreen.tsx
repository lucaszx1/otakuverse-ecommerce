import React, { useState } from 'react';
import { ImageAssetMap } from '../data/storeData';
import {
  UserProfile,
  authenticateStoredUser,
  getStoredUsers,
  DEFAULT_DEMO_USER,
  setCurrentStoredUser,
} from '../data/authStorage';
import { SafeImage } from '../components/SafeImage';
import { ScreenName } from '../components/Layout';

interface LoginScreenProps {
  images: ImageAssetMap;
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigate: (screen: ScreenName, navKey?: string) => void;
  onLoginSuccess: (user: UserProfile) => void;
  onTriggerToast: (title: string, subtitle: string, icon?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  images,
  isDark,
  onToggleTheme,
  onNavigate,
  onLoginSuccess,
  onTriggerToast,
}) => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const registeredUsers = getStoredUsers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    setErrorMsg(null);
    setStatus('loading');

    setTimeout(() => {
      const result = authenticateStoredUser(identity, password);
      if (!result.success || !result.user) {
        setStatus('idle');
        setErrorMsg(result.error || 'Credenciais inválidas.');
        onTriggerToast('Falha no Login', result.error || 'Verifique seus dados.', 'error');
        return;
      }

      setStatus('success');
      onTriggerToast(
        'Conectado com Sucesso!',
        `Bem-vindo de volta ao cofre OtakuVerse, ${result.user.fullName}.`,
        'verified_user'
      );
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 500);
    }, 500);
  };

  const handleQuickSelectAccount = (u: UserProfile) => {
    setIdentity(u.email);
    setPassword(u.password || '123456');
    setErrorMsg(null);
  };

  const handleSocialLogin = (provider: string) => {
    const socialUser: UserProfile = {
      ...DEFAULT_DEMO_USER,
      fullName: `Colecionador ${provider}`,
      nickname: `${provider.toLowerCase()}.otaku`,
    };
    setCurrentStoredUser(socialUser);
    onTriggerToast(
      `Autenticação ${provider}`,
      `Conectado via ${provider} SSO com privilégios VIP.`,
      'verified'
    );
    onLoginSuccess(socialUser);
  };

  return (
    <div className="w-full py-space-xl px-4 flex items-center justify-center min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-md mx-auto">
        <div className="relative w-full flex flex-col items-center">
          {/* Ambient Luminous Backdrop Elements */}
          <div className="absolute -top-16 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-12 w-72 h-72 bg-tertiary-container/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Main Container Card */}
          <div className="w-full bg-surface-container rounded-xl shadow-2xl overflow-hidden transition-all duration-300 border border-outline-variant/20">
            {/* Top Action Ribbon: Theme Toggle & Curated Status */}
            <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-high/60">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-widest">
                  Portal Oficial • localStorage Auth
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Alternar tema"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">
                  {isDark ? 'dark_mode' : 'light_mode'}
                </span>
                <span className="font-label-badge text-label-badge">
                  {isDark ? 'MODO ESCURO' : 'MODO CLARO'}
                </span>
              </button>
            </div>

            {/* Core Content Wrap */}
            <div className="p-space-lg flex flex-col gap-space-md">
              {/* Header: Logo & Titles */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-space-sm group">
                  <div className="absolute inset-0 bg-primary-container/30 blur-xl rounded-full scale-125 group-hover:scale-150 transition-transform"></div>
                  <SafeImage
                    alt="OtakuVerse Emblema Oficial"
                    className="relative w-20 h-20 rounded-xl object-contain drop-shadow-md"
                    src={images.logo}
                  />
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">
                  Bem-vindo de volta ao{' '}
                  <span className="text-primary font-headline-lg">OtakuVerse</span>
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Entre com sua conta cadastrada para acessar sua Área de Perfil e Pedidos.
                </p>
              </div>

              {/* Saved Accounts Helper from localStorage */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-outline">
                  <span>CONTAS SALVAS NO NAVEGADOR ({registeredUsers.length}):</span>
                  <span className="text-primary">Clique para preencher</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {registeredUsers.slice(0, 3).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickSelectAccount(u)}
                      className="px-2.5 py-1 rounded-md bg-surface-container-highest hover:bg-primary/20 text-on-surface hover:text-primary text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">person</span>
                      <span className="truncate max-w-[180px]">{u.email}</span>
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Semantic Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                {/* Input Field: Identificador / Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between"
                    htmlFor="user-identity"
                  >
                    <span>E-mail ou Nome de Usuário</span>
                    <span className="font-label-badge text-label-badge text-secondary">
                      OBRIGATÓRIO
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                      alternate_email
                    </span>
                    <input
                      id="user-identity"
                      type="text"
                      required
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      placeholder="ex: spike.spiegel ou colecionador@neo.tokyo"
                      className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-4 py-2.5 rounded-lg outline-none focus:bg-surface-container-low focus:ring-2 focus:ring-primary transition-colors shadow-inner"
                    />
                  </div>
                </div>

                {/* Input Field: Senha */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-md text-label-md text-on-surface-variant"
                      htmlFor="user-password"
                    >
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        handleQuickSelectAccount(registeredUsers[0] || DEFAULT_DEMO_USER);
                        onTriggerToast(
                          'Credenciais Preenchidas',
                          'Dados da conta salvos no navegador carregados.',
                          'lock_open'
                        );
                      }}
                      className="font-label-md text-label-md text-primary hover:text-on-primary-container transition-colors cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="user-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-11 py-2.5 rounded-lg outline-none focus:bg-surface-container-low focus:ring-2 focus:ring-primary transition-colors shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Alternar visibilidade da senha"
                      className="absolute right-3 text-outline hover:text-primary transition-colors cursor-pointer p-0.5"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Preferences: Checkbox Lembrar-me */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-container-lowest text-primary-container accent-primary focus:ring-0 cursor-pointer"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors select-none">
                      Manter conectado no navegador
                    </span>
                  </label>
                  <span className="flex items-center gap-1 font-label-badge text-label-badge text-tertiary">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    LOCALSTORAGE
                  </span>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={status !== 'idle'}
                  className="relative overflow-hidden w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary-container font-headline-md text-headline-md tracking-tight hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {status === 'idle' && (
                    <>
                      <span className="material-symbols-outlined text-[22px] group-hover:translate-x-0.5 transition-transform">
                        login
                      </span>
                      <span>Entrar na Minha Conta</span>
                    </>
                  )}
                  {status === 'loading' && (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        progress_activity
                      </span>
                      <span>Autenticando...</span>
                    </>
                  )}
                  {status === 'success' && (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      <span>Conectado com Sucesso</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divisor Social Auth */}
              <div className="relative flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full bg-surface-variant h-px"></div>
                </div>
                <span className="relative px-3 bg-surface-container font-label-badge text-label-badge text-outline uppercase tracking-wider">
                  ou continue com
                </span>
              </div>

              {/* Social SSO Buttons */}
              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-surface-container-low hover:bg-surface-variant text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer shadow-sm"
                >
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Discord')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-surface-container-low hover:bg-surface-variant text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer shadow-sm"
                >
                  <span>Discord</span>
                </button>
              </div>

              {/* Footer Call to Action */}
              <div className="text-center pt-space-xs">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Ainda não tem clã?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="font-headline-md text-body-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/40 underline-offset-4 cursor-pointer"
                  >
                    Crie sua conta gratuitamente
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
