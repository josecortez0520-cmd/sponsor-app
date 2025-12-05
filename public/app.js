// =====================================================
// SPONSORHUB - Complete Application Logic
// Demo Mode: Uses in-memory simulated data
// =====================================================

// Global Variables and DOM Elements
let authReady = false;
let isEditing = false;
let isNoteEditing = false;
let isAssetEditing = false;
let isTaskEditing = false;
let currentMonth = new Date();
let displayedSponsors = [];
let dashboardYear = new Date().getFullYear().toString();
const days = ['wed', 'thu', 'fri', 'sat', 'sun'];
const userId = 'demo-user-id';

// Simulated Data Storage
const simulatedSponsors = [];
const eventLabelMap = {};
const simulatedEventSponsors = {};
const simulatedEvents = [];
const simulatedTasks = [];
const simulatedNotes = [];
const simulatedAssets = [];
const simulatedYearlyAttendance = {};
const simulatedProfile = {
  name: 'Demo User',
  email: 'demo@sponsorhub.com',
  bio: 'Welcome to SponsorHub!',
  userId: userId
};
let sponsorsData = [];
let contributionsChartInstance = null;
let attendanceChartInstance = null;
let dashboardContributionChartInstance = null;
let dashboardAttendanceChartInstance = null;
let yearlyTrackingContributionChartInstance = null;

const statusTypeMap = {
  'isContractSigned': 'Contracts Received',
  'isLogoReceived': 'Logos Received',
  'isBannerPlaced': 'Banners Received',
  'isPaymentReceived': 'Payments Received'
};

// DOM Element References
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const menuBtn = document.getElementById('menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');

const tabLinks = document.querySelectorAll('.tab-link');
const sponsorList = document.getElementById('sponsor-list');
const contactList = document.getElementById('contact-list');
const notesList = document.getElementById('notes-list');
const assetsList = document.getElementById('assets-list');
const taskList = document.getElementById('task-list');
const contractStatusCountEl = document.getElementById('contract-status-count');
const logoStatusCountEl = document.getElementById('logo-status-count');
const bannerStatusCountEl = document.getElementById('banner-status-count');
const paymentStatusCountEl = document.getElementById('payment-status-count');

const loadingSpinner = document.getElementById('loading-spinner');
const contactLoadingSpinner = document.getElementById('contact-loading-spinner');

const sponsorSearchInput = document.getElementById('sponsor-search');
const sponsorSortSelect = document.getElementById('sponsor-sort');
const sponsorFilterSelect = document.getElementById('sponsor-filter');
const contactSearchInput = document.getElementById('contact-search');

// Dashboard Elements
const dashboardYearSelect = document.getElementById('dashboard-year-select');
const dashboardTotalAmountEl = document.getElementById('dashboard-total-amount');
const dashboardTotalGATicketsEl = document.getElementById('dashboard-total-ga-tickets');
const dashboardTotalVIPTicketsEl = document.getElementById('dashboard-total-vip-tickets');
const dashboardContractStatusCountEl = document.getElementById('dashboard-contract-status-count');
const dashboardLogoStatusCountEl = document.getElementById('dashboard-logo-status-count');
const dashboardBannerStatusCountEl = document.getElementById('dashboard-banner-status-count');
const dashboardPaymentStatusCountEl = document.getElementById('dashboard-payment-status-count');
const contractProgressBar = document.getElementById('contract-progress-bar');
const logoProgressBar = document.getElementById('logo-progress-bar');
const bannerProgressBar = document.getElementById('banner-progress-bar');
const paymentProgressBar = document.getElementById('payment-progress-bar');
const upcomingEventsListEl = document.getElementById('upcoming-events-list');
const overdueTasksListEl = document.getElementById('overdue-tasks-list');
const eventSponsorLists = {};

// Sponsor Form Elements
const addSponsorBtn = document.getElementById('add-sponsor-btn');
const exportSponsorsBtn = document.getElementById('export-sponsors-btn');
const sponsorForm = document.getElementById('sponsor-form');
const sponsorIdInput = document.getElementById('sponsor-id');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const addEditSponsorModal = document.getElementById('add-edit-sponsor-modal');
const closeAddEditSponsorModalBtn = document.getElementById('close-add-edit-sponsor-modal-btn');

const contractStatusEl = document.getElementById('contract-status');
const logoStatusEl = document.getElementById('logo-status');
const bannerStatusEl = document.getElementById('banner-status');
const paymentStatusEl = document.getElementById('payment-status');

const taskFollowUpEl = document.getElementById('task-follow-up');
const taskMeetEl = document.getElementById('task-meet');
const taskSendInviteEl = document.getElementById('task-send-invite');
const taskWaitingRsvpEl = document.getElementById('task-waiting-rsvp');
const taskConfirmedRsvpEl = document.getElementById('task-confirmed-rsvp');
const taskEndWrapUpEl = document.getElementById('task-end-wrap-up');
const taskEmailThemEl = document.getElementById('task-email-them');

// Task Elements
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const taskNameInput = document.getElementById('task-name');
const taskNotesInput = document.getElementById('task-notes');
const taskDueDateInput = document.getElementById('task-due-date');
const taskSubmitBtn = document.getElementById('task-submit-btn');
const taskCancelBtn = document.getElementById('task-cancel-btn');

// Note Elements
const noteModal = document.getElementById('note-modal');
const addNoteBtn = document.getElementById('add-note-btn');
const noteForm = document.getElementById('note-form');
const noteIdInput = document.getElementById('note-id');
const noteModalTitle = document.getElementById('note-modal-title');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const noteSponsorSelect = document.getElementById('note-sponsor-id');
const noteSubmitBtn = document.getElementById('note-submit-btn');
const noteCancelBtn = document.getElementById('note-cancel-btn');

// Asset Elements
const assetModal = document.getElementById('add-edit-asset-modal');
const addAssetBtn = document.getElementById('add-asset-btn');
const assetForm = document.getElementById('asset-form');
const assetIdInput = document.getElementById('asset-id');
const assetFormTitle = document.getElementById('asset-form-title');
const assetDescriptionInput = document.getElementById('asset-description');
const assetAmountInput = document.getElementById('asset-amount');
const assetPriceInput = document.getElementById('asset-price');
const assetAvailableCheckbox = document.getElementById('asset-available');
const assetSponsorSelect = document.getElementById('asset-sponsor-id');
const assetSubmitBtn = document.getElementById('asset-submit-btn');
const assetCancelBtn = document.getElementById('asset-cancel-btn');
const closeAddEditAssetModalBtn = document.getElementById('close-add-edit-asset-modal-btn');
const assetsLoadingSpinner = document.getElementById('assets-loading-spinner');

