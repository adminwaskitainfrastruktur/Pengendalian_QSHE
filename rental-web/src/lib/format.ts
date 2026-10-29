import { SITE } from '../config'
import type { Unit } from '../data'

const nf = new Intl.NumberFormat('id-ID')

export const rupiah = (v: number) => 'Rp' + nf.format(v)

export const tanggalPanjang = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export function waLink(pesan: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(pesan)}`
}

export function pesanUntukUnit(u: Unit) {
  return `Halo, saya tertarik menyewa ${u.nama} (${u.merek}) di depo ${u.depo}. Mohon info ketersediaan dan penawaran. Lokasi proyek: [isi], tanggal mulai: [isi], durasi: [isi].`
}
