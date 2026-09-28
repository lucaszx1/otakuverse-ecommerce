import React, { useState, useEffect } from 'react';
import { ImageAssetMap } from '../data/storeData';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
  assetKey?: keyof ImageAssetMap | string;
  editMode?: boolean;
  onUpdateUrl?: (key: keyof ImageAssetMap, newUrl: string) => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  assetKey,
  editMode,
  onUpdateUrl,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [draftUrl, setDraftUrl] = useState(src || '');

  useEffect(() => {
    setHasError(false);
    setDraftUrl(src || '');
  }, [src]);

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (assetKey && onUpdateUrl && draftUrl.trim()) {
      onUpdateUrl(assetKey as keyof ImageAssetMap, draftUrl.trim());
    }
    setIsEditingUrl(false);
  };

  const imageElement =
    hasError || !src ? (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-surface-container-lowest via-surface-container to-secondary-container/40 text-on-surface-variant p-4 text-center ${className}`}
      >
        <span className="material-symbols-outlined text-primary text-3xl mb-1">
          image
        </span>
        <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface line-clamp-2">
          {fallbackLabel || alt || 'OtakuVerse Asset'}
        </span>
      </div>
    ) : (
      <img
        src={src}
        alt={alt || 'OtakuVerse'}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
        {...rest}
      />
    );

  if (!editMode || !assetKey || !onUpdateUrl) {
    return imageElement;
  }

  return (
    <div className="relative w-full h-full group/edit">
      {imageElement}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-0 bg-black/60 opacity-0 group-hover/edit:opacity-100 transition-opacity flex items-center justify-center p-2 z-20"
      >
        {!isEditingUrl ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDraftUrl(src || '');
              setIsEditingUrl(true);
            }}
            className="px-2.5 py-1.5 rounded-sm bg-primary text-on-primary font-mono text-[11px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">link</span>
            <span>Link URL</span>
          </button>
        ) : (
          <form
            onSubmit={handleApplyUrl}
            className="w-full max-w-xs bg-surface-container-highest p-2 rounded-sm border border-primary/40 shadow-xl flex flex-col gap-1.5"
          >
            <input
              type="url"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-sm px-2 py-1 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
              autoFocus
            />
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingUrl(false);
                }}
                className="px-2 py-1 rounded-sm bg-surface-container text-on-surface-variant text-[10px] font-mono uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded-sm bg-primary text-on-primary text-[10px] font-mono font-bold uppercase cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
