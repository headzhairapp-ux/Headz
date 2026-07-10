import React, { useEffect, useState } from 'react';
import {
  AdminLeadCapture,
  getAdminLeadCaptures,
} from '../services/supabaseService';

const csvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`;

const LeadCaptures: React.FC = () => {
  const [leads, setLeads] = useState<AdminLeadCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      setLeads(await getAdminLeadCaptures());
    } catch (err) {
      console.error('Error loading lead captures:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lead captures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const exportLeads = () => {
    const rows = [
      ['Name', 'Phone Number', 'Location'],
      ...leads.map((lead) => [lead.name, lead.phoneNumber, lead.location]),
    ];
    const csv = rows.map((row) => row.map(csvValue).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `headz-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Captures</h1>
          <p className="text-gray-500">Contact details submitted through the app</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{leads.length.toLocaleString()} leads</span>
          <button
            type="button"
            onClick={exportLeads}
            disabled={loading || leads.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E1262D] hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0 3-3m-3 3-3-3m9 5H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v8a2 2 0 0 1-2 2Z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-600 rounded-lg">
          <p className="font-bold">Error loading leads</p>
          <p>{error}</p>
          <button type="button" onClick={loadLeads} className="mt-3 text-sm font-semibold underline">Try again</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading lead captures...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No lead captures yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead, index) => (
                  <tr key={`${lead.phoneNumber}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{lead.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{lead.phoneNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default LeadCaptures;
