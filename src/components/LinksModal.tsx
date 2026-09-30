import React, { useState } from 'react';
import { SystemLink } from '../types';

interface LinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: SystemLink[];
  onAddLink: (link: SystemLink) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
  onToast: (msg: string) => void;
}

export const LinksModal: React.FC<LinksModalProps> = ({
  isOpen,
  onClose,
  links,
  onAddLink,
  onDeleteLink,
  onToast
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'App' | 'Shared' | 'Calendar' | 'Resource' | 'Portal'>('App');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (url: string, title: string) => {
    navigator.clipboard?.writeText(url);
    onToast(`Pautan ${title} disalin ke papan klip!`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const linkId = 'link_' + Date.now().toString();
      const linkItem: SystemLink = {
        id: linkId,
        title: newTitle.trim(),
        url: newUrl.trim(),
        category: newCategory,
        description: newDesc.trim() || 'Pautan sistem korporat GHR Workspaces',
        isCurrent: false,
        createdAt: new Date().toISOString()
      };
      await onAddLink(linkItem);
      setNewTitle('');
      setNewUrl('');
      setNewDesc('');
      setShowAddForm(false);
      onToast('Pautan baharu berjaya disimpan ke Firebase!');
    } catch (err) {
      console.error('Error saving link:', err);
      onToast('Gagal menyimpan pautan ke Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-[#e2e8f0] max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#006a61]/10 text-[#006a61] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">link</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                Pengurusan Pautan Firebase (System Links)
              </h3>
              <span className="text-[12px] text-[#45464d]">
                Semua pautan sistem semasa & aplikasi disimpan kekal dalam Cloud Firestore
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#45464d] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current Active Links Notification */}
        <div className="bg-[#eff4ff] p-3 rounded-xl border border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006a61] animate-pulse"></span>
            <span className="text-xs text-[#0b1c30] font-semibold">
              Koleksi: <span className="font-mono text-[#006a61]">/system_links</span> ({links.length} Disimpan)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-[#006a61] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[14px]">
              {showAddForm ? 'close' : 'add'}
            </span>
            <span>{showAddForm ? 'Tutup Borang' : '+ Simpan Pautan Baharu'}</span>
          </button>
        </div>

        {/* Add Link Form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="p-4 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] flex flex-col gap-3">
            <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
              Borang Tambah Pautan ke Firebase
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#0b1c30]">Tajuk Pautan (Title)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="cth: Link Bilik Mesyuarat / App URL"
                  className="px-3 py-2 bg-white border border-[#dce9ff] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#006a61]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#0b1c30]">Kategori (Category)</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-[#dce9ff] rounded-lg text-xs text-[#0b1c30] focus:outline-none"
                >
                  <option value="App">App (Aplikasi)</option>
                  <option value="Shared">Shared (Pratonton Kongsi)</option>
                  <option value="Calendar">Calendar (Kalendar / Feed)</option>
                  <option value="Portal">Portal (Intranet)</option>
                  <option value="Resource">Resource (Sumber / Dokumen)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0b1c30]">URL Pautan (https://...)</label>
              <input
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="px-3 py-2 bg-white border border-[#dce9ff] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#006a61]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0b1c30]">Penerangan Ringkas (Description)</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Penerangan kegunaan pautan ini..."
                className="px-3 py-2 bg-white border border-[#dce9ff] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#006a61]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-[#45464d] hover:bg-[#eff4ff] rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-[#000000] text-white hover:bg-[#131b2e] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">save</span>
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan ke Firestore'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Links List */}
        <div className="flex flex-col gap-2.5">
          {links.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-white border border-[#e2e8f0] rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0b1c30] truncate">
                    {item.title}
                  </span>
                  {item.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#86f2e4] text-[#006f66] uppercase tracking-wider">
                      Aktif Semasa
                    </span>
                  )}
                  <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-[#eff4ff] text-[#45464d] border border-[#dce9ff]">
                    {item.category}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#006a61] truncate mt-1 select-all">
                  {item.url}
                </span>
                {item.description && (
                  <span className="text-[11px] text-[#45464d] mt-0.5">
                    {item.description}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleCopy(item.url, item.title)}
                  className="px-2.5 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  title="Salin Pautan"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>Salin</span>
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-white hover:bg-[#eff4ff] text-[#006a61] border border-[#dce9ff] rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  title="Buka Pautan"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  <span>Buka</span>
                </a>
                {!item.isCurrent && (
                  <button
                    type="button"
                    onClick={() => onDeleteLink(item.id)}
                    className="p-1.5 text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors"
                    title="Padam Pautan"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0] text-[11px] text-[#45464d]">
          <span>Semua link disegerakkan secara langsung dengan Firebase Firestore.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#000000] text-white rounded-lg text-xs font-semibold hover:bg-[#131b2e] transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
