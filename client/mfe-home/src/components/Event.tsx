// src/components/Event.tsx
import React from "react";
import "../styles/home.css";

type EventProps = {
  backgroundUrl: string;
  alt?: string;
  /** Tỉ lệ khung hình mong muốn, ví dụ "16/9" | "3/1". Mặc định 3/1 (banner). */
  ratio?: string | number;
  className?: string;
  /** Đường dẫn trang event để điều hướng khi click */
  href?: string;
  /** Callback theo dõi/ghi log trước khi điều hướng */
  onClick?: () => void;
  /** Mở tab mới khi có href */
  target?: "_self" | "_blank";
};

export default function Event({
  backgroundUrl,
  alt = "Event banner",
  ratio = "3/1",
  className = "",
  href,
  onClick,
  target = "_self",
}: EventProps) {
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (onClick) onClick();
    // Nếu có href, để trình duyệt điều hướng tự nhiên; nếu không thì chặn
    if (!href) e.preventDefault();
  };

  return (
    <a
      href={href || "#"}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      aria-label={alt}
      className={`d-block rounded-4 overflow-hidden ${className}`}
      style={{ textDecoration: "none", cursor: "pointer" }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: String(ratio),
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "block",
        }}
      />
    </a>
  );
}
