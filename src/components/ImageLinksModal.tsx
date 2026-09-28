import React, { useState } from 'react';
import { DEFAULT_IMAGE_URLS, generateStandaloneHTMLPackage, ImageAssetMap } from '../data/storeData';
import { SafeImage } from './SafeImage';

interface ImageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageAssetMap;
  onUpdateImage: (key: keyof ImageAssetMap, url: string) => void;
  onResetImages: () => void;
  onTriggerToast: (title: string, subtitle: string, icon?: string) => void;
}

const ASSET_LABELS: { key: keyof ImageAssetMap; label: string; tag: string; htmlPath: string }[] = [
  { key: 'logo', label: 'Logo Oficial OtakuVerse', tag: 'Header & Login', htmlPath: 'assets/logo.png' },
  { key: 'avatar', label: 'Avatar Colecionador (Kenji / Renan)', tag: 'Perfil & Header', htmlPath: 'assets/avatar-user.png' },
  { key: 'figureWarrior', label: 'Figure Guerreiro das Sombras 1/7 (Shadow Knight)', tag: 'Hero, Catálogo & Checkout', htmlPath: 'assets/figure-warrior.png' },
  { key: 'posterTokyo', label: 'Wall Scroll Neo-Tokyo Nightscape (60×90cm)', tag: 'Catálogo & Checkout', htmlPath: 'assets/poster-tokyo.png' },
  { key: 'figureMecha', label: 'Mecha Pilot: Kaelen Vane 1/7', tag: 'Catálogo & Showcase', htmlPath: 'assets/figure-mecha.png' },
  { key: 'nendoroidLyra', label: 'Nendoroid Sorceress Lyra DX (Close-up)', tag: 'Home Grid', htmlPath: 'assets/nendoroid-lyra.png' },
  { key: 'nendoroidLyraAlt', label: 'Nendoroid Sorceress Lyra DX (Display Box)', tag: 'Catálogo Geral', htmlPath: 'assets/nendoroid-lyra-box.png' },
  { key: 'jacketBomber', label: 'Jaqueta Bomber Neo-Tokyo Techwear (Costas)', tag: 'Home Grid', htmlPath: 'assets/jacket-bomber.png' },
  { key: 'jacketBomberAlt', label: 'Jaqueta Bomber Neo-Tokyo (Frente)', tag: 'Catálogo Geral', htmlPath: 'assets/jacket-bomber-front.png' },
  { key: 'artbookMemorial', label: 'Memorial Artbook & Mangá Anthology Box', tag: 'Home Grid', htmlPath: 'assets/artbook-box.png' },
  { key: 'posterCyberGirl', label: 'Wall Scroll Cyber Girl Rain 60×90cm', tag: 'Catálogo Geral', htmlPath: 'assets/poster-cybergirl.png' }
];

