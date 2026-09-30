"use client";
import { useEffect, useRef, useState } from "react";
import { MirrorIcon } from "./icons";
import { Button } from "./ui";

export function Capture({ onImage }: { onImage: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  async function startCam() {
    setCamError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } } });
      streamRef.current = s;
      setCamOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      });
    } catch {
      setCamError("Camera not available. Upload a selfie instead.");
    }
  }

  function snap() {
    const v = videoRef.current!;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCamOn(false);
    onImage(c.toDataURL("image/jpeg", 0.95));
  }

  function onFile(f?: File) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => onImage(String(r.result));
    r.readAsDataURL(f);
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2rem] border border-stone-200 bg-gradient-to-b from-stone-100 to-rose-50">
        {camOn ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[62%] w-[62%] rounded-[50%] border-2 border-dashed border-white/80" />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-stone-500">
            <MirrorIcon className="h-12 w-12 text-stone-400" />
            <p className="text-sm">Bare face, even light, look straight ahead.<br />Pull hair back from your forehead.</p>
          </div>
        )}
      </div>
      {camError && <p className="text-center text-sm text-rose-600">{camError}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        {camOn ? (
          <Button onClick={snap}>Take selfie</Button>
        ) : (
          <Button onClick={startCam}>Use camera</Button>
        )}
        <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50">
          Upload photo
          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>
    </div>
  );
}
