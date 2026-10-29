// Helper to fetch and render company profile and stats
async function loadCompanyProfile() {
  try {
    const res = await apiRequest('/company/me', { method: 'GET' });
    const c = res.company;
    const html = `
      <p><strong>Name:</strong> ${c.companyName}</p>
      <p><strong>Email:</strong> ${c.email}</p>
      <p><strong>Website:</strong> ${c.website || '-'} </p>
      <p><strong>Location:</strong> ${c.location || '-'} </p>
      <p><strong>Industry:</strong> ${c.industry || '-'} </p>
      <p><strong>Description:</strong> ${c.description || '-'} </p>
    `;
    document.getElementById('company-profile').innerHTML = html;
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function loadStats() {
  try {
    const res = await apiRequest('/employer/stats', { method: 'GET' });
    const s = res.stats;
    const list = `
      <li>Total Jobs: ${s.totalJobs}</li>
      <li>Active Jobs: ${s.activeJobs}</li>
      <li>Total Applicants: ${s.totalApplicants}</li>
      <li>Recent Applications (5): ${s.recentApplications.length}</li>
    `;
    document.getElementById('stats-list').innerHTML = list;
  } catch (e) {
    showToast(e.message, 'error');
  }
}

document.getElementById('edit-profile-btn')?.addEventListener('click', async () => {
  const name = prompt('Company Name');
  const website = prompt('Website URL');
  const location = prompt('Location');
  const industry = prompt('Industry');
  const description = prompt('Description');
  const payload = { companyName: name, website, location, industry, description };
  try {
    await apiRequest('/company/me', { method: 'PATCH', body: payload });
    showToast('Profile updated', 'success');
    loadCompanyProfile();
  } catch (e) {
    showToast(e.message, 'error');
  }
});

// Initial load
loadCompanyProfile();
loadStats();