export const ImageLinksModal: React.FC<ImageLinksModalProps> = ({
  isOpen,
  onClose,
  images,
  onUpdateImage,
  onResetImages,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'links' | 'html'>('links');
  const [selectedHtmlFile, setSelectedHtmlFile] = useState<
    | 'index.html'
    | 'catalogo.html'
    | 'resumo.html'
    | 'pagamento.html'
    | 'perfil.html'
    | 'cadastro.html'
    | 'login.html'
    | 'style.css'
    | 'script.js'
  >('index.html');

  if (!isOpen) return null;

  const htmlPackage = generateStandaloneHTMLPackage(images);
  const currentCode = htmlPackage[selectedHtmlFile];

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onTriggerToast('Link Copiado!', `${label} copiado para a área de transferência.`, 'content_copy');
  };

  const handleDownloadHtml = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onTriggerToast('Download Concluído!', `Arquivo ${filename} com links diretos baixado.`, 'download');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-sm max-w-5xl w-full max-h-[90vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-surface-container border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-primary/15 border border-primary/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">link</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Central de Links Diretos das Imagens & Exportação HTML
              </h2>
              <p className="text-xs text-on-surface-variant">
                Copie as URLs diretas (`https://lh3.googleusercontent.com/...`), substitua qualquer imagem em tempo real ou baixe os arquivos HTML prontos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onResetImages();
                onTriggerToast('Links Restaurados', 'Todas as imagens voltaram para os links originais.', 'restart_alt');
              }}
              className="px-3 py-1.5 rounded-sm bg-surface-container-highest hover:bg-surface-bright text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Restaurar Padrão
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-sm bg-surface-container-highest hover:bg-error/20 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-3 bg-surface-container-lowest border-b border-outline-variant/15 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('links')}
            className={`pb-3 text-xs font-headline font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'links'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
          >
            <span className="material-symbols-outlined text-base">photo_library</span>
            Links Diretos das 11 Imagens
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`pb-3 text-xs font-headline font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'html'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
          >
            <span className="material-symbols-outlined text-base">code</span>
            Código HTML com Links Diretos Injetados
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'links' ? (
            <div className="grid grid-cols-1 gap-4">
              {ASSET_LABELS.map((item) => {
                const currentUrl = images[item.key];
                const isModified = currentUrl !== DEFAULT_IMAGE_URLS[item.key];
                return (
                  <div
                    key={item.key}
                    className="bg-surface-container p-4 rounded-sm border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-sm bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shrink-0">
                      <SafeImage
                        src={currentUrl}
                        alt={item.label}
                        assetKey={item.key}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow min-w-0 w-full space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-sm text-on-surface">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-primary/15 text-primary border border-primary/30">
                            {item.tag}
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant">
                            Substitui: <code>{item.htmlPath}</code>
                          </span>
                        </div>
                        {isModified && (
                          <span className="text-[10px] font-mono uppercase bg-tertiary/15 text-tertiary px-2 py-0.5 rounded-sm">
                            Link Personalizado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={currentUrl}
                          onChange={(e) => onUpdateImage(item.key, e.target.value)}
                          placeholder="Cole aqui o link direto https://..."
                          className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary rounded-sm px-3 py-2 text-xs font-mono text-on-surface focus:outline-none"
                        />
                        <button
                          onClick={() => handleCopyText(currentUrl, item.label)}
                          className="px-3 py-2 rounded-sm bg-primary hover:bg-primary-fixed-dim text-on-primary text-xs font-mono font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          Copiar URL
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { file: 'index.html', label: 'index.html (Início)' },
                      { file: 'catalogo.html', label: 'catalogo.html (Catálogo)' },
                      { file: 'resumo.html', label: 'resumo.html (Carrinho)' },
                      { file: 'pagamento.html', label: 'pagamento.html (Pagamento)' },
                      { file: 'perfil.html', label: 'perfil.html (Perfil)' },
                      { file: 'cadastro.html', label: 'cadastro.html (Cadastro)' },
                      { file: 'login.html', label: 'login.html (Login)' },
                      { file: 'style.css', label: 'style.css (CSS Responsivo)' },
                      { file: 'script.js', label: 'script.js (JS LocalStorage)' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.file}
                      onClick={() => setSelectedHtmlFile(tab.file)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-colors ${selectedHtmlFile === tab.file
                          ? 'bg-primary text-on-primary font-bold'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(currentCode, `Código de ${selectedHtmlFile}`)}
                    className="px-3 py-1.5 rounded-sm bg-surface-container-highest hover:bg-surface-bright text-on-surface text-xs font-mono flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    Copiar HTML
                  </button>
                  <button
                    onClick={() => handleDownloadHtml(selectedHtmlFile, currentCode)}
                    className="px-3.5 py-1.5 rounded-sm bg-tertiary text-on-tertiary text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Baixar {selectedHtmlFile}
                  </button>
                </div>
              </div>

              <pre className="bg-surface-container-lowest border border-outline-variant/25 rounded-sm p-4 text-xs font-mono text-on-surface overflow-x-auto max-h-[50vh] leading-relaxed">
                <code>{currentCode}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
