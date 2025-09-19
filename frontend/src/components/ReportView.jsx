
import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function ReportView({ report }){
  if (!report) return <div>No report generated yet.</div>;

  const revenueOption = {
    title: { text: 'Region Revenue' },
    tooltip: {},
    xAxis: { type: 'category', data: report.regionWise.map(r=>r._id) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: report.regionWise.map(r=>r.revenue) }]
  };

  const categoryOption = {
    title: { text: 'Category Revenue' },
    tooltip: {},
    xAxis: { type: 'category', data: report.categoryWise.map(c=>c._id) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: report.categoryWise.map(c=>c.revenue) }]
  };

  return (
    <div>
      <h3>Report summary</h3>
      <p>Total Revenue: {report.totalRevenue}</p>
      <p>Total Orders: {report.totalOrders}</p>
      <p>Avg Order Value: {Math.round(report.avgOrderValue*100)/100}</p>

      <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
        <div style={{ width: '45%' }}>
          <ReactECharts option={revenueOption} style={{height:300}} />
        </div>
        <div style={{ width: '45%' }}>
          <ReactECharts option={categoryOption} style={{height:300}} />
        </div>
      </div>

      <h4>Top Products</h4>
      <ol>
        {report.topProducts.map(p => <li key={p._id}>{p.name} — {p.qty}</li>)}
      </ol>
    </div>
  );
}