// Calendar Elements
const calendarBody = document.getElementById('calendar-body');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

// Event Modal Elements
const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');
const eventIdInput = document.getElementById('event-id');
const eventDateInput = document.getElementById('event-date');
const eventTimeInput = document.getElementById('event-time');
const eventNameInput = document.getElementById('event-name');
const eventNotesInput = document.getElementById('event-notes');
const eventModalTitle = document.getElementById('event-modal-title');
const eventSubmitBtn = document.getElementById('event-submit-btn');
const eventCancelBtn = document.getElementById('event-cancel-btn');
const eventDeleteBtn = document.getElementById('event-delete-btn');

// Delete Modal Elements
const deleteModal = document.getElementById('delete-modal');
const deleteModalText = document.getElementById('delete-modal-text');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// Status Modal Elements
const statusModal = document.getElementById('status-modal');
const statusModalTitle = document.getElementById('status-modal-title');
const statusModalList = document.getElementById('status-modal-list');
const closeStatusModalBtn = document.getElementById('close-status-modal-btn');
const statusReviewButtons = document.querySelectorAll('[data-status-type]');

// Sponsor Detail Modal Elements
const sponsorDetailModal = document.getElementById('sponsor-detail-modal');
const closeSponsorDetailBtn = document.getElementById('close-sponsor-detail-btn');
const editSponsorDetailBtn = document.getElementById('edit-sponsor-detail-btn');
const deleteSponsorDetailBtn = document.getElementById('delete-sponsor-detail-btn');
const detailCompanyName = document.getElementById('detail-company-name');
const detailContactName = document.getElementById('detail-contact-name');
const detailContactEmail = document.getElementById('detail-contact-email');
const detailContactPhone = document.getElementById('detail-contact-phone');
const detailSponsorType = document.getElementById('detail-sponsor-type');
const detailSponsorAmount = document.getElementById('detail-sponsor-amount');
const detailSponsorStatus = document.getElementById('detail-sponsor-status');
const detailSponsorNotes = document.getElementById('detail-sponsor-notes');
const detailContractStatus = document.getElementById('detail-contract-status');
const detailLogoStatus = document.getElementById('detail-logo-status');
const detailBannerStatus = document.getElementById('detail-banner-status');
const detailPaymentStatus = document.getElementById('detail-payment-status');
const detailTasksList = document.getElementById('detail-tasks-list');
const detailTicketsList = document.getElementById('detail-tickets-list');
const detailSponsorEvents = document.getElementById('detail-sponsor-events');

// Yearly Tracking Elements
const yearlyTrackingContributionYearSelect = document.getElementById('yearly-tracking-contribution-year');
const yearlyTrackingYearlyContributionsEl = document.getElementById('yearly-tracking-yearly-contributions');
const yearlyTrackingContributionGraphCanvas = document.getElementById('yearly-tracking-contribution-graph');
const totalAmountDisplay = document.getElementById('total-amount');
const totalGATickets = document.getElementById('total-ga-tickets');
const totalVIPTickets = document.getElementById('total-vip-tickets');
const sponsorContributionsList = document.getElementById('sponsor-contributions-list');
const attendanceGraphCanvas = document.getElementById('attendance-graph');
const attendanceForm = document.getElementById('attendance-form');
const attendanceYearInput = document.getElementById('attendance-year');
const attendanceCountInput = document.getElementById('attendance-count');
const attendanceHistoryList = document.getElementById('attendance-history');

// Profile Elements
const profileForm = document.getElementById('profile-form');
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');
const profileBioInput = document.getElementById('profile-bio');
const profileIdInput = document.getElementById('profile-id');
const profileSaveBtn = document.getElementById('profile-save-btn');
const signOutBtn = document.getElementById('sign-out-btn');

// Settings elements
const darkModeToggle = document.getElementById('dark-mode-toggle');
const notificationsToggle = document.getElementById('notifications-toggle');
const autosaveToggle = document.getElementById('autosave-toggle');
const exportFormatSelect = document.getElementById('export-format');

// Notification
const notificationBox = document.getElementById('notification-box');

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function showNotification(message, isError = false) {
  notificationBox.textContent = message;
  notificationBox.className = `notification-box p-4 rounded-lg shadow-lg font-medium show ${
    isError ? 'bg-red-500' : 'bg-green-500'
  } text-white`;
  
  setTimeout(() => {
    notificationBox.classList.remove('show');
  }, 3000);
}

// Persist/load state helpers (talk to server endpoints)
async function loadStateFromServer() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Failed to fetch state');
    const state = await res.json();
    // populate simulated arrays from server state
    simulatedSponsors.length = 0;
    (state.sponsors || []).forEach(s => simulatedSponsors.push(s));
    simulatedEvents.length = 0;
    (state.events || []).forEach(e => simulatedEvents.push(e));
    simulatedTasks.length = 0;
    (state.tasks || []).forEach(t => simulatedTasks.push(t));
    simulatedNotes.length = 0;
    (state.notes || []).forEach(n => simulatedNotes.push(n));
    simulatedAssets.length = 0;
    (state.assets || []).forEach(a => simulatedAssets.push(a));
    if (state.profile) {
      simulatedProfile.name = state.profile.name || simulatedProfile.name;
      simulatedProfile.email = state.profile.email || simulatedProfile.email;
      simulatedProfile.bio = state.profile.bio || simulatedProfile.bio;
    }
    console.log('Loaded state from server');
  } catch (err) {
    console.warn('Could not load state from server:', err.message || err);
  }
}

function saveStateToServer() {
  // Non-blocking save; fire-and-forget
  try {
    const payload = {
      sponsors: simulatedSponsors,
      events: simulatedEvents,
      tasks: simulatedTasks,
      notes: simulatedNotes,
      assets: simulatedAssets,
      profile: simulatedProfile
    };
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => {
      if (!res.ok) console.warn('Failed to persist state');
    }).catch(e => console.warn('Persist error', e));
  } catch (e) {
    console.warn('saveStateToServer error', e);
  }
}

function showDeleteModal(message, callback) {
  // ensure sidebar is behind any confirmation overlay
  pushSidebarBehind();
  deleteModalText.textContent = message;
  deleteModal.classList.remove('hidden');
  deleteModal.classList.add('flex');
  
  confirmDeleteBtn.onclick = () => {
    callback();
    deleteModal.classList.add('hidden');
    restoreSidebarZIndex();
  };
  
  cancelDeleteBtn.onclick = () => {
    deleteModal.classList.add('hidden');
    restoreSidebarZIndex();
  };
}

