import React from 'react';
import { ImageAssetMap, ProductItem, formatBRL } from '../data/storeData';
import { SafeImage } from './SafeImage';

export interface ProductQuickViewModalProps {
  product: ProductItem | null;
  images: ImageAssetMap;
  isFavorite: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductItem) => void;
  onToggleFavorite: (id: string) => void;
  onCopyUrl?: (url: string, label: string) => void;
  onCopyDirectUrl?: (url: string) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  images,
  isFavorite,
  onClose,
  onAddToCart,
  onToggleFavorite,
  onCopyUrl,
  onCopyDirectUrl
}) => {
  if (!product) return null;

  const imgKey = product.catalogImageKey || product.imageKey;
  const imgUrl = images[imgKey];
  const pixPrice = product.price * 0.95;

  const handleCopy = () => {
    if (onCopyUrl) {
      onCopyUrl(imgUrl, product.shortTitle);
    } else if (onCopyDirectUrl) {
      onCopyDirectUrl(imgUrl);
    } else {
      navigator.clipboard.writeText(imgUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-surface-container rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Image Side */}
        <div className="md:col-span-6 relative aspect-square md:aspect-auto bg-surface-container-lowest">
          <SafeImage
            src={imgUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            <span className="px-2.5 py-1 rounded-md bg-primary-container/90 backdrop-blur-md text-on-primary-container font-label-badge text-label-badge font-bold uppercase shadow-sm">
              {product.badgeMain}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest/85 backdrop-blur-md text-secondary font-label-badge text-label-badge font-semibold">
              {product.badgeSub}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-surface-container-lowest/85 backdrop-blur-md text-on-surface hover:text-primary font-label-md text-label-md flex items-center justify-between gap-2 transition-colors cursor-pointer"
          >
            <span className="truncate text-xs">Link Direto da Imagem (HTML)</span>
            <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
              content_copy
            </span>
          </button>
        </div>

        {/* Info Side */}
        <div className="md:col-span-6 p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-label-badge text-label-badge text-secondary uppercase tracking-wider">
                {product.subtitle}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer"
                aria-label="Fechar"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {product.title}
            </h2>

            <div className="flex items-center gap-1 text-primary mt-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className="material-symbols-outlined material-symbols-filled text-[16px]"
                >
                  {s === 5 && product.rating < 5 ? 'star_half' : 'star'}
                </span>
              ))}
              <span className="font-body-sm text-body-sm text-outline ml-1">
                {product.reviewLabel}
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Technical Specs */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-surface-container-low text-xs">
              <div className="flex items-center justify-between">
                <span className="text-outline">Fabricante / Estúdio:</span>
                <span className="font-semibold text-on-surface">
                  {product.manufacturer || 'Good Smile / Toei Oficial'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Especificação:</span>
                <span className="font-semibold text-on-surface">
                  {product.dimensions || product.bottomOverlayTag}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Autenticidade:</span>
                <span className="font-semibold text-primary">
                  {product.serialInfo || 'Selo Holográfico Oficial'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/25">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                {product.oldPrice && (
                  <span className="text-xs text-outline line-through block tabular-nums">
                    De {formatBRL(product.oldPrice)}
                  </span>
                )}
                <span className="font-headline-xl text-headline-lg text-primary font-extrabold tabular-nums">
                  {formatBRL(product.price)}
                </span>
                <span className="block text-xs text-secondary font-medium tabular-nums">
                  ou {formatBRL(pixPrice)} à vista no Pix (-5%)
                </span>
              </div>
              <span className="text-xs text-outline">{product.installmentsText}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>Adicionar ao Carrinho</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleFavorite(product.id)}
                className={`p-3 rounded-xl bg-surface-container-high transition-colors cursor-pointer ${isFavorite ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
                  }`}
                aria-label="Favoritar"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${isFavorite ? 'material-symbols-filled' : ''
                    }`}
                >
                  favorite
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
