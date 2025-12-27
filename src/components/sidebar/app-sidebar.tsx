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
  Package,
  Scale,
  Settings2,
  ShoppingBasket,
  Tags,
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
          url: "/dashboard/transactions",
        },
        {
          title: "Ringkasan Dasbor",
          url: "/dashboard/overview",
        },
      ],
    },
    {
      title: "Pemesanan",
      url: "/orders",
      icon: ShoppingBasket,
      items: [
        {
          title: "List",
          url: "/orders",
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
      items: [],
    },
    {
      title: "Atribut Produk",
      url: "/attributes",
      icon: Tags,
      items: [
        {
          title: "Merek",
          url: "/attributes/brands",
        },
        {
          title: "Kategori",
          url: "/attributes/categories",
        },
        {
          title: "Sumber",
          url: "/attributes/sources",
        },
        {
          title: "Status",
          url: "/attributes/statuses",
        },
        {
          title: "Tipe Banner",
          url: "/attributes/banner",
        },
        {
          title: "Kondisi Produk",
          url: "/attributes/conditions/product",
        },
        {
          title: "Kondisi Paket",
          url: "/attributes/conditions/package",
        },
      ],
    },
    {
      title: "Media",
      url: "/media",
      icon: Package,
      items: [],
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
          title: "Hero Section",
          url: "/marketing/hero",
        },
        {
          title: "Banner Promosi",
          url: "/marketing/promo",
        },
        {
          title: "Formulir Grosir",
          url: "/marketing/wholsaler",
        },
      ],
    },
    {
      title: "Bantuan",
      url: "/help",
      icon: Headset,
      items: [
        {
          title: "Informasi Pengambilan",
          url: "#",
        },
        {
          title: "Cara Membeli",
          url: "#",
        },
        {
          title: "Cara Pembayaran",
          url: "#",
        },
        {
          title: "Pertanyaan Berulang",
          url: "#",
        },
      ],
    },
    {
      title: "Kebijakan",
      url: "/terms",
      icon: Scale,
      items: [
        {
          title: "Syarat & Ketentuan",
          url: "#",
        },
        {
          title: "Kebijakan Privasi",
          url: "#",
        },
        {
          title: "Penaifan",
          url: "#",
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
          url: "#",
        },
        {
          title: "Staff",
          url: "#",
        },
        {
          title: "Pajak",
          url: "#",
        },
        {
          title: "Metode Pembayaran",
          url: "#",
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
              asChild
            >
              <Link href="#" className="flex flex-col items-start">
                <LogoNoSSR />
                <p className="text-sm -mt-2 font-medium dark:group-hover:text-gray-200">
                  Back Office
                </p>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*<NavProjects projects={data.projects} />
            <NavSecondary items={data.navSecondary} className="mt-auto" />*/}
      </SidebarContent>
      <SidebarFooter>{/*<NavUser user={data.user} />*/}</SidebarFooter>
    </Sidebar>
  );
};
