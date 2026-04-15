"use client";

import Image from "next/image";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Package, Calendar, MapPin, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "success" | "expired" | "pending";
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  total: number;
  address: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    date: "2024-01-15",
    status: "success",
    items: [
      {
        name: "Bakpia Kukus Premium",
        quantity: 2,
        price: 75000,
        image: "/bakpia-kukus.jpg",
      },
    ],
    total: 200000,
    address: "Jalan Malioboro No. 123, Yogyakarta",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    date: "2024-01-10",
    status: "success",
    items: [
      {
        name: "Bakpia Pathok Regular",
        quantity: 1,
        price: 60000,
        image: "/bakpia-pathok.jpg",
      },
      {
        name: "Bakpia Premium Edition",
        quantity: 1,
        price: 150000,
        image: "/bakpia-premium.jpg",
      },
    ],
    total: 260000,
    address: "Jalan Gejayan, Yogyakarta",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    date: "2024-01-05",
    status: "expired",
    items: [
      {
        name: "Bakpia Kukus Premium",
        quantity: 3,
        price: 75000,
        image: "/bakpia-kukus.jpg",
      },
    ],
    total: 300000,
    address: "Jalan Diponegoro, Yogyakarta",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-4 h-4 mr-1" />
          Selesai
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <Clock className="w-4 h-4 mr-1" />
          Expired
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-4 h-4 mr-1" />
          Menunggu
        </Badge>
      );
    default:
      return null;
  }
};

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const getOrders = async () => {
      if (session?.accessToken) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/orderlists`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: "application/json",
            },
          },
        );
        const data = await res.json();
        console.log("Orders Data:", data.data.orders);
        setOrders(data.data.orders);
      }
    };

    getOrders();
  }, [session]);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 pt-20 md:pt-4">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="w-8 h-8" />
                Pesanan Saya
              </h1>
              <p className="text-muted-foreground mt-2">
                Lihat riwayat pesanan Anda di sini
              </p>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">
                  Anda belum memiliki pesanan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-border">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-foreground">
                            {order.orderNumber}
                          </h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">
                          Total
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {formatRupiah(order.total)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4 mb-6 pb-6 border-b border-border">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {item.name}
                            </h4>
                            <p className="text-muted-foreground text-sm mt-1">
                              Qty: {item.quantity} × {formatRupiah(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Alamat Pengiriman
                        </p>
                        <p className="text-foreground font-medium">
                          {order.address}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
