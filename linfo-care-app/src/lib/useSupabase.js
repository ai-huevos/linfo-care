import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

// Get the first patient (Roro) — single-patient app for now
let cachedPatientId = null;

export async function getPatientId() {
  if (cachedPatientId) return cachedPatientId;
  const { data } = await supabase.from('patients').select('id').limit(1).single();
  cachedPatientId = data?.id || null;
  return cachedPatientId;
}

/**
 * Generic hook for Supabase CRUD with optimistic UI
 * @param {string} table - Supabase table name
 * @param {object} options - { orderBy, ascending, filter }
 */
export function useSupabaseTable(table, options = {}) {
  const { orderBy = 'created_at', ascending = false, filter } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(null);

  // Fetch patient ID and data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pid = await getPatientId();
      if (cancelled) return;
      setPatientId(pid);
      if (!pid) { setLoading(false); return; }

      let query = supabase.from(table).select('*').eq('patient_id', pid);
      if (filter) {
        Object.entries(filter).forEach(([key, val]) => {
          query = query.eq(key, val);
        });
      }
      query = query.order(orderBy, { ascending });

      const { data: rows, error: err } = await query;
      if (!cancelled) {
        setData(rows || []);
        setError(err);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [table, orderBy, ascending, JSON.stringify(filter)]);

  const insert = useCallback(async (row) => {
    const pid = patientId || await getPatientId();
    const newRow = { ...row, patient_id: pid };
    const { data: created, error: err } = await supabase
      .from(table)
      .insert(newRow)
      .select()
      .single();
    if (created) setData(prev => ascending ? [...prev, created] : [created, ...prev]);
    return { data: created, error: err };
  }, [table, patientId, ascending]);

  const update = useCallback(async (id, updates) => {
    const { data: updated, error: err } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updated) setData(prev => prev.map(r => r.id === id ? updated : r));
    return { data: updated, error: err };
  }, [table]);

  const remove = useCallback(async (id) => {
    const { error: err } = await supabase.from(table).delete().eq('id', id);
    if (!err) setData(prev => prev.filter(r => r.id !== id));
    return { error: err };
  }, [table]);

  const upsert = useCallback(async (row) => {
    const pid = patientId || await getPatientId();
    const newRow = { ...row, patient_id: pid };
    const { data: result, error: err } = await supabase
      .from(table)
      .upsert(newRow)
      .select()
      .single();
    if (result) {
      setData(prev => {
        const exists = prev.find(r => r.id === result.id);
        if (exists) return prev.map(r => r.id === result.id ? result : r);
        return ascending ? [...prev, result] : [result, ...prev];
      });
    }
    return { data: result, error: err };
  }, [table, patientId, ascending]);

  return { data, loading, error, patientId, insert, update, remove, upsert, setData };
}
