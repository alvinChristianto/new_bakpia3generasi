"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VerifyEmailBanner } from "@/components/verify-email-banner";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, CheckCircle2, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, useSession } from "next-auth/react";
import { getProfile, updateProfile } from "@/app/api/endpoints/profile";
import {
  getLinkedAccounts,
  setPassword as setAccountPassword,
  unlinkProvider,
} from "@/app/api/endpoints/linked-accounts";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EditProfilePage = () => {
  const { data: session } = useSession();

  // Profile state — seeded from session
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
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

  // Linked accounts ("Akun Tertaut") state
  const [linkedLoading, setLinkedLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const [linkedError, setLinkedError] = useState("");
  const [linkedSuccess, setLinkedSuccess] = useState("");
  const [setPwData, setSetPwData] = useState({ newPassword: "", confirmPassword: "" });
  const [setPwLoading, setSetPwLoading] = useState(false);

  // Load name from backend profile (source of truth — session JWT is stale after updates)
  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (!token) return;
    getProfile(token).then((profile) => {
      setName(profile.name ?? "");
      setPhone(profile.phone_number ?? "");
    }).catch(() => {});
  }, [(session as any)?.accessToken]);

  // Load linked login methods (Google + whether a password is set)
  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (!token) return;
    setLinkedLoading(true);
    getLinkedAccounts(token)
      .then((d) => {
        setHasPassword(d.has_password);
        setProviders(d.providers);
      })
      .catch(() => {})
      .finally(() => setLinkedLoading(false));
  }, [(session as any)?.accessToken]);

  // ── Profile validation ──────────────────────────────────────────────
  const nameError = (() => {
    if (!name.trim()) return "Nama harus diisi";
    const letters = name.replace(/[^a-zA-Z]/g, "");
    if (letters.length < 3) return "Nama harus mengandung minimal 3 huruf";
    if (!/^[a-zA-Z0-9\s]+$/.test(name))
      return "Nama tidak boleh mengandung karakter spesial";
    return "";
  })();

  const phoneError = (() => {
    if (!phone.trim()) return "";
    const clean = phone.replace(/[-\s]/g, "");
    if (!/^(\+62|08)[0-9]{9,11}$/.test(clean))
      return "Nomor telepon tidak valid (harus dimulai dengan +62 atau 08)";
    return "";
  })();

  const profileCanSubmit = name.trim() !== "" && nameError === "" && phoneError === "";

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
      const token = (session as any)?.accessToken;
      await updateProfile(token, { name, phone_number: phone.trim() || null });
      setProfileSuccess("Profil berhasil diperbarui!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Gagal memperbarui profil");
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

  // ── Linked accounts handlers ────────────────────────────────────────
  const refreshLinked = async () => {
    const token = (session as any)?.accessToken;
    if (!token) return;
    try {
      const d = await getLinkedAccounts(token);
      setHasPassword(d.has_password);
      setProviders(d.providers);
    } catch {
      /* ignore */
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkedError("");
    setLinkedSuccess("");
    if (setPwData.newPassword.length < 8) {
      setLinkedError("Password minimal 8 karakter");
      return;
    }
    if (setPwData.newPassword !== setPwData.confirmPassword) {
      setLinkedError("Konfirmasi password tidak cocok");
      return;
    }
    setSetPwLoading(true);
    try {
      const token = (session as any)?.accessToken;
      await setAccountPassword(token, {
        new_password: setPwData.newPassword,
        new_password_confirmation: setPwData.confirmPassword,
      });
      setLinkedSuccess("Password berhasil disetel. Kini Anda bisa masuk dengan email & password.");
      setSetPwData({ newPassword: "", confirmPassword: "" });
      await refreshLinked();
    } catch (err: any) {
      setLinkedError(err?.response?.data?.message || "Gagal menyetel password");
    } finally {
      setSetPwLoading(false);
    }
  };

  const handleUnlink = async (provider: string) => {
    setLinkedError("");
    setLinkedSuccess("");
    try {
      const token = (session as any)?.accessToken;
      await unlinkProvider(token, provider);
      setLinkedSuccess("Metode login berhasil dilepas.");
      await refreshLinked();
    } catch (err: any) {
      setLinkedError(err?.response?.data?.message || "Gagal melepas metode login");
    }
  };

  const handleConnectGoogle = () => {
    signIn("google", { callbackUrl: "/dashboard/edit-profile" });
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 pt-20 md:pt-4">
          <div className="max-w-2xl mx-auto p-4 md:p-6">
            <VerifyEmailBanner />

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
              <TabsList className="grid w-full grid-cols-3 bg-muted">
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
                <TabsTrigger
                  value="linked"
                  className="data-[state=active]:bg-card"
                >
                  Akun Tertaut
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

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nomor Telepon{" "}
                      <span className="text-xs text-muted-foreground">(opsional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/[^\d+\-\s]/g, ""));
                          setPhoneTouched(true);
                        }}
                        onBlur={() => setPhoneTouched(true)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          phoneTouched && phoneError ? "border-destructive" : "border-border"
                        }`}
                        placeholder="+62812345678 atau 08123456789"
                      />
                    </div>
                    {phoneTouched && phoneError && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {phoneError}
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

              {/* ── Linked Accounts Tab ──────────────────────────────── */}
              <TabsContent value="linked" className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  {linkedSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {linkedSuccess}
                    </div>
                  )}
                  {linkedError && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {linkedError}
                    </div>
                  )}

                  {linkedLoading ? (
                    <div className="space-y-3">
                      <div className="bg-muted rounded-lg h-20 w-full animate-pulse" />
                      <div className="bg-muted rounded-lg h-20 w-full animate-pulse" />
                    </div>
                  ) : (
                    <>
                      {/* Google */}
                      <div className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Link2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Google</p>
                            <p className="text-sm text-muted-foreground">
                              {providers.includes("google")
                                ? "Tersambung"
                                : "Belum tersambung"}
                            </p>
                          </div>
                        </div>
                        {providers.includes("google") ? (
                          <Button
                            variant="outline"
                            onClick={() => handleUnlink("google")}
                            className="border-border bg-transparent hover:bg-destructive/10 text-destructive"
                          >
                            Lepas
                          </Button>
                        ) : (
                          <Button
                            onClick={handleConnectGoogle}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Hubungkan
                          </Button>
                        )}
                      </div>

                      {/* Email & Password method */}
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3 mb-1">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            Email &amp; Password
                          </p>
                        </div>
                        {hasPassword ? (
                          <p className="text-sm text-muted-foreground ml-8">
                            Sudah disetel. Ubah lewat tab{" "}
                            <span className="font-medium text-foreground">
                              Password
                            </span>
                            .
                          </p>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground ml-8 mb-4">
                              Belum disetel. Setel password agar bisa masuk dengan
                              email tanpa Google.
                            </p>
                            <form
                              onSubmit={handleSetPassword}
                              className="space-y-4"
                            >
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Password Baru *
                                </label>
                                <input
                                  type="password"
                                  value={setPwData.newPassword}
                                  onChange={(e) =>
                                    setSetPwData({
                                      ...setPwData,
                                      newPassword: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  placeholder="Minimal 8 karakter"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Konfirmasi Password *
                                </label>
                                <input
                                  type="password"
                                  value={setPwData.confirmPassword}
                                  onChange={(e) =>
                                    setSetPwData({
                                      ...setPwData,
                                      confirmPassword: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  placeholder="Ulangi password baru"
                                />
                              </div>
                              <Button
                                type="submit"
                                disabled={setPwLoading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                              >
                                {setPwLoading ? "Memproses..." : "Setel Password"}
                              </Button>
                            </form>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
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
