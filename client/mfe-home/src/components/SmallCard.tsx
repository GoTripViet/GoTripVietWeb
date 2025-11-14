// mfe-home/src/components/SmallCard.tsx
import React from "react";

export type SmallCardProps = {
  imageUrl: string;
  title: string;             // tên địa điểm (to nhất)
  /** Một trong hai: */
  distanceKm?: number;       // khoảng cách (km)
  staysCount?: number;       // số lượng chỗ nghỉ
  /** Tuỳ chọn: */
  subtitle?: string;         // nếu muốn truyền thẳng dòng phụ
  href?: string;             // click dẫn link
  onClick?: () => void;      // hoặc callback khi click
  className?: string;
};

function makeSubtitle({ subtitle, distanceKm, staysCount }: SmallCardProps) {
  if (subtitle) return subtitle;
  if (typeof staysCount === "number") {
    return `${staysCount.toLocaleString("vi-VN")} chỗ nghỉ`;
  }
  if (typeof distanceKm === "number") {
    // ví dụ: 1.616 km
    return `Cách đây ${distanceKm.toLocaleString("vi-VN")} km`;
  }
  return "";
}

export default function SmallCard(props: SmallCardProps) {
  const { imageUrl, title, href, onClick, className } = props;
  const sub = makeSubtitle(props);

  const CardInner = (
    <div className={`card border-0 rounded-4 h-100 ${className || ""}`}>
      <div className="ratio ratio-4x3">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-100 h-100 object-fit-cover rounded-4"
        />
      </div>

      <div className="mt-2">
        <div className="fw-bold fs-5">{title}</div>
        {sub && <div className="text-muted">{sub}</div>}
      </div>
    </div>
  );

  // Cho phép dùng như <a> hoặc <div>
  return href ? (
    <a
      href={href}
      className="text-decoration-none text-reset d-block"
      onClick={onClick}
    >
      {CardInner}
    </a>
  ) : (
    <div onClick={onClick} role={onClick ? "button" : undefined}>
      {CardInner}
    </div>
  );
}
