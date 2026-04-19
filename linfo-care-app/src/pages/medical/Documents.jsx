import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Trash2, Download, Eye, Loader2, Wifi, Search, Filter, File, Image, FileSpreadsheet, Sparkles, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';
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
  const { user, isAdmin } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', doc_type: 'other', description: '' });
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDoc, setOcrDoc] = useState(null);  // document being analyzed
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

  // OCR: Extract data from a document using AI
  const extractDocument = async (doc) => {
    setOcrDoc(doc);
    setOcrLoading(true);
    setOcrResult(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: doc.file_url,
          doc_type: doc.doc_type,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOcrResult(data.extracted);
      } else {
        setOcrResult({ error: data.error || 'Error al extraer datos' });
      }
    } catch (err) {
      setOcrResult({ error: err.message });
    }
    setOcrLoading(false);
  };

  // Save extracted data to DB
  const saveExtractedData = async () => {
    if (!ocrResult) return;
    const pid = await getPatientId();
    let savedCount = 0;

    // Save medications
    if (ocrResult.medications?.length) {
      const medsToInsert = ocrResult.medications.map(m => ({
        patient_id: pid,
        name: m.name,
        dose: m.dose || 'Por confirmar',
        frequency: m.frequency || 'Según indicación médica',
        category: m.category || 'otro',
        status: 'active',
        notes: m.notes || '',
        side_effects: '',
        updated_by: user?.id,
      }));
      const { data } = await supabase.from('medications').insert(medsToInsert).select();
      savedCount += data?.length || 0;
    }

    // Save lab results
    if (ocrResult.lab_results?.length) {
      const labsToInsert = ocrResult.lab_results.map(l => ({
        patient_id: pid,
        entered_by: user?.id,
        lab_name: l.lab_name,
        value: l.value,
        unit: l.unit || '',
        normal_min: l.normal_min,
        normal_max: l.normal_max,
        result_date: l.result_date || new Date().toISOString().slice(0, 10),
        notes: l.notes || `Extraído de: ${ocrDoc?.title}`,
      }));
      const { data } = await supabase.from('lab_results').insert(labsToInsert).select();
      savedCount += data?.length || 0;
    }

    alert(`✅ ${savedCount} registros guardados exitosamente`);
    setOcrResult(null);
    setOcrDoc(null);
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
        {isAdmin && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-600/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            Subir documento
          </button>
        )}
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
                    {isAdmin && (
                      <button
                        onClick={() => extractDocument(doc)}
                        disabled={ocrLoading && ocrDoc?.id === doc.id}
                        className="p-2 text-stone-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Extraer datos con IA"
                      >
                        {ocrLoading && ocrDoc?.id === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {isAdmin && (
                    <button
                      onClick={() => deleteDoc(doc)}
                      className="p-2 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* OCR Extraction Results Modal */}
      {(ocrResult || ocrLoading) && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => { if (!ocrLoading) { setOcrResult(null); setOcrDoc(null); } }}>
          <Card className="!max-w-2xl w-full my-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Extracción con IA</h3>
                <p className="text-xs text-stone-500">{ocrDoc?.title}</p>
              </div>
            </div>

            {ocrLoading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-sm text-stone-500">Analizando documento con GPT-4o Vision...</p>
                <p className="text-xs text-stone-400">Esto puede tomar 15-30 segundos</p>
              </div>
            ) : ocrResult?.error ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-rose-700 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error en la extracción</span>
                </div>
                <p className="text-xs text-rose-600">{ocrResult.error}</p>
              </div>
            ) : ocrResult ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Summary */}
                {ocrResult.summary && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <p className="text-sm text-sky-900"><strong>Resumen:</strong> {ocrResult.summary}</p>
                    {ocrResult.document_date && (
                      <p className="text-xs text-sky-700 mt-1">Fecha del documento: {ocrResult.document_date}</p>
                    )}
                  </div>
                )}

                {/* Medications found */}
                {ocrResult.medications?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                      💊 Medicamentos encontrados ({ocrResult.medications.length})
                    </h4>
                    <div className="space-y-2">
                      {ocrResult.medications.map((med, i) => (
                        <div key={i} className="bg-white border border-stone-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-stone-900">{med.name}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-stone-100 rounded-full text-stone-600">{med.category}</span>
                          </div>
                          <div className="text-xs text-stone-500 space-y-0.5">
                            {med.dose && <p>Dosis: {med.dose}</p>}
                            {med.frequency && <p>Frecuencia: {med.frequency}</p>}
                            {med.route && <p>Vía: {med.route}</p>}
                            {med.notes && <p className="text-stone-400 italic">{med.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lab results found */}
                {ocrResult.lab_results?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                      🔬 Resultados de laboratorio ({ocrResult.lab_results.length})
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {ocrResult.lab_results.map((lab, i) => (
                        <div key={i} className="bg-white border border-stone-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-stone-900">{lab.lab_name}</p>
                          <p className="text-lg font-bold text-sky-700">{lab.value} <span className="text-xs font-normal text-stone-500">{lab.unit}</span></p>
                          {(lab.normal_min != null || lab.normal_max != null) && (
                            <p className="text-[10px] text-stone-400">Rango: {lab.normal_min} – {lab.normal_max} {lab.unit}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authorization info */}
                {ocrResult.authorization?.number && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">📋 Autorización</h4>
                    <p className="text-xs text-amber-800">Número: {ocrResult.authorization.number}</p>
                    {ocrResult.authorization.entity && <p className="text-xs text-amber-800">Entidad: {ocrResult.authorization.entity}</p>}
                  </div>
                )}

                {/* Doctor notes */}
                {ocrResult.doctor_notes && (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-stone-700 mb-1">📝 Notas del médico</h4>
                    <p className="text-xs text-stone-600 whitespace-pre-wrap">{ocrResult.doctor_notes}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2 border-t border-stone-200">
                  <button
                    onClick={saveExtractedData}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium px-4 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Guardar datos extraídos
                  </button>
                  <button
                    onClick={() => { setOcrResult(null); setOcrDoc(null); }}
                    className="px-4 py-3 text-sm font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  );
}
