import { CLOUDINARY_CLOUD } from "../config/cloudinary.ts";

type Opts = {
  w?: number; h?: number;          // kích thước
  crop?: "fill" | "fit" | "scale" | "thumb";
  q?: number | "auto";
  f?: "auto" | "webp" | "avif" | "jpg" | "png";
  dpr?: "auto" | number;
  g?: "auto" | "center" | "faces"; // điểm cắt (gravity), "g_auto" đẹp
};

export function cld(publicId: string, opts: Opts = {}) {
  const t = [
    `f_${opts.f ?? "auto"}`,
    `q_${opts.q ?? "auto"}`,
    `dpr_${opts.dpr ?? "auto"}`,
    opts.w ? `w_${opts.w}` : "",
    opts.h ? `h_${opts.h}` : "",
    `c_${opts.crop ?? "fill"}`,
    `g_${opts.g ?? "auto"}`,
  ].filter(Boolean).join(",");

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${t}/${publicId}`;
}
