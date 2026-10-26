"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function BannerCarrossel() {
  const [atual, setAtual] = useState(0);

  const banners = [
    { id: 1, imagem: "/banner1.png", link: "/categoria/exclusivas", alt: "Ofertas especiais de moda infantil" },
    { id: 2, imagem: "/banner2-novo.png", link: "/categoria/meninas", alt: "Nova coleção colorida de moda infantil" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAtual((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const slideAnterior = () => {
    setAtual((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const proximoSlide = () => {
    setAtual((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full overflow-hidden group bg-gray-50">
      
      <div 
        className="flex transition-transform duration-700 ease-in-out h-[200px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px]"
        style={{ transform: `translateX(-${atual * 100}%)` }}
      >
        {banners.map((banner) => (
          <Link key={banner.id} href={banner.link} className="w-full h-full flex-shrink-0 relative cursor-pointer">
            <Image
              src={banner.imagem} 
              alt={banner.alt}
              fill
              sizes="100vw"
              className="object-cover object-center"
              preload={banner.id === 1}
            />
          </Link>
        ))}
      </div>

      <button 
        onClick={slideAnterior} 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-2xl text-[#BA68C8] opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10 hover:scale-110"
      >
        ❮
      </button>

      <button 
        onClick={proximoSlide} 
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-2xl text-[#BA68C8] opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10 hover:scale-110"
      >
        ❯
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setAtual(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
              atual === index ? "bg-[#BA68C8] w-8" : "bg-white/80 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
