import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../shared/api/axios'
import { endpoints } from '../../shared/api/endpoints'
import AccountSelect from '../../shared/components/AccountSelect'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import SymbolAutocomplete from '../../shared/components/SymbolAutocomplete'
import { notifyError, notifySuccess } from '../../shared/utils/notify'

const STATUS_LABELS = {
  PENDING: 'Beklemede',
  ALLOCATED: 'Tahsis Edildi',
  REJECTED: 'Reddedildi',
  LISTED: 'Listelendi',
}

const initialForm = {
  accountId: '',
  companyName: '',
  symbol: '',
  appliedAt: new Date().toISOString().slice(0, 10),
  lotCount: '',
  applicationPrice: '',
  note: '',
}

function toUpdateFormState(ipo) {
  return {
    status: ipo.status,
    allocatedQty: ipo.allocatedQty ?? '',
    allocatedPrice: ipo.allocatedPrice ?? '',
    listingPrice: ipo.listingPrice ?? '',
    listedAt: ipo.listedAt ?? '',
  }
}

export default function IPO() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingIpo, setEditingIpo] = useState(null)
  const [updateForm, setUpdateForm] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: ipos = [], isLoading } = useQuery({
    queryKey: ['ipo'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.ipo.list)
      return data
    },
  })

  const { data: performance } = useQuery({
    queryKey: ['ipo', 'performance'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.ipo.performance)
      return data
    },
  })

  const createIpo = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(endpoints.ipo.list, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo'] })
      setForm(initialForm)
      setShowForm(false)
      notifySuccess('Başvuru eklendi')
    },
    onError: (error) => notifyError(error, 'Başvuru eklenemedi'),
  })

  const updateIpo = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(endpoints.ipo.byId(id), payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo'] })
      setEditingIpo(null)
      setUpdateForm(null)
      notifySuccess('Başvuru güncellendi')
    },
    onError: (error) => notifyError(error, 'Başvuru güncellenemedi'),
  })

  const deleteIpo = useMutation({
    mutationFn: async (id) => {
      await api.delete(endpoints.ipo.byId(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo'] })
      setDeleteTarget(null)
      notifySuccess('Başvuru silindi')
    },
    onError: (error) => {
      notifyError(error, 'Başvuru silinemedi')
      setDeleteTarget(null)
    },
  })

  const convertIpo = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(endpoints.ipo.convert(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      notifySuccess('Portföye aktarıldı')
    },
    onError: (error) => notifyError(error, 'Portföye aktarılamadı'),
  })

  const currencyFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    createIpo.mutate({
      ...form,
      lotCount: Number(form.lotCount),
      applicationPrice: Number(form.applicationPrice),
    })
  }

  function handleEditClick(ipo) {
    setEditingIpo(ipo)
    setUpdateForm(toUpdateFormState(ipo))
  }

  function handleUpdateChange(e) {
    const { name, value } = e.target
    setUpdateForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleUpdateSubmit(e) {
    e.preventDefault()
    updateIpo.mutate({
      id: editingIpo.id,
      payload: {
        status: updateForm.status,
        allocatedQty: updateForm.allocatedQty === '' ? null : Number(updateForm.allocatedQty),
        allocatedPrice: updateForm.allocatedPrice === '' ? null : Number(updateForm.allocatedPrice),
        listingPrice: updateForm.listingPrice === '' ? null : Number(updateForm.listingPrice),
        listedAt: updateForm.listedAt === '' ? null : updateForm.listedAt,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Halka Arz Başvuruları</h1>
        <button
          onClick={() => {
            setEditingIpo(null)
            setShowForm((v) => !v)
          }}
          className="rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark"
        >
          {showForm ? 'Kapat' : 'Yeni Başvuru'}
        </button>
      </div>

      {performance && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Toplam Başvuru</div>
            <div className="mt-1 text-xl font-semibold">{performance.totalApplied}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Tahsis Oranı</div>
            <div className="mt-1 text-xl font-semibold">{performance.allocationRate.toFixed(1)}%</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Toplam Kâr</div>
            <div className={`mt-1 text-xl font-semibold ${performance.totalProfit >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
              {currencyFmt.format(performance.totalProfit)}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">En İyi / En Kötü</div>
            <div className="mt-1 text-sm font-medium">
              {performance.bestIpo ?? '-'} / {performance.worstIpo ?? '-'}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-lg bg-white p-4 shadow-sm">
          <AccountSelect
            value={form.accountId}
            onChange={(accountId) => setForm((prev) => ({ ...prev, accountId }))}
            required
          />
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Şirket adı"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
          <SymbolAutocomplete
            value={form.symbol}
            onChange={(symbol) => setForm((prev) => ({ ...prev, symbol }))}
            placeholder="Sembol (opsiyonel, listelendikten sonra girilebilir)"
          />
          <input
            name="appliedAt"
            value={form.appliedAt}
            onChange={handleChange}
            type="date"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="lotCount"
            value={form.lotCount}
            onChange={handleChange}
            type="number"
            placeholder="Lot adedi"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="applicationPrice"
            value={form.applicationPrice}
            onChange={handleChange}
            type="number"
            step="0.0001"
            placeholder="Başvuru fiyatı"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Not (opsiyonel)"
            className="col-span-2 rounded border border-gray-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={createIpo.isPending}
            className="col-span-2 rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            {createIpo.isPending ? 'Kaydediliyor...' : 'Başvuru Ekle'}
          </button>
        </form>
      )}

      {editingIpo && updateForm && (
        <form
          onSubmit={handleUpdateSubmit}
          className="grid grid-cols-2 gap-3 rounded-lg border border-brand-mid/30 bg-white p-4 shadow-sm"
        >
          <h3 className="col-span-2 font-semibold">{editingIpo.companyName} — Durum Güncelle</h3>

          <select
            name="status"
            value={updateForm.status}
            onChange={handleUpdateChange}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div />

          <input
            name="allocatedQty"
            value={updateForm.allocatedQty}
            onChange={handleUpdateChange}
            type="number"
            placeholder="Tahsis edilen adet"
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="allocatedPrice"
            value={updateForm.allocatedPrice}
            onChange={handleUpdateChange}
            type="number"
            step="0.0001"
            placeholder="Tahsis fiyatı"
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="listingPrice"
            value={updateForm.listingPrice}
            onChange={handleUpdateChange}
            type="number"
            step="0.0001"
            placeholder="Listeleme fiyatı"
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="listedAt"
            value={updateForm.listedAt}
            onChange={handleUpdateChange}
            type="date"
            placeholder="Listeleme tarihi"
            className="rounded border border-gray-300 px-3 py-2"
          />

          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={updateIpo.isPending}
              className="flex-1 rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
            >
              {updateIpo.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingIpo(null)
                setUpdateForm(null)
              }}
              className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-600 hover:bg-gray-50"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Şirket</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Başvuru</th>
              <th className="px-4 py-3">Tahsisat</th>
              <th className="px-4 py-3">Listeleme</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            )}
            {ipos.map((ipo) => (
              <tr key={ipo.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium">{ipo.companyName}</td>
                <td className="px-4 py-3">{STATUS_LABELS[ipo.status] ?? ipo.status}</td>
                <td className="px-4 py-3">
                  {ipo.lotCount} lot @ {currencyFmt.format(ipo.applicationPrice)}
                </td>
                <td className="px-4 py-3">
                  {ipo.allocatedQty ? `${ipo.allocatedQty} @ ${currencyFmt.format(ipo.allocatedPrice)}` : '-'}
                </td>
                <td className="px-4 py-3">
                  {ipo.listingPrice ? currencyFmt.format(ipo.listingPrice) : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {ipo.status === 'ALLOCATED' && ipo.listedAt && (
                      <button
                        onClick={() => convertIpo.mutate(ipo.id)}
                        className="text-brand-green hover:underline"
                      >
                        Portföye Aktar
                      </button>
                    )}
                    <button onClick={() => handleEditClick(ipo)} className="text-brand-mid hover:underline">
                      Düzenle
                    </button>
                    <button onClick={() => setDeleteTarget(ipo)} className="text-brand-red hover:underline">
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Başvuruyu sil"
        message={`"${deleteTarget?.companyName}" başvurusunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        onConfirm={() => deleteIpo.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
