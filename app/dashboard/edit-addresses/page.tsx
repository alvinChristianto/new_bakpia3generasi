'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { MapPin, Trash2, AlertCircle, Map, Edit, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Address {
  id: string
  fullAddress: string
  city: string
  province: string
  district: string
  subdistrict: string
  postalCode: string
  latitude?: number
  longitude?: number
}

interface FormData {
  fullAddress: string
  city: string
  province: string
  district: string
  subdistrict: string
  postalCode: string
  latitude?: number
  longitude?: number
}

interface Errors {
  [key: string]: string
}

const PROVINCES = [
  'Jawa Tengah',
  'Jawa Timur',
  'Jawa Barat',
  'DKI Jakarta',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Jambi',
  'Sumatera Selatan',
  'Lampung',
  'Bangka Belitung',
  'Kepulauan Riau',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Maluku',
  'Maluku Utara',
  'Papua Barat',
  'Papua',
  'Nusa Tenggara Timur',
  'Nusa Tenggara Barat',
  'Bali',
  'Yogyakarta',
]

const initialFormData: FormData = {
  fullAddress: '',
  city: '',
  province: '',
  district: '',
  subdistrict: '',
  postalCode: '',
}

const mockAddresses: Address[] = [
  {
    id: '1',
    fullAddress: 'Jalan Malioboro No. 123',
    city: 'Yogyakarta',
    province: 'Yogyakarta',
    district: 'Jetis',
    subdistrict: 'Mergangsan',
    postalCode: '55271',
    latitude: -7.7956,
    longitude: 110.3695,
  },
]