function openSidebar() {
  sidebar.classList.remove('-translate-x-full');
  sidebar.classList.add('open');
  sidebarBackdrop.classList.remove('hidden');
  // Accessibility: mark open state and prevent body scroll on mobile
  try { menuBtn && menuBtn.setAttribute('aria-expanded', 'true'); } catch(e){}
  try { sidebar && sidebar.setAttribute('aria-hidden', 'false'); } catch(e){}
  try { document.body.style.overflow = 'hidden'; } catch(e){}
}

// Helpers to safely push sidebar behind modals (fix stacking issues)
function pushSidebarBehind() {
  try {
    if (!sidebar) return;
    // save prior explicit z-index so we can restore
    if (!sidebar.dataset._origZ) sidebar.dataset._origZ = sidebar.style.zIndex || '';
    sidebar.style.zIndex = '0';
  } catch (e) {}
}

function restoreSidebarZIndex() {
  try {
    if (!sidebar) return;
    const prev = sidebar.dataset._origZ || '';
    sidebar.style.zIndex = prev;
    delete sidebar.dataset._origZ;
  } catch (e) {}
}

function closeSidebar() {
  sidebar.classList.add('-translate-x-full');
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.add('hidden');
  // Accessibility: reset attributes and restore body scroll
  try { menuBtn && menuBtn.setAttribute('aria-expanded', 'false'); } catch(e){}
  try { sidebar && sidebar.setAttribute('aria-hidden', 'true'); } catch(e){}
  try { document.body.style.overflow = ''; } catch(e){}
}

function switchTab(targetId, sponsorId = null) {
  // Hide all sections
  document.querySelectorAll('main > div > div[id*="-section"]').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show target section
  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
  
  // Update active sidebar link
  tabLinks.forEach(link => {
    link.classList.remove('bg-blue-700', 'font-semibold');
    link.classList.add('hover:bg-blue-700', 'font-medium');
  });
  
  const activeLink = document.querySelector(`[data-target="${targetId}"]`);
  if (activeLink) {
    activeLink.classList.add('bg-blue-700', 'font-semibold');
    activeLink.classList.remove('hover:bg-blue-700', 'font-medium');
  }
  
  closeSidebar();
}

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  // SponsorHub: DOMContentLoaded
  // Setup profile
  profileIdInput.value = userId;
  profileNameInput.value = simulatedProfile.name;
  profileEmailInput.value = simulatedProfile.email;
  profileBioInput.value = simulatedProfile.bio;
  
  // Initialize app
  authReady = true;
  setupRealtimeListeners();
  renderCalendar();
  populateYearSelects();
  populateAssetSponsorSelect();
  
  // Set up sidebar listeners
  menuBtn.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);
  sidebarBackdrop.addEventListener('click', closeSidebar);
  // Desktop menu button
  const menuBtnDesktop = document.getElementById('menu-btn-desktop');
  menuBtnDesktop && menuBtnDesktop.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  // Sidebar close button on desktop (toggle)
  const sidebarMenuBtn = document.getElementById('sidebar-menu-btn');
  sidebarMenuBtn && sidebarMenuBtn.addEventListener('click', () => {
    sidebar.classList.contains('-translate-x-full') ? sidebar.classList.remove('-translate-x-full') : sidebar.classList.add('-translate-x-full');
  });
  // Initialize accessibility attributes
  try { menuBtn && menuBtn.setAttribute('aria-expanded', 'false'); } catch(e){}
  try { sidebar && sidebar.setAttribute('aria-hidden', 'true'); } catch(e){}

  // Close sidebar on Escape when open (keyboard accessibility)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // only close if sidebar is visible on mobile
      if (!sidebar.classList.contains('-translate-x-full')) {
        closeSidebar();
      }
    }
  });

  // Sign out button
  signOutBtn && signOutBtn.addEventListener('click', () => {
    window.location.href = '/logout';
  });

  // Settings handlers
  // Load settings from localStorage
  const loadSettings = () => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    const autosaveEnabled = localStorage.getItem('autosaveEnabled') !== 'false';
    const exportFormat = localStorage.getItem('exportFormat') || 'csv';
    
    darkModeToggle && (darkModeToggle.checked = darkMode);
    notificationsToggle && (notificationsToggle.checked = notificationsEnabled);
    autosaveToggle && (autosaveToggle.checked = autosaveEnabled);
    exportFormatSelect && (exportFormatSelect.value = exportFormat);
    
    if (darkMode) document.body.classList.add('dark-mode');
  };

  // Dark mode toggle
  darkModeToggle && darkModeToggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    localStorage.setItem('darkMode', enabled);
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    showNotification(enabled ? 'Dark mode enabled' : 'Dark mode disabled');
  });

  // Notifications toggle
  notificationsToggle && notificationsToggle.addEventListener('change', (e) => {
    localStorage.setItem('notificationsEnabled', e.target.checked);
    showNotification(e.target.checked ? 'Notifications enabled' : 'Notifications disabled');
  });

  // Auto-save toggle
  autosaveToggle && autosaveToggle.addEventListener('change', (e) => {
    localStorage.setItem('autosaveEnabled', e.target.checked);
    showNotification(e.target.checked ? 'Auto-save enabled' : 'Auto-save disabled');
  });

  // Export format select
  exportFormatSelect && exportFormatSelect.addEventListener('change', (e) => {
    localStorage.setItem('exportFormat', e.target.value);
    showNotification(`Export format set to ${e.target.value.toUpperCase()}`);
  });

  // Load settings on page load
  loadSettings();

  // modal open/close handlers — query elements at runtime so bindings are robust
  const _closeAddEditSponsorModalBtn = document.getElementById('close-add-edit-sponsor-modal-btn');
  const _addSponsorBtn = document.getElementById('add-sponsor-btn');
  _closeAddEditSponsorModalBtn && _closeAddEditSponsorModalBtn.addEventListener('click', hideAddEditSponsorModal);
  _addSponsorBtn && _addSponsorBtn.addEventListener('click', () => showAddEditSponsorModal());
  // close sponsor detail should restore sidebar stacking
  const _closeSponsorDetailBtn = document.getElementById('close-sponsor-detail-btn');
  _closeSponsorDetailBtn && _closeSponsorDetailBtn.addEventListener('click', () => {
    sponsorDetailModal.classList.add('hidden');
    restoreSidebarZIndex();
  });

  // Close asset modal button
  const _closeAddEditAssetModalBtn = document.getElementById('close-add-edit-asset-modal-btn');
  _closeAddEditAssetModalBtn && _closeAddEditAssetModalBtn.addEventListener('click', () => {
    assetModal.classList.add('hidden');
    resetAssetForm();
  });

  // Attach sponsor form submit reliably using runtime lookup
  const _sponsorForm = document.getElementById('sponsor-form');
  const _sponsorIdInput = document.getElementById('sponsor-id');
  if (_sponsorForm) {
    _sponsorForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const id = _sponsorIdInput && _sponsorIdInput.value ? _sponsorIdInput.value : null;
      const payload = {
        company: _sponsorForm.elements['company'].value,
        name: _sponsorForm.elements['name'].value,
        contact: _sponsorForm.elements['contact'].value,
        phone: _sponsorForm.elements['phone'].value,
        sponsorYear: _sponsorForm.elements['sponsorYear'].value || dashboardYear,
        type: _sponsorForm.elements['type'].value,
        amount: Number(_sponsorForm.elements['amount'].value) || 0,
        status: _sponsorForm.elements['status'].value,
        notes: _sponsorForm.elements['notes'].value,
        isContractSigned: !!(document.getElementById('contract-status') && document.getElementById('contract-status').checked),
        isLogoReceived: !!(document.getElementById('logo-status') && document.getElementById('logo-status').checked),
        isBannerPlaced: !!(document.getElementById('banner-status') && document.getElementById('banner-status').checked),
        isPaymentReceived: !!(document.getElementById('payment-status') && document.getElementById('payment-status').checked)
      };

      if (id) {
        setDoc('sponsors', id, payload);
        showNotification('Sponsor updated');
      } else {
        addDoc('sponsors', payload);
        showNotification('Sponsor added');
      }
      sponsorsData = simulatedSponsors.slice();
      renderAllData();
      hideAddEditSponsorModal();
    });
  }
  // Ensure all .modal overlay wrappers are direct children of <body>
  // This avoids stacking-context surprises (transforms/z-index) that can hide modals in some browsers (Chrome)
  try {
    document.querySelectorAll('.modal').forEach(m => {
      // move to body so they live at the top of DOM and are not constrained by ancestors
      if (m.parentElement !== document.body) document.body.appendChild(m);
      // set a very large z-index with !important so it's above the sidebar and other stacking contexts
      m.style.setProperty('z-index', '9999999', 'important');
    });
  } catch (e) { /* ignore */ }
  // SponsorHub: tabLinks count
  
  // Tab switching
  tabLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // SponsorHub: tab clicked
        const closest = (e.target && e.target.closest) ? e.target.closest('[data-target]') : null;
        // if closest found, handled by delegated handler when present
        const targetId = link.dataset.target || (closest ? closest.dataset.target : null);
        if (targetId) {
          switchTab(targetId);
        }
      });
  });
  // Ensure default tab is visible on load
  const initialTarget = document.querySelector('.tab-link[data-target]');
  if (initialTarget && initialTarget.dataset && initialTarget.dataset.target) {
    switchTab(initialTarget.dataset.target);
  } else {
    switchTab('dashboard-section');
  }
});

