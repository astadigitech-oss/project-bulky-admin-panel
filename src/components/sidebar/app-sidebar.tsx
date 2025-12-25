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
  Megaphone,
  Package,
  Settings2,
  Tags,
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
          title: "Form Grosir",
          url: "/marketing/wholsaler",
        },
      ],
    },
    {
      title: "Pengaturan",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "PPN",
          url: "#",
        },
        {
          title: "Metode Pembayaran",
          url: "#",
        },
        {
          title: "Informasi Pengambilan",
          url: "#",
        },
        {
          title: "Syarat & Ketentuan",
          url: "#",
        },
        {
          title: "Disclaimer",
          url: "#",
        },
        {
          title: "Kontak",
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
