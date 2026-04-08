import React, { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Props {
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  size?: 'sm' | 'lg';
}

const AvatarUpload: React.FC<Props> = ({ currentUrl, onUploadComplete, size = 'lg' }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = size === 'lg'
    ? 'w-20 h-20 text-2xl'
    : 'w-12 h-12 text-sm';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('La imagen no debe superar 3MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten imagenes JPG, PNG o WebP');
      return;
    }

    setError('');
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError('Error al subir la imagen. Intenta de nuevo.');
      setPreview(currentUrl || null);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl + '?t=' + Date.now();

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    onUploadComplete(publicUrl);
    setUploading(false);
  };
  const handleDelete = async () => {
    if (!user) return;
    setUploading(true);

    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    for (const ext of extensions) {
      await supabase.storage
        .from('avatars')
        .remove([`${user.id}/avatar.${ext}`]);
    }

    await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id);

    setPreview(null);
    onUploadComplete('');
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div
          className={`${sizeClasses} rounded-2xl flex items-center justify-center overflow-hidden border-2 border-[#10B981]/20 bg-[#10B981]/10 cursor-pointer`}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="text-[#10B981]" size={size === 'lg' ? 32 : 20} />
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
            {uploading ? (
              <Loader2 size={20} className="text-white animate-spin" />
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </div>
        </div>

        {!uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#10B981] rounded-full flex items-center justify-center border-2 border-[#0A0E27] hover:bg-[#0ea371] transition-all"
          >
            <Camera size={12} className="text-[#0A0E27]" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-[#10B981] transition-colors disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : 'Cambiar foto'}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-500/50 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            Eliminar
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider text-center">
          {error}
        </p>
      )}

      <p className="text-slate-600 text-[9px] text-center leading-relaxed">
        JPG, PNG o WebP. Max 3MB.
      </p>
    </div>
  );
};

export default AvatarUpload;
