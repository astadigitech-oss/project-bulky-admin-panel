"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  ChartNoAxesCombined,
  Headset,
  Megaphone,
  Newspaper,
  Package,
  Scale,
  Settings2,
  ShoppingBasket,
  TvMinimalPlay,
  Users,
} from "lucide-react";
import { NavMain } from "./nav-main";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";

const LogoNoSSR = dynamic(() => import("./logo-no-ssr"), {
  ssr: false,
  loading: () => <Skeleton className="h-7 w-3/1" />,
});

const data = {
  navMain: [
    {
      title: "Dasbor",
      url: "/dashboard",
      icon: ChartNoAxesCombined,
      items: [
        {
          title: "Dasbor Transaksi",
          url: "/dashboard/transaction",
        },
        {
          title: "Ringkasan Dasbor",
          url: "/dashboard/overview",
        },
      ],
    },
    {
      title: "Pesanan",
      url: "/orders",
      icon: ShoppingBasket,
      items: [
        {
          title: "List",
          url: "/orders/list",
        },
        {
          title: "Ulasan",
          url: "/orders/reviews",
        },
      ],
    },
    {
      title: "Pelanggan",
      url: "/customers",
      icon: Users,
      items: [],
    },
    {
      title: "Produk",
      url: "/products",
      icon: Package,
      items: [
        {
          title: "List",
          url: "/products/list",
        },
        {
          title: "Merek",
          url: "/products/brands",
        },
        {
          title: "Kategori",
          url: "/products/categories",
        },
        {
          title: "Sumber",
          url: "/products/sources",
        },
        {
          title: "Status",
          url: "/products/statuses",
        },
        {
          title: "Banner Jenis Produk",
          url: "/products/banners",
        },
        {
          title: "Kondisi Produk",
          url: "/products/conditions/product",
        },
        {
          title: "Kondisi Paket",
          url: "/products/conditions/package",
        },
      ],
    },
    {
      title: "Pemasaran",
      url: "/marketing",
      icon: Megaphone,
      items: [
        {
          title: "Diskon",
          url: "/marketing/discounts",
        },
        {
          title: "Banner Promosi",
          url: "/marketing/banners",
        },
        {
          title: "Formulir Grosir",
          url: "/marketing/wholesaler",
        },
      ],
    },
  ],
  navInfo: [
    {
      title: "Berita",
      url: "/blogs",
      icon: Newspaper,
      items: [
        {
          title: "List",
          url: "/blogs/list",
        },
        {
          title: "Kategori",
          url: "/blogs/categories",
        },
        {
          title: "Tag",
          url: "/blogs/tags",
        },
      ],
    },
    {
      title: "Video",
      url: "/videos",
      icon: TvMinimalPlay,
      items: [
        {
          title: "List",
          url: "/videos/list",
        },
        {
          title: "Kategori",
          url: "/videos/categories",
        },
        {
          title: "Tag",
          url: "/videos/tags",
        },
      ],
    },
  ],
  navPreferences: [
    {
      title: "Bantuan",
      url: "/helps",
      icon: Headset,
      items: [
        {
          title: "Informasi Pengambilan",
          url: "/helps/pickup-info",
        },
        {
          title: "Cara Pembelian",
          url: "/helps/how-to-buy",
        },
        {
          title: "Cara Pembayaran",
          url: "/helps/payment-guide",
        },
        {
          title: "FAQ",
          url: "/helps/faqs",
        },
      ],
    },
    {
      title: "Kebijakan",
      url: "/policies",
      icon: Scale,
      items: [
        {
          title: "Syarat & Ketentuan",
          url: "/policies/terms",
        },
        {
          title: "Kebijakan Privasi",
          url: "/policies/privacy",
        },
        {
          title: "Penaifan",
          url: "/policies/disclaimer",
        },
      ],
    },
    {
      title: "Pengaturan",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          // TODO: Informasi Pengambilan, Kontak, warehouses, force update, mode maintenance
          title: "Umum",
          url: "/settings/general",
        },
        {
          title: "Staff",
          url: "/settings/staff",
        },
        {
          title: "Pajak",
          url: "/settings/tax",
        },
        {
          title: "Metode Pembayaran",
          url: "/settings/payment",
        },
        {
          title: "Hero Section",
          url: "/settings/hero",
        },
      ],
    },
  ],
};

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-auto dark:hover:bg-gray-700 hover:bg-gray-200"
              render={
                <Link href="/" className="flex flex-col items-start">
                  <LogoNoSSR />
                  <p className="text-sm -mt-2 font-medium dark:group-hover:text-gray-200">
                    Back Office
                  </p>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain nav={data} />
      </SidebarContent>
      <SidebarFooter>{/*<NavUser user={data.user} />*/}</SidebarFooter>
    </Sidebar>
  );
};
