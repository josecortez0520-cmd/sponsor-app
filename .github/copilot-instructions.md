# Copilot Instructions for SponsorHub

## Project Overview

**SponsorHub** is a comprehensive sponsor management application for tracking sponsorships, managing deliverables, handling attendee tickets, and maintaining sponsor relationships throughout the year.

- **Primary Purpose**: Complete lifecycle management of sponsor relationships, from initial contact through event execution and post-event wrap-up
- **Technology Stack**: Node.js/Express backend, EJS templating, Tailwind CSS frontend, Chart.js for analytics, in-memory data storage (ready for Firebase/database integration)
- **Key Features**: Sponsor tracking, deliverable status management, ticket allocation, task management, calendar events, financial reporting, and yearly analytics

## Architecture Overview

### Backend (Node.js/Express)

```
index.js (Main server)
├── Routes
│   ├── GET / → redirects to /dashboard
│   ├── GET /login → login page
│   ├── POST /login → login handler
│   ├── GET /dashboard → main app
│   └── GET /api/sponsors → data endpoint
├── Static Files (public/)
├── Views (views/)
└── Port: 3000
```

### Frontend Architecture

**Views (EJS Templates)**:
- `dashboard.ejs` - Main application shell with all 8 sections and modal structures
- `modals.ejs` - Reusable modal components (delete, events, notes, sponsors, assets, status)
- `login.ejs` - Authentication page (legacy; can be removed if not needed)

**Core Sections**:
1. **Dashboard** - Overview with summary cards, progress bars, charts for contributions and attendance, upcoming events/overdue tasks
2. **My Sponsors** - Grid view of sponsors with search, sort, filter, export to CSV
3. **Contacts** - Contact directory linked to sponsors
4. **Stay Organized** - Calendar widget + task management + sponsor deliverable status tracking
5. **Yearly Tracking** - Multi-year financial analysis, ticket totals, attendance history
6. **Notes** - Sponsor-linked note system with CRUD operations
7. **Assets** - Inventory management with availability flags and sponsor associations
8. **My Profile** - User profile and sign-out

### Data Model

**Sponsor Object**:
```javascript
{
  id: string (UUID),
  sponsorYear: number,
  name: string (contact person),
  company: string,
  contact: string (email),
  phone: string,
  type: "Presenting|Associate|Supporting|Contributing|Friends of Fair|Media Sponsors",
  amount: number,
  status: "Active|Pending|Closed",
  isContractSigned: boolean,
  isLogoReceived: boolean,
  isBannerPlaced: boolean,
  isPaymentReceived: boolean,
  sponsorTasks: {
    "Follow-up": boolean,
    "Meet with Them": boolean,
    "Send Event Invite": boolean,
    "Waiting for RSVP": boolean,
    "Confirmed RSVP": boolean,
    "End of the Year Wrap Up": boolean,
    "Email Them": boolean
  },
  tickets: {
    wed: { general: number, vip: number },
    thu: { general: number, vip: number },
    fri: { general: number, vip: number },
    sat: { general: number, vip: number },
    sun: { general: number, vip: number }
  },
  notes: string,
  date: ISO8601 timestamp
}
```

**Other Data Models**:
- **Event**: { id, date, time, name, notes, dateAdded }
- **Task**: { id, name, notes, dueDate, isCompleted, dateAdded }
- **Note**: { id, title, content, sponsorId (optional), dateAdded }
- **Asset**: { id, name, description, amount, price, isAvailable, sponsorId (optional), dateAdded }
- **Yearly Attendance**: { year: attendance count }

## Development Patterns

### Data Flow

1. **Initialization**: `setupRealtimeListeners()` loads simulated data into arrays
2. **Rendering**: Event listeners trigger render functions that populate DOM
3. **CRUD Operations**: `addDoc`, `setDoc`, `deleteDoc` update simulated data, then call `renderAllData()`
4. **Charts**: Chart.js instances created/destroyed in dedicated render functions

### Key Functions

**Render Functions** (in app.js):
- `renderSponsors()` - Sponsor grid with search/sort/filter
- `renderContacts()` - Contact list
- `renderDashboardSummary()` - Summary cards and progress bars
- `renderSponsors()`, `renderYearlyTotals()`, `renderSponsorContributions()` - Financial charts
- `renderCalendar()` - Calendar widget
- `renderTasks()`, `renderNotes()`, `renderAssets()` - CRUD list views

**Modal Management**:
- `showAddEditSponsorModal()` / `hideAddEditSponsorModal()`
- `showEventModal()` / `hideEventModal()`
- `showNoteModal()` / `hideNoteModal()`
- `showAddEditAssetModal()` / `hideAddEditAssetModal()`
- `showStatusModal()` - Review deliverable status by sponsor
- `showSponsorDetailModal()` / `hideSponsorDetailModal()`