// Initialize modals (from the HTML file)
function hideAddEditSponsorModal() {
  addEditSponsorModal.classList.add('hidden');
  restoreSidebarZIndex();
}

function resetAssetForm() {
  assetForm.reset();
  assetIdInput.value = '';
}

function hideAddEditAssetModal() {
  assetModal.classList.add('hidden');
}

// Export to CSV
function exportSponsorsToCsv(data) {
  if (data.length === 0) {
    showNotification("No sponsor data to export.", true);
    return;
  }

  const header = [
    "ID", "Company Name", "Contact Name", "Email", "Phone", "Sponsor Year", "Sponsor Type", "Amount", "Status",
    "Contract Received", "Logo Received", "Banner Placed", "Payment Received",
    "Notes", "Date Added"
  ].join(',');

  const csvRows = data.map(sponsor => {
    const row = [
      sponsor.id,
      `"${(sponsor.company || '').replace(/"/g, '""')}"`,
      `"${(sponsor.name || '').replace(/"/g, '""')}"`,
      `"${(sponsor.contact || '').replace(/"/g, '""')}"`,
      `"${(sponsor.phone || '').replace(/"/g, '""')}"`,
      sponsor.sponsorYear || '',
      `"${(sponsor.type || '').replace(/"/g, '""')}"`,
      sponsor.amount || 0,
      sponsor.status || '',
      sponsor.isContractSigned ? 'Yes' : 'No',
      sponsor.isLogoReceived ? 'Yes' : 'No',
      sponsor.isBannerPlaced ? 'Yes' : 'No',
      sponsor.isPaymentReceived ? 'Yes' : 'No',
      `"${(sponsor.notes || '').replace(/"/g, '""')}"`,
      sponsor.date || ''
    ];
    return row.join(',');
  });

  const csvString = [header, ...csvRows].join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'SponsorHub_Data.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotification('Sponsor data exported successfully!');
}

// Event handlers - import rest from main script
// modal open/close handlers are attached during initialization below (DOMContentLoaded)

exportSponsorsBtn.addEventListener('click', () => {
  if (displayedSponsors.length === 0) {
    showNotification("No sponsor data to export.", true);
    return;
  }
  exportSponsorsToCsv(displayedSponsors);
});

// =====================================================
// IN-MEMORY CRUD + RENDERERS
// =====================================================

function generateId() {
  return 'id-' + Math.random().toString(36).slice(2, 9);
}

function getCollectionRef(name) {
  switch (name) {
    case 'sponsors': return simulatedSponsors;
    case 'events': return simulatedEvents;
    case 'tasks': return simulatedTasks;
    case 'notes': return simulatedNotes;
    case 'assets': return simulatedAssets;
    default: return null;
  }
}

