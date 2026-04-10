Technical Specification & Developer Blueprint: Pushup Power (PWA)

1. Architecture & Tech Stack

This is a 100% local, offline-first Progressive Web Application (PWA). There is no backend, no authentication, and no cloud database.

Frontend Framework: React (Vite recommended for fast, client-side PWA setup).

Styling: Tailwind CSS.

Icons: lucide-react.

Local Database: IndexedDB (Recommend using dexie or localforage for easier async/await API).

PWA Management: vite-plugin-pwa (for manifest generation, service worker registration, and offline caching).

Notifications: Native Web Push API (triggered locally via Service Worker).

Charts: recharts or chart.js for analytics visualizations.

2. Core Logic & Algorithms

2.1 The "Progressive Overload" Algorithm

The app calculates a safe hourly target based on a user's initial baseline test.

Formula: Hourly Target = Floor(Baseline * 0.30) (Assuming 30% of their max is a safe hourly volume).

Weekly Progression: Every 7 days from the initial baseline test, the app multiplies the daily total target by 1.10 (+10%) and divides it across the active hours.

Recalibration: If the user manually triggers a "Recalibrate Baseline" in settings, the algorithm resets Day 0 to the new date and uses the new inputs.

2.2 The Notification Scheduler

Active Window: Default is 8:00 AM to 8:00 PM (configurable in Settings).

Trigger: The Service Worker checks the time. At :00 of every hour within the active window, it fires a local web push notification.

Payload: "Time to move! Target: [X] Pushups, [Y] Squats."

3. Local Database Schema (IndexedDB)

The database (e.g., HourlyHabitsDB) will have three main object stores:

Store 1: user_settings (Key: id - always 'user')

active_start: string (e.g., "08:00")

active_end: string (e.g., "20:00")

notifications_enabled: boolean

exercises_enabled: array of strings ['pushups', 'squats']

theme: string ('light', 'dark', 'system')

Store 2: baselines (Key: timestamp)

timestamp: integer (Unix epoch)

pushups_max: integer

squats_max: integer

is_active: boolean (only the newest entry is true)

Store 3: workout_logs (Key: id - UUID or Timestamp)

date: string (YYYY-MM-DD for easy querying)

timestamp: integer

hour_slot: integer (0-23, representing which hour this log belongs to)

pushups_completed: integer

squats_completed: integer

steps_logged: integer (Only usually attached to the final log of the day, or a dedicated "end of day" entry)

4. Design System & UI Rules

Responsiveness: Strictly Mobile-First. On desktop/tablet, constrain the main app view to a central, mobile-sized container (e.g., max-w-md mx-auto h-screen shadow-xl overflow-y-auto).

Color Palette:

Primary: Teal/Aqua (bg-teal-500, text-teal-600) - Represents water, health, and calm.

Background (Light): Off-white (bg-gray-50).

Background (Dark): Deep Charcoal (bg-gray-900).

Surface Cards: White (bg-white) or Dark Gray (bg-gray-800).

Typography: System fonts (San Francisco/Roboto). Large, legible numbers for exercise counts.

Tap Targets: Minimum 44px height for all buttons and inputs.

5. Page-by-Page Component Breakdown

5.1 Onboarding Flow (Initial App Load)

Shown only if user_settings does not exist in IndexedDB.

Component <WelcomeCarousel />:

3 swipeable slides explaining the app (1. Move every hour, 2. Safe progression, 3. Drink water).

"Next" button progresses slides.

Component <BaselineTest />:

Prompt: "Do one set of pushups and squats to comfortable failure right now."

Two large numeric <input type="number"> fields.

"Save Baseline" button -> writes to baselines store.

Component <PermissionPrompt />:

Explains why notifications are needed.

"Enable Notifications" button triggers browser Notification API request.

Completion redirects to /today.

5.2 Page: Today (/today)

This is the core dashboard the user interacts with 12 times a day.

Header: Shows the current date (e.g., "Tuesday, Oct 24").

Component <ProgressRing />:

An SVG circular progress bar.

Math: (Current Hour - Start Hour) / Total Active Hours.

Center text: "Hour 4 of 12".

Component <CurrentTargetCard />:

Displays the dynamically calculated target for the current hour.

UI: Two large pill-shaped containers showing the exercise icon and the target number.

Component <LoggingForm />:

Inputs: Two highly prominent <StepperInput /> components (a central number flanked by massive - and + buttons). These auto-populate with the Target number so the user can just hit "Submit" if they did exactly the target.

Action: Massive primary button <Button size="lg" className="w-full bg-teal-500">Log Workout</Button>.

On Submit:

Writes to workout_logs in IndexedDB.

Fires a celebratory toast: "Great job! 💧 Drink 8oz of water and 🚶‍♂️ take 250 steps."

Empty State <RestState />:

If the current time is outside the active_start and active_end window, hide the logging form.

Show a moon icon and text: "Rest up! Your next session begins tomorrow at [active_start]."

5.3 Page: Analytics (/analytics)

Visualizes local IndexedDB data.

Component <HeatmapCalendar />:

A GitHub-style contribution grid spanning the last 3-6 months.

Intensity of the Teal color correlates to (pushups_completed + squats_completed) for that specific date.

Component <DailyStepsLogger />:

A simple card at the top: "Steps Today".

Numeric input and "Save" button to manually patch the steps_logged field for today's date in IndexedDB.

Component <TrendCharts />:

Uses a charting library (recharts).

Chart 1 (Pushups): Line chart. X-axis = Date (last 30 days). Y-axis = Total Daily Pushups.

Chart 2 (Squats): Line chart. Identical structure to Chart 1.

5.4 Page: Settings (/settings)

Form controls directly bound to the user_settings and baselines IndexedDB stores.

Section: Schedule:

<TimePicker /> for Waking Hours (Start) - updates active_start.

<TimePicker /> for Waking Hours (End) - updates active_end.

Section: Exercise Preferences:

<ToggleSwitch /> for "Include Pushups".

<ToggleSwitch /> for "Include Squats".

<Button variant="outline">Recalibrate Baseline</Button> -> Re-opens the <BaselineTest /> modal and calculates a new Day 0.

Section: Data Management (Crucial for Local-First apps):

<Button>Export Data (JSON)</Button>: Queries all IndexedDB stores, stringifies them, and creates a downloadable backup.json file via a Blob URL.

<Button>Import Data</Button>: Opens a hidden <input type="file" accept=".json">. Parses the uploaded JSON and overwrites local IndexedDB stores.

<Button variant="danger">Wipe All Data</Button>: Clears IndexedDB entirely. Prompts with a severe warning modal first.

6. Global Navigation

Component <BottomNav />:

Fixed to the bottom of the screen (fixed bottom-0 w-full max-w-md bg-white border-t).

Three tabs:

Target icon -> /today

BarChart2 icon -> /analytics

Settings icon -> /settings

Active state: Icon fills in and text color changes to teal-600.