**Data Mutation**:
- `addDoc(collectionName, data)` - Creates new record with UUID
- `setDoc(collectionName, id, data)` - Updates existing record
- `deleteDoc(collectionName, id)` - Removes record
- `getDoc(collectionName, id)` - Retrieves single record

### UI/UX Conventions

1. **Responsive Design**: Uses Tailwind CSS grid (1/2/3/4 columns based on breakpoint)
2. **Sidebar Navigation**: Slides out on mobile, fixed on desktop (lg breakpoint)
3. **Modal Pattern**: Center overlay with close button, delete confirmations require confirmation modal
4. **Loading States**: Spinner divs shown initially, hidden on data load
5. **Color Coding**: 
   - Blue (#2563eb) for primary actions and charts
   - Green for completed tasks/success
   - Red for warnings/deletes
   - Yellow/Red for status badges (Active/Pending/Closed)

### Tab Switching

```javascript
switchTab(targetId) {
  // Hide all sections
  // Show target section by ID
  // Update active sidebar highlight
  // Close sidebar on mobile
}
```

## Critical Developer Knowledge

### Setup & Running

```bash
npm install          # Install express + ejs + tailwindcss
npm start            # Starts server on port 3000
```

Access: `http://localhost:3000/dashboard`

### Data Persistence (Current vs. Future)

**Current (Demo Mode)**:
- Uses in-memory arrays: `simulatedSponsors`, `simulatedEvents`, etc.
- Data resets on server restart
- Perfect for testing/demo

**Future Integration (Firebase/Database)**:
- Replace `simulatedSponsors` with Firestore collection references
- Update `addDoc`, `setDoc`, `deleteDoc` with Firebase SDK calls
- `onSnapshot` listeners already structured for Firebase-style updates
- Auth can use Firebase Auth (currently mocked with demo-user-id)

### Common Tasks

**Add New Section**:
1. Create HTML div with `id="new-section"` in `dashboard.ejs`
2. Add nav link with `data-target="new-section"`
3. Add render function in `app.js`
4. Call render in `setupRealtimeListeners()`
5. Implement CRUD handlers

**Modify Sponsor Data**:
- All sponsor mutations go through `setDoc('sponsors', sponsorId, updates)`
- Progress bars and charts auto-recalculate via `renderDashboardSummary()`
- Export CSV includes all fields dynamically

**Add Chart**:
- Import Chart.js (already in HTML via CDN)
- Create canvas element with unique ID
- Destroy previous instance if exists
- Create new Chart() with data and options
- Store instance in global variable for cleanup

### Performance Notes

- 200+ sponsors render smoothly with current grid layout
- Charts use 500+ data points without lag
- Modal overlays use CSS transforms (GPU-accelerated)
- Calendar doesn't precompute all months (just current month)

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6 module syntax (public/app.js)
- Tailwind CSS 3+ for responsive utilities
- Chart.js 3+ for charting

### Debug Tips

- Open browser DevTools → Console to see `console.error` logs from save operations
- Check `simulatedSponsors` array directly in console to inspect data
- Search functionality uses `.includes()` for real-time filtering (no lag)
- Modal state managed by classList toggle (hidden class), easy to inspect

## Integration Points

**Ready for Integration**:
- Firebase Firestore (replace simulated arrays with collection refs)
- Firebase Authentication (replace demo-user-id with `auth.currentUser`)
- Firebase Storage (for logo/banner file uploads)
- REST APIs (current `/api/sponsors` endpoint ready for expansion)
- Database (PostgreSQL, MongoDB) via Express routes

**External Libraries**:
- Chart.js 3+ (analytics charts)
- Tailwind CSS (styling)
- EJS (templating)
- Express.js (web framework)

## File Structure

```
.
├── index.js                    # Express server
├── package.json               # Dependencies
├── public/
│   ├── app.js                # Main application logic (8KB, full-featured)
│   └── style.css             # Base styles (mostly Tailwind inline)
├── views/
│   ├── dashboard.ejs         # Main app shell
│   └── modals.ejs           # Modal templates
└── .github/
    └── copilot-instructions.md
```

## Testing Checklist

- [ ] All 8 navigation tabs switch correctly
- [ ] Sponsors can be added/edited/deleted with validation
- [ ] CSV export includes all sponsors with proper escaping
- [ ] Calendar shows events with dot indicators
- [ ] Tasks toggle completion and appear in overdue list
- [ ] Progress bars update when sponsor status changes
- [ ] Charts render without console errors
- [ ] Modals close on Escape or backdrop click
- [ ] Mobile sidebar opens/closes smoothly
- [ ] Year selector filters dashboard data correctly

