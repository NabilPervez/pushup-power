import Dexie from 'dexie';

const db = new Dexie('HourlyHabitsDB');
db.version(1).stores({
  user_settings: 'id, active_start, active_end, notifications_enabled, *exercises_enabled, theme',
  baselines: 'timestamp, pushups_max, squats_max, is_active',
  workout_logs: 'id, date, timestamp, hour_slot, pushups_completed, squats_completed, steps_logged'
});

async function seed() {
  await db.user_settings.put({
      id: 'user',
      active_start: '08:00',
      active_end: '20:00',
      notifications_enabled: false,
      exercises_enabled: ['pushups', 'squats'],
      theme: 'light'
  });

  await db.baselines.put({
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
      pushups_max: 50,
      squats_max: 100,
      is_active: true
  });

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    for (let hour = 8; hour <= 20; hour += 2) {
      await db.workout_logs.put({
        id: `${dateStr}-${hour}`,
        date: dateStr,
        timestamp: d.getTime() + hour * 3600 * 1000,
        hour_slot: hour,
        pushups_completed: Math.floor(Math.random() * 20) + 10,
        squats_completed: Math.floor(Math.random() * 30) + 15,
        steps_logged: Math.floor(Math.random() * 2000) + 500,
        water_oz: 8
      });
    }
  }
  console.log("Seeded");
}
seed();
