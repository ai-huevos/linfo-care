import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Trash2, Download, Eye, Loader2, Wifi, Search, Filter, File, Image, FileSpreadsheet } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { getPatientId } from '../../lib/useSupabase';

const docTypes = {
  lab: { label: 'Laboratorio', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  imaging: { label: 'Imagen', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  report: { label: 'Reporte', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  prescription: { label: 'Receta', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  consent: { label: 'Consentimiento', color: 'bg-stone-100 text-stone-600 border-stone-200' },
  other: { label: 'Otro', color: 'bg-stone-100 text-stone-600 border-stone-200' },
};

function getFileIcon(fileName) {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return Image;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  return File;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documents() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', doc_type: 'other', description: '' });
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pid = await getPatientId();
      if (!pid || cancelled) { setLoading(false); return; }
      const { data } = await supabase.from('documents').select('*').eq('patient_id', pid).order('created_at', { ascending: false });
      if (!cancelled) { setDocs(data || []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file || !form.title.trim()) return;

    setUploading(true);
    const pid = await getPatientId();
    const filePath = `${pid}/${Date.now()}_${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (uploadError) {
      alert('Error subiendo archivo: ' + uploadError.message);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);

    // Save metadata to DB
    const { data: doc } = await supabase.from('documents').insert({
      patient_id: pid,
      uploaded_by: user?.id,
      title: form.title.trim(),
      doc_type: form.doc_type,
      description: form.description.trim() || null,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
    }).select().single();

    if (doc) {
      setDocs(prev => [doc, ...prev]);
      setForm({ title: '', doc_type: 'other', description: '' });
      setShowUpload(false);
      if (fileRef.current) fileRef.current.value = '';
    }
    setUploading(false);
  };

  const deleteDoc = async (doc) => {
    if (!confirm(`¿Eliminar "${doc.title}"?`)) return;
    // Delete from storage
    const path = doc.file_url?.split('/documents/')[1];
    if (path) await supabase.storage.from('documents').remove([decodeURIComponent(path)]);
    // Delete from DB
    await supabase.from('documents').delete().eq('id', doc.id);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const filtered = docs.filter(d => {
    const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase()) || d.file_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.doc_type === filterType;
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Cargando documentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle subtitle="Laboratorios, imágenes, reportes y recetas de Roro. Sube cualquier documento médico para que toda la familia tenga acceso.">
        Documentos médicos
      </SectionTitle>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600">
          <Wifi className="w-3 h-3" />
          <span>Documentos compartidos con toda la familia</span>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-600/20 transition-all"
        >
          <Upload className="w-4 h-4" />
          Subir documento
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <Card className="animate-fade-in">
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-600" />
            Subir nuevo documento
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Título del documento *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Hemograma abril 15, PET-CT inicial..."
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Tipo</label>
                <select
                  value={form.doc_type}
                  onChange={e => setForm({ ...form, doc_type: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {Object.entries(docTypes).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Archivo *</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv"
                  className="w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-stone-100 file:text-stone-700 file:text-sm file:font-medium hover:file:bg-stone-200 file:cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Descripción (opcional)</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Notas adicionales sobre el documento..."
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={!form.title.trim() || !fileRef.current?.files[0] || uploading}
              className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-40"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar documento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterType === 'all' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'}`}
          >
            Todos ({docs.length})
          </button>
          {Object.entries(docTypes).map(([key, val]) => {
            const count = docs.filter(d => d.doc_type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterType === key ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'}`}
              >
                {val.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents list */}
      {filtered.length === 0 ? (
        <Card tone="muted">
          <p className="text-sm text-stone-500 text-center py-6">
            {docs.length === 0 ? 'Sin documentos todavía. Sube el primer documento médico de Roro.' : 'No se encontraron documentos con esa búsqueda.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => {
            const FileIcon = getFileIcon(doc.file_name);
            const typeConfig = docTypes[doc.doc_type] || docTypes.other;
            return (
              <Card key={doc.id} className="animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-none">
                    <FileIcon className="w-5 h-5 text-stone-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-stone-900 truncate">{doc.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-none ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    {doc.description && <p className="text-xs text-stone-500 mb-1">{doc.description}</p>}
                    <div className="flex items-center gap-3 text-[10px] text-stone-400">
                      <span>{doc.file_name}</span>
                      <span>{formatSize(doc.file_size)}</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-stone-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Ver/Descargar"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deleteDoc(doc)}
                      className="p-2 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
