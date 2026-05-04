import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Trash2, Upload, ImageIcon, Loader2 } from "lucide-react";

interface OSPhotosProps {
  orderId: string;
  photos: string[];
  canEdit: boolean;
  onChange: (photos: string[]) => void;
}

const BUCKET = "os-photos";

export default function OSPhotos({ orderId, photos, canEdit, onChange }: OSPhotosProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const persistPhotos = async (next: string[]) => {
    const { error } = await supabase
      .from("service_orders")
      .update({ photos: next })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao salvar fotos", description: error.message, variant: "destructive" });
      return false;
    }
    onChange(next);
    return true;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${orderId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
        if (error) {
          toast({ title: "Falha no upload", description: error.message, variant: "destructive" });
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (uploaded.length) {
        const next = [...(photos || []), ...uploaded];
        const ok = await persistPhotos(next);
        if (ok) toast({ title: `${uploaded.length} foto(s) anexada(s)` });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm("Remover esta foto?")) return;
    // Extract storage path after bucket name
    const marker = `/${BUCKET}/`;
    const idx = url.indexOf(marker);
    const path = idx >= 0 ? url.slice(idx + marker.length) : null;
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
    const next = (photos || []).filter((p) => p !== url);
    await persistPhotos(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ImageIcon className="h-4 w-4" /> Fotos / Evidências
          {photos?.length > 0 && (
            <span className="text-xs text-muted-foreground">({photos.length})</span>
          )}
        </h3>
        {canEdit && (
          <div className="flex gap-2 print:hidden">
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => cameraRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Camera className="h-4 w-4" /> Câmera
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Enviando..." : "Anexar"}
            </Button>
          </div>
        )}
      </div>

      {photos?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={url}
                alt="Evidência da OS"
                className="h-full w-full object-cover cursor-zoom-in transition-transform group-hover:scale-105"
                onClick={() => setPreview(url)}
                loading="lazy"
              />
              {canEdit && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                  onClick={() => handleDelete(url)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma foto anexada{canEdit ? ". Use os botões acima para enviar." : "."}
          </p>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="Visualização" className="max-h-full max-w-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