export default function EditAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Errors>({})
  const [showForm, setShowForm] = useState(false)
  const [mapModal, setMapModal] = useState(false)
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Errors = {}

    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Alamat lengkap harus diisi'
    } else if (formData.fullAddress.trim().length < 10) {
      newErrors.fullAddress = 'Alamat minimal 10 karakter'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Kota harus diisi'
    }

    if (!formData.province) {
      newErrors.province = 'Provinsi harus dipilih'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'Kecamatan harus diisi'
    }

    if (!formData.subdistrict.trim()) {
      newErrors.subdistrict = 'Kelurahan harus diisi'
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Kode pos harus diisi'
    } else if (!/^\d{5}$/.test(formData.postalCode.replace(/\s/g, ''))) {
      newErrors.postalCode = 'Kode pos harus 5 digit'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddOrUpdateAddress = () => {
    if (!validateForm()) return

    if (editingId) {
      // Update existing address
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingId
            ? {
                ...formData,
                id: editingId,
                latitude: mapCoords?.lat,
                longitude: mapCoords?.lng,
              }
            : addr
        )
      )
    } else {
      // Add new address
      if (addresses.length >= 3) {
        alert('Maksimal 3 alamat pengiriman')
        return
      }

      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        latitude: mapCoords?.lat,
        longitude: mapCoords?.lng,
      }
      setAddresses([...addresses, newAddress])
    }

    setFormData(initialFormData)
    setMapCoords(null)
    setErrors({})
    setShowForm(false)
    setEditingId(null)
  }

  const handleEditAddress = (address: Address) => {
    setFormData({
      fullAddress: address.fullAddress,
      city: address.city,
      province: address.province,
      district: address.district,
      subdistrict: address.subdistrict,
      postalCode: address.postalCode,
    })
    setMapCoords(
      address.latitude && address.longitude
        ? { lat: address.latitude, lng: address.longitude }
        : null
    )
    setEditingId(address.id)
    setShowForm(true)
    setErrors({})
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id))
    setDeleteConfirmId(null)
  }

  const handleOpenMap = () => {
    setMapModal(true)
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 pt-20 md:pt-4">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-8 h-8" />
                Kelola Alamat Pengiriman
              </h1>
              <p className="text-muted-foreground mt-2">
                Kelola hingga 3 alamat pengiriman Anda
              </p>
            </div>

            {/* Address Count Badge */}
            <div className="mb-6">
              <Badge variant="secondary" className="px-3 py-1">
                {addresses.length} dari 3 alamat
              </Badge>
            </div>

            {/* Add Address Button */}
            {!showForm && addresses.length < 3 && (
              <Button
                onClick={() => {
                  setShowForm(true)
                  setEditingId(null)
                  setFormData(initialFormData)
                  setMapCoords(null)
                  setErrors({})
                }}
                className="mb-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                + Tambah Alamat Baru
              </Button>
            )}

            {/* Add/Edit Address Form */}
            {showForm && (
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    {editingId ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setFormData(initialFormData)
                      setMapCoords(null)
                      setErrors({})
                      setEditingId(null)
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAddOrUpdateAddress()
                  }}
                  className="space-y-4"
                >
                  {/* Full Address */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      value={formData.fullAddress}
                      onChange={(e) => {
                        setFormData({ ...formData, fullAddress: e.target.value })
                        if (errors.fullAddress) setErrors({ ...errors, fullAddress: '' })
                      }}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition resize-none ${
                        errors.fullAddress ? 'border-destructive' : 'border-border'
                      } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder="Jalan, nomor rumah, RT/RW, nama kompleks, dll"
                      rows={3}
                    />
                    {errors.fullAddress && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {errors.fullAddress}
                      </div>
                    )}
                  </div>

                  {/* City and Province */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Kota *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value })
                          if (errors.city) setErrors({ ...errors, city: '' })
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                          errors.city ? 'border-destructive' : 'border-border'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="Yogyakarta"
                      />
                      {errors.city && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {errors.city}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Provinsi *
                      </label>
                      <select
                        value={formData.province}
                        onChange={(e) => {
                          setFormData({ ...formData, province: e.target.value })
                          if (errors.province) setErrors({ ...errors, province: '' })
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground transition ${
                          errors.province ? 'border-destructive' : 'border-border'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      >
                        <option value="">-- Pilih Provinsi --</option>
                        {PROVINCES.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                      {errors.province && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {errors.province}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* District and Subdistrict */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Kecamatan *
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => {
                          setFormData({ ...formData, district: e.target.value })
                          if (errors.district) setErrors({ ...errors, district: '' })
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                          errors.district ? 'border-destructive' : 'border-border'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="Jetis"
                      />
                      {errors.district && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {errors.district}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Kelurahan *
                      </label>
                      <input
                        type="text"
                        value={formData.subdistrict}
                        onChange={(e) => {
                          setFormData({ ...formData, subdistrict: e.target.value })
                          if (errors.subdistrict) setErrors({ ...errors, subdistrict: '' })
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                          errors.subdistrict ? 'border-destructive' : 'border-border'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="Mergangsan"
                      />
                      {errors.subdistrict && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {errors.subdistrict}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Kode Pos *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => {
                        setFormData({ ...formData, postalCode: e.target.value })
                        if (errors.postalCode) setErrors({ ...errors, postalCode: '' })
                      }}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                        errors.postalCode ? 'border-destructive' : 'border-border'
                      } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder="55271"
                      maxLength={5}
                    />
                    {errors.postalCode && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {errors.postalCode}
                      </div>
                    )}
                  </div>

                  {/* Map Coordinates */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Koordinat Lokasi
                    </label>
                    {mapCoords ? (
                      <div className="p-3 bg-muted rounded-lg border border-border mb-3">
                        <p className="text-sm text-foreground">
                          Latitude: {mapCoords.lat.toFixed(6)}
                        </p>
                        <p className="text-sm text-foreground">
                          Longitude: {mapCoords.lng.toFixed(6)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-3">
                        Belum ada koordinat yang dipilih
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={handleOpenMap}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      <Map className="w-4 h-4 mr-2" />
                      Pilih Lokasi di Peta
                    </Button>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {editingId ? 'Simpan Perubahan' : 'Simpan Alamat'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setFormData(initialFormData)
                        setMapCoords(null)
                        setErrors({})
                        setEditingId(null)
                      }}
                      variant="outline"
                      className="flex-1 bg-transparent"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Alamat Pengiriman Saya</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-card border border-border rounded-lg">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Belum ada alamat pengiriman</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {addresses.map((address, index) => (
                    <div
                      key={address.id}
                      className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition flex flex-col"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {address.city}, {address.province}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {address.district}, {address.subdistrict}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3 flex-1 mb-4">
                        <div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {address.fullAddress}
                          </p>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div>Kode Pos: {address.postalCode}</div>
                        </div>
                        {address.latitude && address.longitude && (
                          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                            📍 {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <Button
                          onClick={() => handleEditAddress(address)}
                          variant="outline"
                          className="flex-1 bg-transparent text-foreground hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <button
                          onClick={() => setDeleteConfirmId(address.id)}
                          className="flex-1 p-2 hover:bg-destructive/10 rounded-lg transition text-destructive border border-destructive/30 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-lg max-w-sm w-full shadow-lg p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">Hapus Alamat?</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Alamat yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus alamat ini?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleDeleteAddress(deleteConfirmId)}
                      className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Hapus
                    </Button>
                    <Button
                      onClick={() => setDeleteConfirmId(null)}
                      variant="outline"
                      className="flex-1 bg-transparent"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Map Modal */}
            {mapModal && (
              <MapModal
                onConfirm={(lat, lng) => {
                  setMapCoords({ lat, lng })
                  setMapModal(false)
                }}
                onCancel={() => setMapModal(false)}
                initialLat={mapCoords?.lat}
                initialLng={mapCoords?.lng}
              />
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}

interface MapModalProps {
  onConfirm: (lat: number, lng: number) => void
  onCancel: () => void
  initialLat?: number
  initialLng?: number
}

function MapModal({ onConfirm, onCancel, initialLat = -7.7956, initialLng = 110.3695 }: MapModalProps) {
  const [lat, setLat] = useState(initialLat)
  const [lng, setLng] = useState(initialLng)
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = initializeMap
    document.body.appendChild(script)

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return

    const L = (window as any).L
    if (!L) return

    const map = L.map(mapRef.current).setView([lat, lng], 13)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add marker for initial coordinates
    if (initialLat && initialLng) {
      markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      markerRef.current.openPopup()
    }

    // Handle map clicks
    map.on('click', (e: any) => {
      const clickLat = e.latlng.lat
      const clickLng = e.latlng.lng

      setLat(clickLat)
      setLng(clickLng)
      setSelectedCoords({ lat: parseFloat(clickLat.toFixed(6)), lng: parseFloat(clickLng.toFixed(6)) })

      // Update marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }
      markerRef.current = L.marker([clickLat, clickLng]).addTo(map).bindPopup(`${clickLat.toFixed(6)}, ${clickLng.toFixed(6)}`)
      markerRef.current.openPopup()
    })
  }

  const handleLatChange = (newLat: number) => {
    setLat(newLat)
    setSelectedCoords({ lat: newLat, lng })
    if (mapInstanceRef.current && markerRef.current) {
      const L = (window as any).L
      mapInstanceRef.current.removeLayer(markerRef.current)
      markerRef.current = L.marker([newLat, lng]).addTo(mapInstanceRef.current).bindPopup(`${newLat.toFixed(6)}, ${lng.toFixed(6)}`)
      markerRef.current.openPopup()
      mapInstanceRef.current.setView([newLat, lng], 13)
    }
  }

  const handleLngChange = (newLng: number) => {
    setLng(newLng)
    setSelectedCoords({ lat, lng: newLng })
    if (mapInstanceRef.current && markerRef.current) {
      const L = (window as any).L
      mapInstanceRef.current.removeLayer(markerRef.current)
      markerRef.current = L.marker([lat, newLng]).addTo(mapInstanceRef.current).bindPopup(`${lat.toFixed(6)}, ${newLng.toFixed(6)}`)
      markerRef.current.openPopup()
      mapInstanceRef.current.setView([lat, newLng], 13)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] shadow-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Pilih Lokasi di Peta</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg border border-border overflow-hidden"
            style={{ minHeight: '400px' }}
          />

          {/* Coordinate Display */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Latitude
              </label>
              <input
                type="number"
                value={lat}
                onChange={(e) => {
                  const newLat = parseFloat(e.target.value) || lat
                  handleLatChange(newLat)
                }}
                step="0.000001"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="-7.7956"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Longitude
              </label>
              <input
                type="number"
                value={lng}
                onChange={(e) => {
                  const newLng = parseFloat(e.target.value) || lng
                  handleLngChange(newLng)
                }}
                step="0.000001"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="110.3695"
              />
            </div>
          </div>

          {selectedCoords && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-foreground">
                Koordinat terpilih: <span className="font-semibold">{selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}</span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                if (selectedCoords) {
                  onConfirm(selectedCoords.lat, selectedCoords.lng)
                }
              }}
              disabled={!selectedCoords}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjutkan
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Batal
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
