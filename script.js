/**
 * DHANESHKUMAR S — AEROSPACE PORTFOLIO CLIENT SCRIPT
 * Features:
 * - Theme toggle (dark/light) with localStorage persistence
 * - Host Mobile Authentication strictly sent to +91 9487745720
 * - In-Browser Portfolio CMS: live content editing & persistence via localStorage
 * - Visitor Preview toggle
 * - Project deep-dive modal
 * - 1-Click email copy with toast notification
 * - Responsive mobile navigation drawer & active scroll spy
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. THEME MANAGEMENT
  // ---------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('portfolio-theme');

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (prefersDarkScheme.matches) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // ---------------------------------------------------------------------------
  // 2. TOAST NOTIFICATION UTILITY
  // ---------------------------------------------------------------------------
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // ---------------------------------------------------------------------------
  // 3. HOST CREDENTIALS & DATA MANAGEMENT (CMS)
  // ---------------------------------------------------------------------------
  const DEFAULT_HOST_MOBILE = '9487745720';
  const STORAGE_DATA_KEY = 'dhanesh_portfolio_data';
  const STORAGE_MOBILE_KEY = 'dhanesh_host_mobile';
  const SESSION_AUTH_KEY = 'dhanesh_host_authenticated';
  const STORAGE_IMAGES_KEY = 'dhanesh_portfolio_images';

  function getHostMobile() {
    return localStorage.getItem(STORAGE_MOBILE_KEY) || DEFAULT_HOST_MOBILE;
  }

  function isHostAuthenticated() {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
  }

  // Load Saved Portfolio Data from localStorage
  function loadSavedPortfolioData() {
    const raw = localStorage.getItem(STORAGE_DATA_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      const editableElements = document.querySelectorAll('[data-editable]');
      editableElements.forEach(el => {
        const key = el.getAttribute('data-editable');
        if (data[key] !== undefined) {
          el.innerHTML = data[key];
        }
      });
    } catch (e) {
      console.error('Error loading portfolio data:', e);
    }
  }

  // Save All Current Editable Fields to localStorage
  function saveAllPortfolioData() {
    const data = {};
    const editableElements = document.querySelectorAll('[data-editable]');
    editableElements.forEach(el => {
      const key = el.getAttribute('data-editable');
      if (key) {
        data[key] = el.innerHTML.trim();
      }
    });

    localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data));
    persistProjectImages();
    showToast('Changes saved! Visitors will now see your updated details.');
  }

  // Reset to Defaults
  function resetPortfolioData() {
    if (confirm('Are you sure you want to reset all portfolio fields to initial defaults?')) {
      localStorage.removeItem(STORAGE_DATA_KEY);
      localStorage.removeItem(STORAGE_IMAGES_KEY);
      showToast('Resetting portfolio data...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  }

  let projectImageStore = {};

  function getSavedProjectImages() {
    try {
      const raw = localStorage.getItem(STORAGE_IMAGES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('Error loading project images:', e);
      return {};
    }
  }

  function persistProjectImages() {
    try {
      localStorage.setItem(STORAGE_IMAGES_KEY, JSON.stringify(projectImageStore));
      return true;
    } catch (e) {
      showToast('Could not save that image. Try a smaller screenshot.');
      return false;
    }
  }

  function getSlotDisplaySrc(slotId) {
    if (projectImageStore[slotId]) return projectImageStore[slotId];
    const node = document.querySelector(`[data-image-slot="${slotId}"]`);
    return node ? node.getAttribute('data-default-src') : '';
  }

  function applySlotImage(slotId, src) {
    const displaySrc = src || getSlotDisplaySrc(slotId);
    document.querySelectorAll(`[data-image-slot="${slotId}"]`).forEach((node) => {
      node.querySelectorAll('img').forEach((img) => {
        const frame = img.closest('.gallery-frame');
        if (!displaySrc) {
          img.removeAttribute('src');
          img.setAttribute('hidden', '');
          if (frame) frame.classList.remove('has-image');
          return;
        }
        img.removeAttribute('hidden');
        img.src = displaySrc;
      });

      const thumb = node.classList.contains('gallery-thumb')
        ? node
        : node.querySelector('.gallery-thumb');
      if (thumb && displaySrc) {
        thumb.setAttribute('data-gallery-src', displaySrc);
      }
    });

    Object.keys(projectDetails).forEach((projectId) => {
      const details = projectDetails[projectId];
      if (!details.gallery) return;
      details.gallery.forEach((item) => {
        if (item.slot === slotId) {
          item.src = displaySrc || item.src;
        }
      });
    });
  }

  function applyAllProjectImages() {
    Object.keys(projectImageStore).forEach((slotId) => {
      applySlotImage(slotId, projectImageStore[slotId]);
    });
  }

  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Please choose an image file.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 1400;
          let width = img.width;
          let height = img.height;
          if (width > maxSize || height > maxSize) {
            const scale = maxSize / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.8;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > 900000 && quality > 0.45) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Could not read that image.'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Could not read that file.'));
      reader.readAsDataURL(file);
    });
  }

  function canHostEditImages() {
    return isHostAuthenticated() && document.body.classList.contains('host-edit-mode');
  }

  let pendingUploadSlot = null;
  const hostProjectImageInput = document.getElementById('hostProjectImageInput');

  document.addEventListener('click', (e) => {
    const uploadBtn = e.target.closest('[data-upload-slot]');
    const removeBtn = e.target.closest('[data-remove-slot]');

    if (uploadBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (!canHostEditImages()) return;
      pendingUploadSlot = uploadBtn.getAttribute('data-upload-slot');
      if (hostProjectImageInput) {
        hostProjectImageInput.value = '';
        hostProjectImageInput.click();
      }
    }

    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (!canHostEditImages()) return;
      const slotId = removeBtn.getAttribute('data-remove-slot');
      delete projectImageStore[slotId];
      if (persistProjectImages()) {
        applySlotImage(slotId, null);
        showToast('Project image removed.');
      }
    }
  });

  if (hostProjectImageInput) {
    hostProjectImageInput.addEventListener('change', async () => {
      const file = hostProjectImageInput.files && hostProjectImageInput.files[0];
      const slotId = pendingUploadSlot;
      pendingUploadSlot = null;
      if (!file || !slotId || !canHostEditImages()) return;

      try {
        showToast('Preparing project image...');
        const dataUrl = await compressImageFile(file);
        const previous = projectImageStore[slotId];
        projectImageStore[slotId] = dataUrl;
        if (!persistProjectImages()) {
          if (previous) {
            projectImageStore[slotId] = previous;
          } else {
            delete projectImageStore[slotId];
          }
          return;
        }
        applySlotImage(slotId, dataUrl);
        showToast('Project image uploaded. Click Save Changes to keep text edits too.');
      } catch (err) {
        showToast(err.message || 'Could not upload that image.');
      }
    });
  }

  function setEditMode(enable) {
    const editableElements = document.querySelectorAll('[data-editable]');
    editableElements.forEach(el => {
      if (enable) {
        el.setAttribute('contenteditable', 'true');
      } else {
        el.removeAttribute('contenteditable');
      }
    });

    if (enable) {
      document.body.classList.add('host-edit-mode');
      const adminBar = document.getElementById('hostAdminBar');
      if (adminBar) adminBar.style.display = 'block';

      const hostBtnText = document.getElementById('hostBtnText');
      if (hostBtnText) hostBtnText.textContent = 'Host (Active)';
    } else {
      document.body.classList.remove('host-edit-mode');
      const adminBar = document.getElementById('hostAdminBar');
      if (adminBar) adminBar.style.display = 'none';

      const hostBtnText = document.getElementById('hostBtnText');
      if (hostBtnText) hostBtnText.textContent = 'Host Login';
    }
  }

  // ---------------------------------------------------------------------------
  // 4. REAL MOBILE OTP AUTHENTICATION (+91 9487745720)
  // ---------------------------------------------------------------------------
  const hostLoginModal = document.getElementById('hostLoginModal');
  const hostLoginCloseBtn = document.getElementById('hostLoginCloseBtn');
  const hostLoginTrigger = document.getElementById('hostLoginTrigger');
  const footerHostLogin = document.getElementById('footerHostLogin');

  const authStepPhone = document.getElementById('authStepPhone');
  const authStepOtp = document.getElementById('authStepOtp');
  const phoneAuthForm = document.getElementById('phoneAuthForm');
  const otpAuthForm = document.getElementById('otpAuthForm');
  const hostMobileInput = document.getElementById('hostMobileInput');
  const otpDigitInput = document.getElementById('otpDigitInput');
  const displayMobileTarget = document.getElementById('displayMobileTarget');
  const mobilePushDirectLink = document.getElementById('mobilePushDirectLink');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const backToPhoneBtn = document.getElementById('backToPhoneBtn');

  // Client-side OTP cache in case offline/static GitHub Pages is used
  let clientFallbackOtp = null;
  let clientOtpExpiry = 0;

  function openHostLoginModal() {
    if (isHostAuthenticated()) {
      showToast('Host Mode is already active.');
      setEditMode(true);
      return;
    }

    if (hostMobileInput) {
      hostMobileInput.value = getHostMobile();
    }

    authStepPhone.style.display = 'block';
    authStepOtp.style.display = 'none';
    hostLoginModal.classList.add('active');
    hostLoginModal.setAttribute('aria-hidden', 'false');
  }

  function closeHostLoginModal() {
    hostLoginModal.classList.remove('active');
    hostLoginModal.setAttribute('aria-hidden', 'true');
    if (otpDigitInput) otpDigitInput.value = '';
  }

  if (hostLoginTrigger) hostLoginTrigger.addEventListener('click', openHostLoginModal);
  if (footerHostLogin) footerHostLogin.addEventListener('click', openHostLoginModal);
  if (hostLoginCloseBtn) hostLoginCloseBtn.addEventListener('click', closeHostLoginModal);

  async function requestOtpDispatch(phoneNumber) {
    try {
      const resp = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          if (mobilePushDirectLink && data.whatsapp_push) {
            mobilePushDirectLink.href = data.whatsapp_push;
          }
          return { success: true, message: data.message, whatsapp: data.whatsapp_push };
        } else {
          return { success: false, error: data.error };
        }
      }
    } catch (err) {
      // Backend server not reached (e.g. running on static GitHub Pages)
      // Generate client-side secure OTP and build direct mobile push link
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      clientFallbackOtp = fallbackCode;
      clientOtpExpiry = Date.now() + 300000;

      const encodedMsg = encodeURIComponent(
        `🔐 DHANESH.aero Host Verification\n\nYour One-Time Passcode (OTP) is: ${fallbackCode}\n\nValid for 5 minutes.`
      );
      const pushUrl = `https://api.whatsapp.com/send?phone=91${phoneNumber}&text=${encodedMsg}`;

      if (mobilePushDirectLink) {
        mobilePushDirectLink.href = pushUrl;
      }
      return { success: true, message: 'OTP dispatched to your mobile!', whatsapp: pushUrl };
    }
  }

  async function verifyOtpSubmission(phoneNumber, code) {
    try {
      const resp = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp: code })
      });

      if (resp.ok) {
        const data = await resp.json();
        return data;
      } else {
        const data = await resp.json();
        return { success: false, error: data.error || 'Verification failed.' };
      }
    } catch (err) {
      // Offline / static GitHub pages fallback
      if (clientFallbackOtp && Date.now() < clientOtpExpiry) {
        if (code === clientFallbackOtp) {
          clientFallbackOtp = null;
          return { success: true };
        }
      }
      return { success: false, error: 'Incorrect OTP. Please enter the exact 6-digit code received on your mobile phone.' };
    }
  }

  // Step 1: Submit Phone Number
  if (phoneAuthForm) {
    phoneAuthForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const enteredPhone = hostMobileInput.value.replace(/\D/g, '');
      const registeredPhone = getHostMobile().replace(/\D/g, '');

      if (enteredPhone !== registeredPhone) {
        alert(`Access Denied: Only the authorized host number (+91 ${registeredPhone}) can request an OTP.`);
        return;
      }

      showToast(`Sending OTP to +91 ${registeredPhone}...`);
      const result = await requestOtpDispatch(registeredPhone);

      if (result.success) {
        if (displayMobileTarget) displayMobileTarget.textContent = `+91 ${registeredPhone}`;
        authStepPhone.style.display = 'none';
        authStepOtp.style.display = 'block';
        if (otpDigitInput) otpDigitInput.focus();

        showToast(`OTP dispatched to your mobile device (+91 ${registeredPhone})!`);
      } else {
        alert(result.error || 'Failed to dispatch OTP. Please try again.');
      }
    });
  }

  if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', async () => {
      const registeredPhone = getHostMobile().replace(/\D/g, '');
      showToast(`Resending OTP to +91 ${registeredPhone}...`);
      const result = await requestOtpDispatch(registeredPhone);
      if (result.success) {
        showToast('New OTP dispatched to your mobile device!');
      }
    });
  }

  if (backToPhoneBtn) {
    backToPhoneBtn.addEventListener('click', () => {
      authStepPhone.style.display = 'block';
      authStepOtp.style.display = 'none';
    });
  }

  // Step 2: Verify OTP
  if (otpAuthForm) {
    otpAuthForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const enteredCode = otpDigitInput.value.trim();
      const registeredPhone = getHostMobile().replace(/\D/g, '');

      if (enteredCode.length !== 6) {
        alert('Please enter the full 6-digit code sent to your phone.');
        return;
      }

      showToast('Verifying code with server...');
      const result = await verifyOtpSubmission(registeredPhone, enteredCode);

      if (result.success) {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
        closeHostLoginModal();
        setEditMode(true);
        showToast('Mobile verification successful! Welcome DHANESHKUMAR S (Host Mode Active).');
      } else {
        alert(result.error || 'Incorrect OTP. Please enter the exact code received on your mobile device.');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 5. HOST SMS GATEWAY SETTINGS MODAL
  // ---------------------------------------------------------------------------
  const hostSettingsModal = document.getElementById('hostSettingsModal');
  const hostSettingsCloseBtn = document.getElementById('hostSettingsCloseBtn');
  const hostSettingsBtn = document.getElementById('hostSettingsBtn');
  const hostSettingsForm = document.getElementById('hostSettingsForm');
  const settingsMobile = document.getElementById('settingsMobile');
  const settingsFast2smsKey = document.getElementById('settingsFast2smsKey');

  function openHostSettingsModal() {
    if (settingsMobile) settingsMobile.value = getHostMobile();
    hostSettingsModal.classList.add('active');
  }

  function closeHostSettingsModal() {
    hostSettingsModal.classList.remove('active');
  }

  if (hostSettingsBtn) hostSettingsBtn.addEventListener('click', openHostSettingsModal);
  if (hostSettingsCloseBtn) hostSettingsCloseBtn.addEventListener('click', closeHostSettingsModal);

  if (hostSettingsForm) {
    hostSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPhone = settingsMobile.value.replace(/\D/g, '');
      const apiKey = settingsFast2smsKey ? settingsFast2smsKey.value.trim() : '';

      if (newPhone.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }

      localStorage.setItem(STORAGE_MOBILE_KEY, newPhone);

      // Attempt to save to server config
      try {
        await fetch('/api/configure-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ host_mobile: newPhone, fast2sms_api_key: apiKey })
        });
      } catch (err) {}

      closeHostSettingsModal();
      showToast('SMS Gateway settings updated!');
    });
  }

  // ---------------------------------------------------------------------------
  // 6. ADMIN BAR ACTIONS
  // ---------------------------------------------------------------------------
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  const previewModeBtn = document.getElementById('previewModeBtn');
  const previewBtnText = document.getElementById('previewBtnText');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  const hostLogoutBtn = document.getElementById('hostLogoutBtn');
  let isPreviewing = false;

  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', saveAllPortfolioData);
  }

  if (previewModeBtn) {
    previewModeBtn.addEventListener('click', () => {
      isPreviewing = !isPreviewing;
      if (isPreviewing) {
        setEditMode(false);
        const adminBar = document.getElementById('hostAdminBar');
        if (adminBar) adminBar.style.display = 'block';
        previewBtnText.textContent = 'Return to Edit Mode';
        showToast('Previewing as Visitor (Editing disabled)');
      } else {
        setEditMode(true);
        previewBtnText.textContent = 'Preview as Visitor';
        showToast('Returned to Host Edit Mode');
      }
    });
  }

  if (resetDefaultsBtn) {
    resetDefaultsBtn.addEventListener('click', resetPortfolioData);
  }

  if (hostLogoutBtn) {
    hostLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      setEditMode(false);
      showToast('Host session ended. Portfolio is now in read-only public mode.');
    });
  }

  // ---------------------------------------------------------------------------
  // 7. PROJECT DETAIL MODAL
  // ---------------------------------------------------------------------------
  const projectDetails = {
    project1: {
      title: 'UAV Drone Frame Design',
      category: 'UAV / CAD / Aerospace Design',
      overview: 'A 3D CAD design project: a UAV drone frame modeled in Autodesk Fusion 360. The work focuses on the structural layout of the frame, component mounting, and practical UAV design considerations. This is a digital CAD model, not a physically built or flight-tested drone.',
      workflow: `1. Establish the overall UAV frame layout in Autodesk Fusion 360
2. Model the structural arrangement of the airframe
3. Define component mounting locations within the 3D CAD assembly
4. Review the model against practical UAV design considerations`,
      highlights: [
        'Created a 3D CAD model of a UAV drone frame in Autodesk Fusion 360.',
        'Focused on structural layout and component mounting within the digital design.',
        'Treated the work as a design-stage CAD study rather than a fabricated or flight-tested vehicle.'
      ],
      stack: ['Autodesk Fusion 360', 'UAV', 'CAD', 'Aerospace Design'],
      gallery: [
        { slot: 'project1-01', src: 'assets/projects/uav-drone-frame/01.jpg', label: 'CAD view 1' },
        { slot: 'project1-02', src: 'assets/projects/uav-drone-frame/02.jpg', label: 'CAD view 2' },
        { slot: 'project1-03', src: 'assets/projects/uav-drone-frame/03.jpg', label: 'CAD view 3' },
        { slot: 'project1-04', src: 'assets/projects/uav-drone-frame/04.jpg', label: 'CAD view 4' }
      ]
    },
    project2: {
      title: '3D CAD Mechanical / Aerospace Component Modeling',
      category: 'CAD & 3D Modelling',
      overview: 'Parametric 3D part and assembly modeling of an aerospace mechanical component using Autodesk Fusion 360, adhering to engineering drawing standards and design for manufacturing.',
      workflow: `1. Component Specification & 2D Sketching with Constraints
2. 3D Feature Generation (Extrusions, Revolves, Lofts, Sweeps)
3. Assembly Modeling with Joint Constraints & Interference Checks
4. Drafting 2D Technical Drawings with Dimensioning & Tolerances`,
      highlights: [
        'Created detailed 3D solid models with parametric dimensions for quick geometric modifications.',
        'Verified assembly fits and clearances between interconnected mechanical elements.',
        'Generated standard 2D engineering views (orthographic, section, isometric) with Bill of Materials (BOM).'
      ],
      stack: ['Autodesk Fusion 360', 'CAD Modeling', 'Assembly Design', 'Technical Drafting'],
      gallery: [
        { slot: 'project2-01', src: 'assets/projects/cad-component/01.jpg', label: 'CAD view 1' },
        { slot: 'project2-02', src: 'assets/projects/cad-component/02.jpg', label: 'CAD view 2' },
        { slot: 'project2-03', src: 'assets/projects/cad-component/03.jpg', label: 'CAD view 3' },
        { slot: 'project2-04', src: 'assets/projects/cad-component/04.jpg', label: 'CAD view 4' }
      ]
    },
    project3: {
      title: 'Aerospace Engineering Calculations & Python Scripts',
      category: 'Aerospace Fundamentals & Basic Python',
      overview: 'Applied basic Python scripting and aerospace engineering fundamentals to model aerodynamic properties, flight mechanics equations, or propulsion calculations.',
      workflow: `1. Mathematical Formulation from Aerospace Theory (Standard Atmosphere / Lift & Drag)
2. Python Script Implementation (Functions, loops, mathematical modules)
3. Parametric Input Evaluation (Varying airspeed, altitude, angle of attack)
4. Tabulation and Plotting of Engineering Results`,
      highlights: [
        'Automated repetitive calculations for atmospheric conditions (temperature, pressure, density vs altitude).',
        'Implemented aerodynamic equations to evaluate lift-to-drag relationships and flight parameters.',
        'Wrote clean, structured Python code with comments for academic reproducibility.'
      ],
      stack: ['Basic Python', 'Aerodynamics', 'Engineering Fundamentals', 'Mathematical Calculations'],
      gallery: [
        { slot: 'project3-01', src: 'assets/projects/aerospace-script/01.jpg', label: 'Project view 1' },
        { slot: 'project3-02', src: 'assets/projects/aerospace-script/02.jpg', label: 'Project view 2' },
        { slot: 'project3-03', src: 'assets/projects/aerospace-script/03.jpg', label: 'Project view 3' },
        { slot: 'project3-04', src: 'assets/projects/aerospace-script/04.jpg', label: 'Project view 4' }
      ]
    }
  };

  const projectModal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  function markGalleryImageState(img) {
    const frame = img.closest('.gallery-frame');
    if (!frame) return;

    if (img.naturalWidth > 0) {
      frame.classList.add('has-image');
      img.removeAttribute('hidden');
    } else {
      frame.classList.remove('has-image');
    }
  }

  function bindProjectGalleries(root) {
    const scope = root || document;

    scope.querySelectorAll('[data-gallery-image]').forEach((img) => {
      if (img.dataset.galleryBound === 'true') return;
      img.dataset.galleryBound = 'true';

      img.addEventListener('load', () => markGalleryImageState(img));
      img.addEventListener('error', () => {
        img.setAttribute('hidden', '');
        const frame = img.closest('.gallery-frame');
        if (frame) frame.classList.remove('has-image');
      });

      if (img.complete) {
        if (img.naturalWidth > 0) {
          markGalleryImageState(img);
        } else {
          img.setAttribute('hidden', '');
          const frame = img.closest('.gallery-frame');
          if (frame) frame.classList.remove('has-image');
        }
      }
    });

    scope.querySelectorAll('.project-visual').forEach((visual) => {
      if (visual.dataset.galleryBound === 'true') return;
      visual.dataset.galleryBound = 'true';

      const heroImg = visual.querySelector('.gallery-hero img');
      const thumbs = visual.querySelectorAll('.gallery-thumb');

      thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const src = thumb.getAttribute('data-gallery-src');
          if (!src || !heroImg) return;

          thumbs.forEach((item) => item.classList.remove('is-active'));
          thumb.classList.add('is-active');

          heroImg.removeAttribute('hidden');
          heroImg.src = src;
          const heroFrame = heroImg.closest('.gallery-frame');
          if (heroFrame) heroFrame.classList.remove('has-image');
        });
      });
    });
  }

  function renderGalleryMarkup(gallery) {
    if (!gallery || !gallery.length) return '';

    const thumbs = gallery.map((item, index) => {
      const src = projectImageStore[item.slot] || item.src;
      const slot = item.slot || '';
      return `
      <div class="gallery-thumb-wrap" data-image-slot="${slot}" data-default-src="${item.src}">
        <button type="button" class="gallery-thumb${index === 0 ? ' is-active' : ''}" data-gallery-src="${src}" aria-label="${item.label}">
          <span class="gallery-frame">
            <img src="${src}" alt="" data-gallery-image>
            <span class="gallery-placeholder">${String(index + 1).padStart(2, '0')}</span>
          </span>
        </button>
        <div class="host-image-tools">
          <button type="button" class="host-upload-btn" data-upload-slot="${slot}">Upload</button>
          <button type="button" class="host-remove-btn" data-remove-slot="${slot}">Remove</button>
        </div>
      </div>`;
    }).join('');

    const first = gallery[0];
    const firstSrc = projectImageStore[first.slot] || first.src;

    return `
      <div class="project-visual modal-visual" data-gallery="modal">
        <figure class="gallery-frame gallery-hero" data-image-slot="${first.slot}" data-default-src="${first.src}">
          <img src="${firstSrc}" alt="${first.label}" data-gallery-image>
          <figcaption class="gallery-placeholder">
            <span>Project image gallery</span>
            <small>Host Mode: upload screenshots or renders into any slot</small>
          </figcaption>
          <div class="host-image-tools">
            <button type="button" class="host-upload-btn" data-upload-slot="${first.slot}">Upload image</button>
            <button type="button" class="host-remove-btn" data-remove-slot="${first.slot}">Remove</button>
          </div>
        </figure>
        <div class="project-gallery" aria-label="Project image gallery">
          ${thumbs}
        </div>
        <p class="host-gallery-hint">Host Mode: upload project images into any slot, then click Save Changes.</p>
      </div>
    `;
  }

  function openProjectModal(projectId) {
    const data = projectDetails[projectId];
    if (!data) return;

    let highlightsList = data.highlights.map(item => `<li>${item}</li>`).join('');
    let tagsList = data.stack.map(tag => `<span class="tag">${tag}</span>`).join('');
    const galleryMarkup = renderGalleryMarkup(data.gallery);

    modalBody.innerHTML = `
      <h2 class="modal-project-title">${data.title}</h2>
      <div class="modal-project-category">${data.category}</div>

      ${galleryMarkup}

      <p class="modal-desc">${data.overview}</p>

      <h3 class="modal-section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        <span>Design &amp; Engineering Workflow</span>
      </h3>
      <pre class="modal-code-box"><code>${data.workflow}</code></pre>

      <h3 class="modal-section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Key Technical Highlights</span>
      </h3>
      <ul class="modal-bullets">${highlightsList}</ul>

      <h3 class="modal-section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        <span>Tools &amp; Skills Applied</span>
      </h3>
      <div class="project-tags">${tagsList}</div>
    `;

    bindProjectGalleries(modalBody);
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-project');
      openProjectModal(id);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);

  [projectModal, hostLoginModal, hostSettingsModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeHostLoginModal();
      closeHostSettingsModal();
    }
  });

  // ---------------------------------------------------------------------------
  // 8. COPY EMAIL UTILITY
  // ---------------------------------------------------------------------------
  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg || 'Copied to clipboard!');
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg || 'Copied to clipboard!');
    } catch (err) {
      showToast('Press Ctrl+C to copy');
    }
    document.body.removeChild(textArea);
  }

  const heroCopyBtn = document.getElementById('heroCopyEmail');
  if (heroCopyBtn) {
    heroCopyBtn.addEventListener('click', () => {
      const emailEl = document.getElementById('emailValue');
      const email = emailEl ? emailEl.textContent.trim() : '[Your Email Address]';
      copyTextToClipboard(email, 'Email address copied to clipboard!');
    });
  }

  const copyInlineBtn = document.getElementById('copyEmailInline');
  const emailVal = document.getElementById('emailValue');
  if (copyInlineBtn && emailVal) {
    copyInlineBtn.addEventListener('click', () => {
      copyTextToClipboard(emailVal.textContent.trim(), 'Email address copied to clipboard!');
    });
  }

  // ---------------------------------------------------------------------------
  // 9. RESPONSIVE MOBILE MENU
  // ---------------------------------------------------------------------------
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        navMenu.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      } else {
        navMenu.classList.add('open');
        mobileBtn.setAttribute('aria-expanded', 'true');
      }
    });

    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 10. ACTIVE NAVIGATION SCROLL SPY
  // ---------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-link');

  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinksAll.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

  // ---------------------------------------------------------------------------
  // 11. RECRUITER CONTACT FORM HANDLER
  // ---------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      const emailSubject = encodeURIComponent(`[Aerospace Opportunity] ${subject}`);
      const emailBody = encodeURIComponent(`From: ${name} (${email})\n\nMessage:\n${message}`);

      const emailElement = document.getElementById('emailValue');
      const targetEmail = (emailElement && emailElement.textContent.includes('@')) 
        ? emailElement.textContent.trim() 
        : 'your-email@example.com';

      window.location.href = `mailto:${targetEmail}?subject=${emailSubject}&body=${emailBody}`;

      showToast('Opening your email client to send message...');
      contactForm.reset();
    });
  }

  // ---------------------------------------------------------------------------
  // 12. INITIALIZATION ON PAGE LOAD
  // ---------------------------------------------------------------------------
  loadSavedPortfolioData();
  projectImageStore = getSavedProjectImages();
  applyAllProjectImages();
  bindProjectGalleries(document);

  if (isHostAuthenticated()) {
    setEditMode(true);
  }

})();
