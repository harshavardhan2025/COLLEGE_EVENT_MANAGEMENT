import React, { useEffect, useState } from 'react';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { FiAward, FiDownload } from 'react-icons/fi';

const StudentCertificates = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await API.get('/registrations/certificates');
        setCerts(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchCerts();
  }, []);

  const handleDownloadPDF = async (certId, certName) => {
    try {
      setDownloading(certId);
      const response = await API.get(`/registrations/certificates/${certId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certName || certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
    setDownloading(null);
  };

  if (loading) return <><TopBar title="My Certificates" /><Loader /></>;

  return (
    <>
      <TopBar title="My Certificates" />
      <div className="page-content">
        {certs.length > 0 ? (
          <div className="events-grid">
            {certs.map(c => (
              <div key={c._id} className="cert-card">
                <FiAward size={40} color="#4f46e5" style={{ marginBottom: 12 }} />
                <h4>{c.event?.name}</h4>
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
                  {c.event?.type} | {formatDate(c.event?.startDate)}
                </p>
                <span className={`badge ${c.type === 'winner' ? 'badge-approved' : c.type === 'runner_up' ? 'badge-registered' : 'badge-completed'}`}>
                  {c.type.replace('_', ' ').toUpperCase()}
                </span>
                <p className="cert-id" style={{ marginTop: 12, fontSize: 11 }}>
                  Certificate ID: {c.certificateId}
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Issued: {formatDate(c.issuedAt)}
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px' }}
                  onClick={() => handleDownloadPDF(c._id, c.event?.name?.replace(/\s+/g, '-'))}
                  disabled={downloading === c._id}
                >
                  <FiDownload size={14} />
                  {downloading === c._id ? 'Downloading...' : 'Download PDF'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiAward size={48} />
            <h3>No certificates yet</h3>
            <p>Attend events and earn certificates!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentCertificates;
