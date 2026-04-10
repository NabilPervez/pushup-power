import Dexie from 'dexie';

export const db = new Dexie('HourlyHabitsDB');

db.version(1).stores({
  user_settings: 'id, active_start, active_end, notifications_enabled, *exercises_enabled, theme', // 'user' is the primary key
  baselines: 'timestamp, pushups_max, squats_max, is_active',
  workout_logs: 'id, date, timestamp, hour_slot, pushups_completed, squats_completed, steps_logged'
});

export const initializeSettings = async () => {
    const existing = await db.user_settings.get('user');
    if (!existing) {
        await db.user_settings.add({
            id: 'user',
            active_start: '08:00',
            active_end: '20:00',
            notifications_enabled: false,
            exercises_enabled: ['pushups', 'squats'],
            theme: 'light'
        });
    }
}
