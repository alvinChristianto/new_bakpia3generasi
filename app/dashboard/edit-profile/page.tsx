"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EditProfilePage = () => {
  const { data: session } = useSession();

  // Profile state — seeded from session
  const [name, setName] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load name from session on mount
  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  // ── Profile validation ──────────────────────────────────────────────
  const nameError = (() => {
    if (!name.trim()) return "Nama harus diisi";
    const letters = name.replace(/[^a-zA-Z]/g, "");
    if (letters.length < 3) return "Nama harus mengandung minimal 3 huruf";
    if (!/^[a-zA-Z0-9\s]+$/.test(name))
      return "Nama tidak boleh mengandung karakter spesial";
    return "";
  })();

  const profileCanSubmit = name.trim() !== "" && nameError === "";

  // ── Password validation ─────────────────────────────────────────────
  const { currentPassword, newPassword, confirmPassword } = passwordData;

  const currentPasswordOk = currentPassword.length >= 6;
  const newPasswordOk = newPassword.length >= 8;
  const confirmPasswordOk =
    confirmPassword.length > 0 && confirmPassword === newPassword;

  const passwordCanSubmit = currentPasswordOk && newPasswordOk && confirmPasswordOk;

  // ── Handlers ────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileCanSubmit) return;
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
          body: JSON.stringify({ name }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui profil");
      setProfileSuccess("Profil berhasil diperbarui!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordCanSubmit) return;
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/profile/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: confirmPassword,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengubah password");
      setPasswordSuccess("Password berhasil diubah!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 pt-20 md:pt-4">
          <div className="max-w-2xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <User className="w-8 h-8" />
                Edit Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                Kelola informasi akun Anda
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-card"
                >
                  Profil
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="data-[state=active]:bg-card"
                >
                  Password
                </TabsTrigger>
              </TabsList>

              {/* ── Profile Tab ──────────────────────────────────────── */}
              <TabsContent value="profile" className="space-y-6">
                <form
                  onSubmit={handleProfileSubmit}
                  className="bg-card border border-border rounded-lg p-6 space-y-6"
                >
                  {profileSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {profileSuccess}
                    </div>
                  )}
                  {profileError && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {profileError}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        name && nameError
                          ? "border-destructive"
                          : "border-border"
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {name && nameError && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {nameError}
                      </div>
                    )}
                  </div>

                  {/* Email — disabled/read-only */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email <span className="text-xs">(tidak dapat diubah)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={session?.user?.email ?? ""}
                        readOnly
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!profileCanSubmit || profileLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {profileLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </form>
              </TabsContent>

              {/* ── Password Tab ─────────────────────────────────────── */}
              <TabsContent value="password" className="space-y-6">
                <form
                  onSubmit={handlePasswordSubmit}
                  className="bg-card border border-border rounded-lg p-6 space-y-6"
                >
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {passwordError}
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password Saat Ini *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, currentPassword: e.target.value });
                          setPasswordError("");
                        }}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          currentPassword && !currentPasswordOk
                            ? "border-destructive"
                            : "border-border"
                        }`}
                        placeholder="Minimal 6 karakter"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {currentPassword && !currentPasswordOk && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Minimal 6 karakter
                      </div>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password Baru *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          newPassword && !newPasswordOk
                            ? "border-destructive"
                            : "border-border"
                        }`}
                        placeholder="Minimal 8 karakter"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                        }
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {newPassword && !newPasswordOk && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Minimal 8 karakter
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Konfirmasi Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          confirmPassword && !confirmPasswordOk
                            ? "border-destructive"
                            : confirmPasswordOk
                            ? "border-green-400"
                            : "border-border"
                        }`}
                        placeholder="Ulangi password baru"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && !confirmPasswordOk && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Password tidak cocok
                      </div>
                    )}
                    {confirmPasswordOk && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        Password cocok
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={!passwordCanSubmit || passwordLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {passwordLoading ? "Memproses..." : "Ubah Password"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default EditProfilePage;
