import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface UserWithAnalytics {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  country_code?: string;
  phone_number?: string;
  download_count: number;
  share_count: number;
  custom_prompt_count: number;
  generation_count: number;
  created_at: string;
  sr_no?: number;
  is_blocked?: boolean;
  location?: string;
}

interface ExportModalProps {
  users: UserWithAnalytics[];
  onClose: () => void;
  onError: (message: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ users, onClose, onError }) => {
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExportUsers = async () => {
    setExporting(true);
    try {
      // Filter users by date range
      let dataToExport = users;

      if (exportStartDate || exportEndDate) {
        dataToExport = users.filter(u => {
          const createdAt = new Date(u.created_at);
          if (exportStartDate && createdAt < new Date(exportStartDate)) return false;
          if (exportEndDate && createdAt > new Date(exportEndDate + 'T23:59:59')) return false;
          return true;
        });
      }

      // Build title based on date range
      let titleText = 'Headz Users';
      if (exportStartDate && exportEndDate) {
        titleText = `Headz Users from ${exportStartDate} to ${exportEndDate}`;
      } else if (exportStartDate) {
        titleText = `Headz Users from ${exportStartDate}`;
      } else if (exportEndDate) {
        titleText = `Headz Users to ${exportEndDate}`;
      }

      // Create worksheet with title row first
      const worksheet = XLSX.utils.aoa_to_sheet([[titleText]]);

      // Add data starting from row 2 (origin: 1 means row index 1)
      XLSX.utils.sheet_add_json(worksheet, dataToExport.map(u => ({
        'Sr No.': u.sr_no ?? '-',
        'Name': u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'No Name',
        'Email': u.email,
        'Phone': u.country_code && u.phone_number
          ? `${u.country_code} ${u.phone_number}`
          : 'N/A',
        'Downloads': u.download_count || 0,
        'Shares': u.share_count || 0,
        'Generations': u.generation_count || 0,
        'Custom Prompts': u.custom_prompt_count || 0,
        'Location': u.location || 'N/A',
        'Joined': u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A',
        'Status': u.is_blocked ? 'Blocked' : 'Active'
      })), { origin: 1 });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Generate filename with date range
      const dateRange = exportStartDate && exportEndDate
        ? `_${exportStartDate}_to_${exportEndDate}`
        : '';
      XLSX.writeFile(workbook, `headz_users${dateRange}.xlsx`);

      onClose();
    } catch (err) {
      console.error('Export error:', err);
      onError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Export User Data</h3>

        {/* Date Range Filters */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-500 text-sm mb-2">From Date</label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-2">To Date</label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleExportUsers}
            disabled={exporting}
            className="flex-1 px-4 py-2 bg-[#E1262D] hover:bg-[#c82128] disabled:bg-red-300 text-white rounded-lg flex items-center justify-center space-x-2"
          >
            {exporting ? 'Exporting...' : 'Download Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
export type { ExportModalProps };
