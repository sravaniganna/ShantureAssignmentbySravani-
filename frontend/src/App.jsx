
import React, { useState, useEffect } from 'react';
import DateRangePicker from './components/DateRangePicker';
import ReportView from './components/ReportView';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function App(){
  const [report, setReport] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(()=>{
    // connect socket.io to receive live events
    const socket = io(window._API_URL || 'http://localhost:4000');
    socket.on('connect', ()=> console.log('socket connected', socket.id));
    socket.on('reportGenerated', (data) => {
      setNotifications(n => [data, ...n]);
      // optionally refresh history
      fetchHistory();
    });
    return ()=> socket.disconnect();
  }, []);

  async function fetchHistory(){
    try {
      const res = await axios.get((window._API_URL || 'http://localhost:4000') + '/api/reports/history');
      setHistory(res.data);
    } catch (err){ console.error(err); }
  }

  useEffect(()=>{ fetchHistory(); }, []);

  return (
    <div style={{ fontFamily: 'Arial', padding: 20 }}>
      <h2>Shanture - Sales Analytics Dashboard (with live updates & history)</h2>
      <DateRangePicker onGenerate={setReport} onSaved={() => fetchHistory()} />
      <hr />
      <ReportView report={report} />
      <hr />
      <div>
        <h3>Live notifications</h3>
        <ul>
          {notifications.map((n, i) => <li key={i}>Report generated: {new Date(n.startDate).toLocaleDateString()} - revenue {n.totalRevenue}</li>)}
        </ul>
      </div>
      <hr />
      <div>
        <h3>Reports history (latest)</h3>
        <ul>
          {history.map(h => (
            <li key={h._id}>
              {new Date(h.startDate).toLocaleDateString()} → {new Date(h.endDate).toLocaleDateString()} :
              Revenue {h.totalRevenue} — <a href={(window._API_URL || 'http://localhost:4000') + '/api/reports/' + h._id + '/export'} target="_blank" rel="noreferrer">Export CSV</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
