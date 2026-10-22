import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  UploadCloud,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Trash2,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TutorQualificationsPage = () => {
  const { showToast } = useToast();
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [passingYear, setPassingYear] = useState(2020);
  const [file, setFile] = useState(null);

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/tutors/profile/me');
      if (res.success) {
        setQualifications(res.qualifications || []);
      }
    } catch (err) {
      showToast('Failed to load qualifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualifications();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a degree certificate file (PDF, JPEG, or PNG).', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('degree', degree);
      formData.append('institution', institution);
      formData.append('fieldOfStudy', fieldOfStudy);
      formData.append('passingYear', passingYear);
      formData.append('document', file);

      const res = await apiRequest('/tutors/qualifications', {
        method: 'POST',
        body: formData
      });

      if (res.success) {
        showToast('Document uploaded successfully and queued for admin verification!', 'success');
        setQualifications((prev) => [res.qualification, ...prev]);
        setDegree('');
        setInstitution('');
        setFieldOfStudy('');
        setFile(null);
      }
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this qualification document?')) return;
    try {
      const res = await apiRequest(`/tutors/qualifications/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Document deleted', 'info');
        setQualifications((prev) => prev.filter((q) => q._id !== id));
      }
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Degrees & Document Verification</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload certificates to earn the "Degree Verified" badge on your public profile
        </p>
      </div>

      {/* Verification Standard Information Banner */}
      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex items-start gap-3 text-xs text-teal-950 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Privacy & Audit Standard:</span> Your uploaded degree certificates and ID proofs are stored in private encrypted storage. They are accessible only to you and ShikshaLink's administrative review team for verification purposes. Never shared publicly.
        </div>
      </div>

      {/* Upload Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Upload Educational Qualification Certificate
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Degree / Certification Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. M.Sc. in Mathematics, B.Tech in Computer Science"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                University / Institute
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Delhi University, IIT Delhi"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Field of Study / Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. Applied Mathematics, Life Sciences"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Passing Year
              </label>
              <input
                type="number"
                min={1970}
                max={2030}
                required
                value={passingYear}
                onChange={(e) => setPassingYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Certificate Document (PDF, JPEG, or PNG — max 10MB)
            </label>
            <input
              type="file"
              required
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {uploading ? 'Uploading Proof...' : 'Submit for Verification'}
          </button>
        </form>
      </div>

      {/* Qualifications List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Your Submitted Qualification Proofs</h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading documents...</div>
        ) : qualifications.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
            No qualification certificates submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualifications.map((q) => (
              <div
                key={q._id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{q.degree}</h3>
                      <div className="text-xs text-slate-600">{q.institution} ({q.passingYear})</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    q.verificationStatus === 'verified'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : q.verificationStatus === 'rejected'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {q.verificationStatus}
                  </span>
                </div>

                {q.adminNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                    <strong className="text-slate-800">Review Note:</strong> {q.adminNotes}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <a
                    href={`/api/tutors/qualifications/${q._id}/document`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Secure Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDelete(q._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
