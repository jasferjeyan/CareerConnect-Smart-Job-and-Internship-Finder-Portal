/**
 * CareerConnect - Student Profile Management
 */

async function loadProfile() {
  if (!requireAuth(['student'])) return;

  const form = document.getElementById('profile-form');
  if (!form) return;

  try {
    const res = await apiRequest('/profile');
    const { user, profile } = res;

    // Fill form fields
    if (document.getElementById('name-input')) document.getElementById('name-input').value = user.name || '';
    if (document.getElementById('email-input')) document.getElementById('email-input').value = user.email || '';
    if (document.getElementById('phone-input')) document.getElementById('phone-input').value = profile.phone || '';
    if (document.getElementById('college-input')) document.getElementById('college-input').value = profile.college || '';
    if (document.getElementById('degree-input')) document.getElementById('degree-input').value = profile.degree || '';
    if (document.getElementById('grad-year-input')) document.getElementById('grad-year-input').value = profile.graduationYear || '';
    if (document.getElementById('skills-input')) document.getElementById('skills-input').value = (profile.skills || []).join(', ');
    if (document.getElementById('education-input')) document.getElementById('education-input').value = profile.educationDetails || '';
    if (document.getElementById('portfolio-input')) document.getElementById('portfolio-input').value = profile.portfolioUrl || '';
    if (document.getElementById('github-input')) document.getElementById('github-input').value = profile.githubUrl || '';
    if (document.getElementById('linkedin-input')) document.getElementById('linkedin-input').value = profile.linkedinUrl || '';

    // Render current skills tags preview
    renderSkillsTags(profile.skills || []);
  } catch (err) {
    showToast('Failed to load profile: ' + err.message, 'error');
  }
}

function renderSkillsTags(skills) {
  const container = document.getElementById('skills-preview');
  if (!container) return;

  if (!skills || skills.length === 0) {
    container.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">No skills added yet. Type them comma-separated below.</span>';
    return;
  }

  container.innerHTML = skills
    .map((s) => `<span class="skill-tag matched" style="font-size:0.85rem; padding:0.3rem 0.65rem;">${escapeHtml(s)}</span>`)
    .join('');
}

async function handleProfileSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('name-input')?.value.trim();
  const phone = document.getElementById('phone-input')?.value.trim();
  const college = document.getElementById('college-input')?.value.trim();
  const degree = document.getElementById('degree-input')?.value.trim();
  const graduationYear = document.getElementById('grad-year-input')?.value;
  const skills = document.getElementById('skills-input')?.value.trim();
  const educationDetails = document.getElementById('education-input')?.value.trim();
  const portfolioUrl = document.getElementById('portfolio-input')?.value.trim();
  const githubUrl = document.getElementById('github-input')?.value.trim();
  const linkedinUrl = document.getElementById('linkedin-input')?.value.trim();

  const submitBtn = document.getElementById('save-profile-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving Changes...';
  }

  try {
    const res = await apiRequest('/profile', {
      method: 'PATCH',
      body: {
        name,
        phone,
        college,
        degree,
        graduationYear,
        skills,
        educationDetails,
        portfolioUrl,
        githubUrl,
        linkedinUrl
      }
    });

    // Update local user session name
    const current = UserSession.get();
    if (current && res.user) {
      current.name = res.user.name;
      UserSession.set(current);
      renderNavbar();
    }

    renderSkillsTags(res.profile.skills || []);
    showToast('Profile updated successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Profile Changes';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();

  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }

  const skillsInput = document.getElementById('skills-input');
  if (skillsInput) {
    skillsInput.addEventListener('input', (e) => {
      const skills = e.target.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      renderSkillsTags(skills);
    });
  }
});

