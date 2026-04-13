import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Eraser, PenLine } from "lucide-react";

interface SignaturePadProps {
  label?: string;
  showNameField?: boolean;
  existingSignature?: string | null;
  existingName?: string | null;
  existingDate?: string | null;
  onSave: (data: { signature: string; name?: string }) => void;
  disabled?: boolean;
}

export default function SignaturePad({
  label = "Assinatura",
  showNameField = false,
  existingSignature,
  existingName,
  existingDate,
  onSave,
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [signerName, setSignerName] = useState("");

  const isSigned = !!existingSignature;

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "hsl(var(--foreground))";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    return ctx;
  }, []);

  // Resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isSigned) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, [isSigned]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || isSigned) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasContent(true);
  };

  const endDraw = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const signature = canvas.toDataURL("image/png");
    onSave({ signature, name: showNameField ? signerName || undefined : undefined });
  };

  if (isSigned) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" /> Assinado
          </Badge>
        </div>
        <div className="rounded-md border bg-muted/30 p-2">
          <img src={existingSignature!} alt="Assinatura" className="max-h-24 mx-auto" />
        </div>
        {existingName && <p className="text-xs text-muted-foreground">Nome: {existingName}</p>}
        {existingDate && (
          <p className="text-xs text-muted-foreground">
            Em: {new Date(existingDate).toLocaleString("pt-BR")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <PenLine className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {showNameField && (
        <Input
          placeholder="Nome do signatário"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          disabled={disabled}
        />
      )}

      <div className="rounded-md border bg-background touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-32 cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={clear} disabled={disabled || !hasContent}>
          <Eraser className="h-4 w-4 mr-1" /> Limpar
        </Button>
        <Button type="button" size="sm" onClick={confirm} disabled={disabled || !hasContent}>
          <Check className="h-4 w-4 mr-1" /> Confirmar assinatura
        </Button>
      </div>
    </div>
  );
}
