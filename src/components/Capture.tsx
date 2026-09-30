"use client";
import { useEffect, useRef, useState } from "react";
import { CameraIcon, MirrorIcon, UploadIcon } from "./icons";
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
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-stone-200/80 bg-gradient-to-b from-white to-clay-50 shadow-lift">
        {camOn ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[64%] w-[62%] rounded-[50%] border-2 border-white/90 shadow-[0_0_0_9999px_rgba(28,25,23,0.35)]" />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-stone-500">
            <div className="relative flex h-[64%] w-[62%] items-center justify-center rounded-[50%] border-2 border-dashed border-clay-200">
              <MirrorIcon className="h-12 w-12 text-clay-300" />
            </div>
            <p className="mt-4 text-sm text-stone-500">Center your face in the oval</p>
          </div>
        )}
      </div>
      {camError && <p className="text-center text-sm text-clay-600">{camError}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        {camOn ? (
          <Button variant="accent" onClick={snap}><CameraIcon className="h-4 w-4" /> Take selfie</Button>
        ) : (
          <Button variant="accent" onClick={startCam}><CameraIcon className="h-4 w-4" /> Use camera</Button>
        )}
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50">
          <UploadIcon className="h-4 w-4" /> Upload photo
          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>
    </div>
  );
}