function addDoc(collectionName, data) {
  const collection = getCollectionRef(collectionName);
  if (!collection) return null;
  const id = data.id || generateId();
  const now = new Date().toISOString();
  const record = Object.assign({}, data, { id, date: now, dateAdded: now });
  collection.push(record);
  // If sponsors collection and server supports normalized API, call it
  if (collectionName === 'sponsors') {
    fetch('/api/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) })
      .then(r => r.ok ? r.json() : Promise.reject(r)).then(saved => {
        // replace local record with server response (id may be set)
        const idx = collection.findIndex(c => c.id === record.id);
        if (idx !== -1) collection[idx] = saved;
      }).catch(() => {
        // fallback to full-state save
        try { saveStateToServer(); } catch(e){}
      });
    return id;
  }

  // persist
  try { saveStateToServer(); } catch(e){}
  return id;
}

function setDoc(collectionName, id, updates) {
  const collection = getCollectionRef(collectionName);
  if (!collection) return false;
  const idx = collection.findIndex(d => d.id === id);
  if (idx === -1) return false;
  collection[idx] = Object.assign({}, collection[idx], updates);
  if (collectionName === 'sponsors') {
    fetch(`/api/sponsors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
      .then(r => r.ok ? r.json() : Promise.reject(r)).then(saved => {
        collection[idx] = saved;
      }).catch(() => { try { saveStateToServer(); } catch(e){} });
    return true;
  }

  try { saveStateToServer(); } catch(e){}
  return true;
}

function deleteDoc(collectionName, id) {
  const collection = getCollectionRef(collectionName);
  if (!collection) return false;
  const idx = collection.findIndex(d => d.id === id);
  if (idx === -1) return false;
  collection.splice(idx, 1);
  if (collectionName === 'sponsors') {
    fetch(`/api/sponsors/${id}`, { method: 'DELETE' })
      .then(r => { if (!r.ok) throw new Error('Delete failed'); })
      .catch(() => { try { saveStateToServer(); } catch(e){} });
    return true;
  }

  try { saveStateToServer(); } catch(e){}
  return true;
}

function getDoc(collectionName, id) {
  const collection = getCollectionRef(collectionName);
  if (!collection) return null;
  return collection.find(d => d.id === id) || null;
}

async function setupRealtimeListeners() {
  // Attempt to load persisted state from server first
  await loadStateFromServer();

  // Populate demo data if still empty
  if (simulatedSponsors.length === 0) {
    const sample = [
      {
        id: generateId(), sponsorYear: new Date().getFullYear(), name: 'Alice Johnson', company: 'Alpha Co', contact: 'alice@alpha.com', phone: '555-0101', type: 'Presenting', amount: 5000, status: 'Active', isContractSigned: true, isLogoReceived: true, isBannerPlaced: false, isPaymentReceived: true, sponsorTasks: {}, tickets: { wed:{general:0,vip:0}, thu:{general:0,vip:0}, fri:{general:0,vip:0}, sat:{general:0,vip:0}, sun:{general:0,vip:0} }, notes: 'Key sponsor', date: new Date().toISOString()
      },
      {
        id: generateId(), sponsorYear: new Date().getFullYear(), name: 'Bob Smith', company: 'Beta LLC', contact: 'bob@beta.com', phone: '555-0202', type: 'Associate', amount: 2500, status: 'Pending', isContractSigned: false, isLogoReceived: false, isBannerPlaced: false, isPaymentReceived: false, sponsorTasks: {}, tickets: { wed:{general:0,vip:0}, thu:{general:0,vip:0}, fri:{general:0,vip:0}, sat:{general:0,vip:0}, sun:{general:0,vip:0} }, notes: '', date: new Date().toISOString()
      }
    ];
    sample.forEach(s => simulatedSponsors.push(s));
  }

  // sync local reference
  sponsorsData = simulatedSponsors.slice();
  populateAssetSponsorSelect();
  renderAllData();
}

// renderAllData is defined later with the full set of renderers.
// We leave this placeholder removed to avoid having duplicate definitions.

function renderSponsors() {
  sponsorList.innerHTML = '';
  // filter by year
  const year = parseInt(dashboardYear, 10);
  displayedSponsors = sponsorsData.filter(s => Number(s.sponsorYear) === year || String(s.sponsorYear) === String(dashboardYear));

  if (displayedSponsors.length === 0) {
    sponsorList.innerHTML = '<p class="p-4 text-gray-500">No sponsors for selected year.</p>';
    return;
  }

  displayedSponsors.forEach(s => {
    const li = document.createElement('div');
    li.className = 'p-4 border-b flex items-center justify-between';
    li.innerHTML = `
      <div>
        <div class="font-semibold">${s.company || '—'}</div>
        <div class="text-sm text-gray-600">${s.name || ''} • ${s.contact || ''}</div>
      </div>
      <div class="text-right">
        <div class="font-semibold">$${Number(s.amount || 0).toLocaleString()}</div>
        <div class="text-sm text-gray-500">${s.status || ''}</div>
      </div>
    `;
    li.addEventListener('click', () => openSponsorDetail(s.id));
    sponsorList.appendChild(li);
  });
}

function openSponsorDetail(sponsorId) {
  const s = getDoc('sponsors', sponsorId);
  if (!s) return;
  detailCompanyName.textContent = s.company || '';
  detailContactName.textContent = s.name || '';
  detailContactEmail.textContent = s.contact || '';
  detailContactPhone.textContent = s.phone || '';
  detailSponsorType.textContent = s.type || '';
  detailSponsorAmount.textContent = `$${Number(s.amount||0).toLocaleString()}`;
  detailSponsorStatus.textContent = s.status || '';
  detailSponsorNotes.textContent = s.notes || '';
  detailContractStatus.textContent = s.isContractSigned ? 'Yes' : 'No';
  detailLogoStatus.textContent = s.isLogoReceived ? 'Yes' : 'No';
  detailBannerStatus.textContent = s.isBannerPlaced ? 'Yes' : 'No';
  detailPaymentStatus.textContent = s.isPaymentReceived ? 'Yes' : 'No';

  // Show modal (ensure sidebar sits behind)
  pushSidebarBehind();
  sponsorDetailModal.classList.remove('hidden');
  sponsorDetailModal.classList.add('flex');

  // Edit & Delete handlers
  editSponsorDetailBtn.onclick = () => {
    sponsorDetailModal.classList.add('hidden');
    showAddEditSponsorModal(s.id);
  };

  deleteSponsorDetailBtn.onclick = () => {
    showDeleteModal('Delete this sponsor?', () => {
      deleteDoc('sponsors', s.id);
      sponsorsData = simulatedSponsors.slice();
      renderAllData();
      sponsorDetailModal.classList.add('hidden');
      // restore sidebar stacking when detail modal is gone
      restoreSidebarZIndex();
      showNotification('Sponsor deleted');
    });
  };
}

function showAddEditSponsorModal(sponsorId = null) {
  isEditing = false;
  sponsorForm.reset();
  sponsorIdInput.value = '';
  formTitle.textContent = sponsorId ? 'Edit Sponsor' : 'Add Sponsor';
  submitBtn.textContent = sponsorId ? 'Save Changes' : 'Add Sponsor';

  if (sponsorId) {
    const s = getDoc('sponsors', sponsorId);
    if (s) {
      isEditing = true;
      sponsorIdInput.value = s.id;
      sponsorForm.elements['company'].value = s.company || '';
      sponsorForm.elements['name'].value = s.name || '';
      sponsorForm.elements['contact'].value = s.contact || '';
      sponsorForm.elements['phone'].value = s.phone || '';
      sponsorForm.elements['sponsorYear'].value = s.sponsorYear || dashboardYear;
      sponsorForm.elements['type'].value = s.type || '';
      sponsorForm.elements['amount'].value = s.amount || '';
      sponsorForm.elements['status'].value = s.status || 'Active';
      sponsorForm.elements['notes'].value = s.notes || '';
      contractStatusEl.checked = !!s.isContractSigned;
      logoStatusEl.checked = !!s.isLogoReceived;
      bannerStatusEl.checked = !!s.isBannerPlaced;
      paymentStatusEl.checked = !!s.isPaymentReceived;
    }
  }

  addEditSponsorModal.classList.remove('hidden');
  // Ensure sponsor-year has a sensible default and is focused so the user can pick a value
  try {
    const sponsorYearSelectEl = sponsorForm ? sponsorForm.elements['sponsorYear'] : document.getElementById('sponsor-year');
    if (sponsorYearSelectEl) {
      // if value isn't set yet, default to current year
      if (!sponsorYearSelectEl.value) sponsorYearSelectEl.value = new Date().getFullYear();
      // attempt to focus for immediate interaction
      try { sponsorYearSelectEl.focus(); } catch (e) {}
    }
  } catch (e) {}
  // ensure sidebar is behind the dialog
  pushSidebarBehind();
  addEditSponsorModal.classList.add('flex');
}

// Note: sponsor form submit handler is attached in DOMContentLoaded (runtime lookup)

function renderContacts() {
  contactList.innerHTML = '';
  const contacts = {};
  displayedSponsors.forEach(s => {
    const key = `${s.name || ''}-${s.contact || ''}`;
    if (!contacts[key]) contacts[key] = s;
  });

  Object.values(contacts).forEach(c => {
    const div = document.createElement('div');
    div.className = 'p-3 border-b';
    div.innerHTML = `<div class="font-semibold">${c.name || '—'}</div><div class="text-sm text-gray-600">${c.company||''} • ${c.contact||''}</div>`;
    contactList.appendChild(div);
  });
}

function renderDashboardSummary() {
  const total = displayedSponsors.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  dashboardTotalAmountEl.textContent = `$${total.toLocaleString()}`;

  // Tickets (sum across sponsor tickets if present)
  let ga = 0, vip = 0;
  displayedSponsors.forEach(s => {
    if (s.tickets) {
      days.forEach(d => {
        const t = s.tickets[d] || { general: 0, vip: 0 };
        ga += Number(t.general) || 0;
        vip += Number(t.vip) || 0;
      });
    }
  });
  dashboardTotalGATicketsEl.textContent = ga;
  dashboardTotalVIPTicketsEl.textContent = vip;

  // Status counts
  const contractCount = displayedSponsors.filter(s => s.isContractSigned).length;
  const logoCount = displayedSponsors.filter(s => s.isLogoReceived).length;
  const bannerCount = displayedSponsors.filter(s => s.isBannerPlaced).length;
  const paymentCount = displayedSponsors.filter(s => s.isPaymentReceived).length;

  dashboardContractStatusCountEl.textContent = contractCount;
  dashboardLogoStatusCountEl.textContent = logoCount;
  dashboardBannerStatusCountEl.textContent = bannerCount;
  dashboardPaymentStatusCountEl.textContent = paymentCount;

  const totalSponsors = Math.max(displayedSponsors.length, 1);
  contractProgressBar.style.width = `${Math.round((contractCount / totalSponsors) * 100)}%`;
  logoProgressBar.style.width = `${Math.round((logoCount / totalSponsors) * 100)}%`;
  bannerProgressBar.style.width = `${Math.round((bannerCount / totalSponsors) * 100)}%`;
  paymentProgressBar.style.width = `${Math.round((paymentCount / totalSponsors) * 100)}%`;
}

function populateYearSelects() {

  // Populate the event dropdowns with current sponsors
  // events feature removed
  // Fill with last 5 years; look up selects at runtime (safer) and use `onchange`
  const current = new Date().getFullYear();
  const selects = [
    document.getElementById('dashboard-year-select'),
    document.getElementById('yearly-tracking-contribution-year'),
    // ensure sponsor-year gets populated for the Add/Edit Sponsor modal
    document.getElementById('sponsor-year')
  ];

  selects.forEach(select => {
    if (!select) return;
    select.innerHTML = '';
    for (let y = current; y >= current - 4; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      if (String(y) === String(dashboardYear)) opt.selected = true;
      select.appendChild(opt);
    }

    // replace previous handler (avoid duplicate listeners when called multiple times)
    // dashboard year select should change the global dashboardYear; sponsor-year should NOT
    if (select.id === 'dashboard-year-select' || select.id === 'yearly-tracking-contribution-year') {
      select.onchange = (e) => {
        dashboardYear = e.target.value;
        renderAllData();
      };
    } else {
      select.onchange = null;
    }
  });
}

function renderCalendar() {
  if (!calendarBody || !currentMonthEl) return;
  currentMonthEl.textContent = `${currentMonth.toLocaleString('default', { month: 'long' })} ${currentMonth.getFullYear()}`;
  calendarBody.innerHTML = '<div class="p-4 text-sm text-gray-600">Calendar (events are demo-only)</div>';
}

// mark first todo items completed
// (we completed initial CRUD + basic renderers)
// update todo list statuses
// Note: marking only these initial steps as completed for visibility
(() => {
  // read-modify the todo list via the manage_todo_list tool is external; we'll rely on the user next
})();

// =====================================================
// TASKS: render + CRUD
// =====================================================

function renderTasks() {
  if (!taskList || !overdueTasksListEl) return;
  taskList.innerHTML = '';
  overdueTasksListEl.innerHTML = '';

  // sort tasks by due date
  const sorted = simulatedTasks.slice().sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
  sorted.forEach(t => {
    const div = document.createElement('div');
    div.className = 'p-3 border-b flex items-center justify-between';
    div.innerHTML = `<div><div class="font-semibold">${t.name}</div><div class="text-sm text-gray-600">${t.notes||''}</div></div><div class="text-sm text-gray-500">${t.dueDate? new Date(t.dueDate).toLocaleDateString():''}</div>`;
    // click to edit
    div.addEventListener('click', () => showEditTask(t.id));
    taskList.appendChild(div);

    // overdue list
    if (!t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()) {
      const od = document.createElement('div');
      od.className = 'p-2 text-sm text-red-600';
      od.textContent = `${t.name} — due ${new Date(t.dueDate).toLocaleDateString()}`;
      overdueTasksListEl.appendChild(od);
    }
  });
}

function showEditTask(taskId) {
  const t = getDoc('tasks', taskId);
  if (!t) return;
  isTaskEditing = true;
  taskIdInput.value = t.id;
  taskNameInput.value = t.name || '';
  taskNotesInput.value = t.notes || '';
  taskDueDateInput.value = t.dueDate ? t.dueDate.split('T')[0] : '';
  taskSubmitBtn.textContent = 'Save Task';
  // open task modal (reuse task form area in UI)
  document.getElementById('task-section').classList.remove('hidden');
}

if (taskForm) {
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = taskIdInput.value || null;
    const data = {
      name: taskNameInput.value,
      notes: taskNotesInput.value,
      dueDate: taskDueDateInput.value || null,
      isCompleted: false
    };
    if (id) {
      setDoc('tasks', id, data);
      showNotification('Task updated');
    } else {
      addDoc('tasks', data);
      showNotification('Task added');
    }
    taskForm.reset();
    taskIdInput.value = '';
    renderTasks();
  });
  taskCancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    taskForm.reset();
    taskIdInput.value = '';
  });
}

// =====================================================
// NOTES: render + CRUD
// =====================================================

function renderNotes() {
  if (!notesList) return;
  notesList.innerHTML = '';
  const notes = simulatedNotes.slice().reverse();
  if (notes.length === 0) {
    notesList.innerHTML = '<div class="p-4 text-gray-500">No notes yet. Click "Add Note" to create one.</div>';
    return;
  }

  notes.forEach(n => {
    const div = document.createElement('div');
    div.className = 'p-3 border-b';
    const sponsor = n.sponsorId ? getDoc('sponsors', n.sponsorId) : null;
    div.innerHTML = `<div class="font-semibold">${n.title}</div><div class="text-sm text-gray-600">${n.content}</div><div class="text-xs text-gray-500">${sponsor? sponsor.company:''} • ${new Date(n.dateAdded||n.date||'').toLocaleString()}</div>`;
    div.addEventListener('click', () => showEditNote(n.id));
    notesList.appendChild(div);
  });
}

function showEditNote(noteId) {
  const n = getDoc('notes', noteId);
  if (!n) return;
  isNoteEditing = true;
  noteIdInput.value = n.id;
  noteModalTitle.textContent = 'Edit Note';
  noteTitleInput.value = n.title || '';
  noteContentInput.value = n.content || '';
  noteSponsorSelect.value = n.sponsorId || '';
  // make sure sidebar is beneath the note modal
  pushSidebarBehind();
  noteModal.classList.remove('hidden');
  noteModal.classList.add('flex');
}

function hideNoteModal() {
  noteModal.classList.add('hidden');
  restoreSidebarZIndex();
}

if (noteForm) {
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = noteIdInput.value || null;
    const payload = {
      title: noteTitleInput.value,
      content: noteContentInput.value,
      sponsorId: noteSponsorSelect.value || null
    };
    if (id) {
      setDoc('notes', id, payload);
      showNotification('Note updated');
    } else {
      addDoc('notes', payload);
      showNotification('Note added');
    }
    noteForm.reset();
    noteIdInput.value = '';
    hideNoteModal();
    renderNotes();
  });
  noteCancelBtn.addEventListener('click', (e) => { e.preventDefault(); hideNoteModal(); });
}

// Populate note sponsor select when rendering sponsors
function populateNoteSponsorSelect() {
  if (!noteSponsorSelect) return;
  noteSponsorSelect.innerHTML = '<option value="">(No sponsor)</option>';
  simulatedSponsors.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = `${s.company} — ${s.name}`;
    noteSponsorSelect.appendChild(o);
  });
}

function populateAssetSponsorSelect() {
  if (!assetSponsorSelect) return;
  assetSponsorSelect.innerHTML = '<option value="">No Sponsor</option>';
  simulatedSponsors.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = `${s.company} — ${s.name}`;
    assetSponsorSelect.appendChild(o);
  });
}

addNoteBtn && addNoteBtn.addEventListener('click', () => {
  isNoteEditing = false;
  noteForm.reset();
  noteIdInput.value = '';
  noteModalTitle.textContent = 'Add Note';
  populateNoteSponsorSelect();
  pushSidebarBehind();
  noteModal.classList.remove('hidden');
  noteModal.classList.add('flex');
});

// =====================================================
// ASSETS: render + CRUD
// =====================================================

function renderAssets() {

  if (!assetsList) return;
  assetsList.innerHTML = '';
  simulatedAssets.slice().forEach(a => {
    const div = document.createElement('div');
    div.className = 'p-3 border-b flex items-center justify-between';
    div.innerHTML = `<div><div class="font-semibold">${a.name}</div><div class="text-sm text-gray-600">${a.description||''}</div></div><div class="text-sm text-gray-600">${a.isAvailable? 'Available' : 'Unavailable'}</div>`;
    div.addEventListener('click', () => showEditAsset(a.id));
    assetsList.appendChild(div);
  });
}

function showEditAsset(assetId) {
  const a = getDoc('assets', assetId);
  if (!a) return;
  isAssetEditing = true;
  assetIdInput.value = a.id;
  assetFormTitle.textContent = 'Edit Asset';
  assetForm.elements['name'].value = a.name || '';
  assetDescriptionInput.value = a.description || '';
  assetAmountInput.value = a.amount || '';
  assetPriceInput.value = a.price || '';
  assetAvailableCheckbox.checked = !!a.isAvailable;
  assetModal.classList.remove('hidden');
  assetModal.classList.add('flex');
}

if (assetForm) {
  assetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = assetIdInput.value || null;
    const payload = {
      name: assetForm.elements['name'].value,
      description: assetDescriptionInput.value,
      amount: Number(assetAmountInput.value) || 0,
      price: Number(assetPriceInput.value) || 0,
      isAvailable: !!assetAvailableCheckbox.checked
    };
    if (id) {
      setDoc('assets', id, payload);
      showNotification('Asset updated');
    } else {
      addDoc('assets', payload);
      showNotification('Asset added');
    }
    assetForm.reset();
    assetIdInput.value = '';
    assetModal.classList.add('hidden');
    renderAssets();
  });
  assetCancelBtn.addEventListener('click', (e) => { e.preventDefault(); assetModal.classList.add('hidden'); resetAssetForm(); });
}

addAssetBtn && addAssetBtn.addEventListener('click', () => {
  isAssetEditing = false;
  resetAssetForm();
  assetFormTitle.textContent = 'Add Asset';
  assetModal.classList.remove('hidden');
  assetModal.classList.add('flex');
});

// =====================================================
// EVENTS: render + CRUD
// =====================================================

function renderEvents() {
  upcomingEventsListEl && (upcomingEventsListEl.innerHTML = '');
  const upcoming = simulatedEvents.slice().sort((a,b)=> new Date(a.date) - new Date(b.date));
  upcoming.forEach(ev => {
    const li = document.createElement('div');
    li.className = 'p-2 border-b';
    li.innerHTML = `<div class="font-semibold">${ev.name}</div><div class="text-sm text-gray-600">${new Date(ev.date).toLocaleString()} • ${ev.notes||''}</div>`;
    li.addEventListener('click', () => showEditEvent(ev.id));
    upcomingEventsListEl.appendChild(li);
  });
}

function showEditEvent(eventId) {
  const ev = getDoc('events', eventId);
  if (!ev) return;
  eventIdInput.value = ev.id;
  eventDateInput.value = ev.date ? ev.date.split('T')[0] : '';
  eventTimeInput.value = ev.time || '';
  eventNameInput.value = ev.name || '';
  eventNotesInput.value = ev.notes || '';
  eventModalTitle.textContent = 'Edit Event';
  eventModal.classList.remove('hidden');
  eventModal.classList.add('flex');
}

if (eventForm) {
  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = eventIdInput.value || null;
    const payload = {
      date: eventDateInput.value,
      time: eventTimeInput.value,
      name: eventNameInput.value,
      notes: eventNotesInput.value
    };
    if (id) {
      setDoc('events', id, payload);
      showNotification('Event updated');
    } else {
      addDoc('events', payload);
      showNotification('Event added');
    }
    eventForm.reset();
    eventIdInput.value = '';
    eventModal.classList.add('hidden');
    renderEvents();
  });
  eventCancelBtn.addEventListener('click', (e)=>{ e.preventDefault(); eventModal.classList.add('hidden'); });
}

// open add event modal (reuse existing modal openers if present in UI)
// assume there's an Add Event button with id 'add-event-btn'
const addEventBtn = document.getElementById('add-event-btn');
addEventBtn && addEventBtn.addEventListener('click', () => {
  eventForm.reset();
  eventModalTitle.textContent = 'Add Event';
  eventModal.classList.remove('hidden');
  eventModal.classList.add('flex');
});

// Wire delete modal confirm to clear a target (we already set callback in showDeleteModal)

// Refresh renderers when relevant
function renderAllData() {
  renderSponsors();
  renderContacts();
  renderDashboardSummary();
  populateYearSelects();
  renderCalendar();
  renderTasks();
  renderNotes();
  renderAssets();
  renderEvents();
  populateNoteSponsorSelect();
}

// =====================================================
// CHARTS & YEARLY TRACKING
// =====================================================

function buildDashboardContributionChart() {
  const ctx = document.getElementById('dashboard-contribution-graph');
  if (!ctx) return;
  // aggregate by year
  const byYear = {};
  simulatedSponsors.forEach(s => {
    const y = s.sponsorYear || new Date().getFullYear();
    byYear[y] = (byYear[y] || 0) + (Number(s.amount) || 0);
  });
  const years = Object.keys(byYear).sort();
  const values = years.map(y => byYear[y]);

  if (dashboardContributionChartInstance) dashboardContributionChartInstance.destroy();
  dashboardContributionChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{ label: 'Contributions', data: values, backgroundColor: '#2563eb' }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function buildDashboardAttendanceChart() {
  const ctx = document.getElementById('dashboard-attendance-graph');
  if (!ctx) return;
  const years = Object.keys(simulatedYearlyAttendance).sort();
  const values = years.map(y => simulatedYearlyAttendance[y] || 0);
  if (dashboardAttendanceChartInstance) dashboardAttendanceChartInstance.destroy();
  dashboardAttendanceChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels: years, datasets: [{ label: 'Attendance', data: values, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)', fill: true }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function buildYearlyContributionChart(year) {
  const ctx = document.getElementById('yearly-tracking-contribution-graph');
  if (!ctx) return;
  const sponsors = simulatedSponsors.filter(s => String(s.sponsorYear) === String(year));
  const labels = sponsors.map(s => s.company || s.name || s.id);
  const data = sponsors.map(s => Number(s.amount) || 0);
  if (yearlyTrackingContributionChartInstance) yearlyTrackingContributionChartInstance.destroy();
  yearlyTrackingContributionChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: `Contributions ${year}`, data, backgroundColor: '#4f46e5' }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
  // update totals
  const total = data.reduce((a,b) => a+b, 0);
  yearlyTrackingYearlyContributionsEl.textContent = `$${total.toLocaleString()}`;
  // update sponsor contributions list
  sponsorContributionsList.innerHTML = '';
  sponsors.forEach(s => {
    const div = document.createElement('div');
    div.className = 'p-2 border-b flex justify-between items-center';
    div.innerHTML = `<div class="font-medium">${s.company||s.name||'—'}</div><div class="font-semibold">$${Number(s.amount||0).toLocaleString()}</div>`;
    sponsorContributionsList.appendChild(div);
  });
  // tickets totals
  let ga = 0, vip = 0;
  sponsors.forEach(s => {
    if (s.tickets) days.forEach(d => { const t = s.tickets[d]||{general:0,vip:0}; ga += Number(t.general)||0; vip += Number(t.vip)||0; });
  });
  totalGATickets.textContent = ga;
  totalVIPTickets.textContent = vip;
}

function renderAttendanceHistory() {
  if (!attendanceHistoryList) return;
  attendanceHistoryList.innerHTML = '';
  const years = Object.keys(simulatedYearlyAttendance).sort((a,b)=>b-a);
  years.forEach(y => {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center p-2 border-b';
    div.innerHTML = `<div>${y}</div><div class="font-semibold">${simulatedYearlyAttendance[y]}</div>`;
    attendanceHistoryList.appendChild(div);
  });
}

if (attendanceForm) {
  attendanceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const y = (attendanceYearInput.value || new Date().getFullYear()).toString();
    const count = Number(attendanceCountInput.value) || 0;
    simulatedYearlyAttendance[y] = count;
    showNotification('Attendance saved');
    renderAttendanceHistory();
    buildDashboardAttendanceChart();
  });
}

// wire yearly tracking selector change
if (yearlyTrackingContributionYearSelect) {
  yearlyTrackingContributionYearSelect.addEventListener('change', (e) => {
    buildYearlyContributionChart(e.target.value);
  });
}

// ensure charts are built after initial data population
function buildAllCharts() {
  buildDashboardContributionChart();
  buildDashboardAttendanceChart();
  buildYearlyContributionChart(dashboardYear);
  renderAttendanceHistory();
}

// update renderAllData to also build charts
const _renderAllData = renderAllData;
renderAllData = function() {
  _renderAllData();
  buildAllCharts();
};



