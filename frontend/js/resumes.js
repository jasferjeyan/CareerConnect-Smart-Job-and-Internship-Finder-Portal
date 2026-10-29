/**
 * CareerConnect - PDF Resume Upload & Management
 */

async function loadResumes() {
  if (!requireAuth(['student'])) return;

  const container = document.getElementById('resumes-list-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:2rem; color:var(--text-muted);">
      Loading your stored resumes...
    </div>
  `;

  try {
    const res = await apiRequest('/resumes');
    const resumes = res.resumes || [];

    if (resumes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📄</div>
          <h4 class="empty-title">No Resumes Uploaded</h4>
          <p class="empty-text">Upload a PDF resume below to start applying to jobs and internships.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${resumes
          .map((r, index) => {
            const sizeKb = Math.round(r.fileSize / 1024);
            const sizeDisplay = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : sizeKb + ' KB';
            const uploadDate = formatDate(r.uploadedAt);

            return `
              <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                <div style="display:flex; align-items:center; gap:1rem;">
                  <div style="width:44px; height:44px; border-radius:var(--radius-md); background:#fee2e2; color:#ef4444; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem;">
                    PDF
                  </div>
                  <div>
                    <h4 style="font-size:1rem; font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">
                      ${escapeHtml(r.originalName)}
                    </h4>
                    <div style="font-size:0.8rem; color:var(--text-muted);">
                      Size: ${sizeDisplay} &bull; Uploaded: ${uploadDate} ${index === 0 ? '<span class="badge badge-primary" style="margin-left:0.5rem;">Default</span>' : ''}
                    </div>
                  </div>
                </div>

                <div style="display:flex; gap:0.6rem; align-items:center;">
                  <a href="/api/resumes/${r._id}/view" target="_blank" class="btn btn-outline btn-sm">
                    👁 View PDF
                  </a>
                  <a href="/api/resumes/${r._id}/download?download=true" class="btn btn-secondary btn-sm">
                    ⬇ Download
                  </a>
                  <button class="btn btn-danger btn-sm" onclick="handleDeleteResume('${r._id}')">
                    🗑 Delete
                  </button>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h4 class="empty-title">Error Loading Resumes</h4>
        <p class="empty-text">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

async function handleResumeUpload(e) {
  e.preventDefault();

  const fileInput = document.getElementById('resume-file-input');
  const file = fileInput?.files[0];

  if (!file) {
    showToast('Please select a PDF file to upload.', 'warning');
    return;
  }

  // Validate format
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    showToast('Only valid PDF documents (.pdf) are permitted.', 'error');
    return;
  }

  // Validate size (5MB max)
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    showToast('File size exceeds 5MB limit. Please upload a smaller PDF.', 'error');
    return;
  }

  const uploadBtn = document.getElementById('upload-resume-btn');
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading PDF...';
  }

  const formData = new FormData();
  formData.append('resume', file);

  try {
    const res = await apiRequest('/resumes', {
      method: 'POST',
      body: formData
    });

    showToast('Resume uploaded successfully!', 'success');
    fileInput.value = '';
    const nameDisplay = document.getElementById('file-chosen-name');
    if (nameDisplay) nameDisplay.textContent = 'No file chosen';

    loadResumes();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload PDF Resume';
    }
  }
}

async function handleDeleteResume(resumeId) {
  if (!confirm('Are you sure you want to permanently delete this resume?')) return;

  try {
    await apiRequest(`/resumes/${resumeId}`, {
      method: 'DELETE'
    });

    showToast('Resume deleted successfully.', 'info');
    loadResumes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadResumes();

  const form = document.getElementById('resume-upload-form');
  if (form) {
    form.addEventListener('submit', handleResumeUpload);
  }

  const fileInput = document.getElementById('resume-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const nameDisplay = document.getElementById('file-chosen-name');
      if (nameDisplay && e.target.files.length > 0) {
        nameDisplay.textContent = e.target.files[0].name;
      }
    });
  }
});

