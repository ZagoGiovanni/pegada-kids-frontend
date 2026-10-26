"use client";

import Image, { type ImageLoader } from "next/image";

const manterUrlOriginal: ImageLoader = ({ src }) => src;

type ImagemProdutoProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "eager" | "lazy";
};

export function ImagemProduto({
  src,
  alt,
  className = "h-full w-full object-cover",
  sizes = "160px",
  loading = "lazy",
}: ImagemProdutoProps) {
  return (
    <Image
      loader={manterUrlOriginal}
      unoptimized
      src={src}
      alt={alt}
      width={600}
      height={750}
      sizes={sizes}
      loading={loading}
      className={className}
    />
  );
}
