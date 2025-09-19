
import React, { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

export default function DateRangePicker({ onGenerate, onSaved }){
  const [start, setStart] = useState(dayjs().subtract(30,'day').format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);

  async function generate(){
    setLoading(true);
    try {
      const res = await axios.post((window._API_URL || 'http://localhost:4000') + '/api/reports/date-range', { startDate: start, endDate: end, save: true });
      if(onGenerate) onGenerate(res.data.report);
      if(onSaved) onSaved();
    } catch (err){
      alert('Error: '+(err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <label>Start: <input type="date" value={start} onChange={e=>setStart(e.target.value)} /></label>
      <label>End: <input type="date" value={end} onChange={e=>setEnd(e.target.value)} /></label>
      <button onClick={generate} disabled={loading}>{loading? 'Loading...': 'Generate & Save Report'}</button>
    </div>
  );
}
