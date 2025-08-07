// Quick test script to debug saveEntry function
console.log('Testing saveEntry...')

// This would be in a browser environment where we can access the React hooks
// But we can analyze the potential issue here

const testData = {
  mood: 3,
  energy_level: 3,
  daily_intention: 'Voeding bijhouden',
  sleep_hours: 0,
  sleep_quality: 3,
  wake_up_time: '07:00',
  bedtime: '22:30',
  exercise_minutes: 0,
  exercise_type: '',
  meditation_minutes: 0,
  meditation_type: '',
  outdoor_time: 0,
  water_glasses: 8,
  gratitude: '',
  day_highlight: '',
  challenges_faced: '',
  tomorrow_focus: '',
  stress_level: 3,
  notes: '',
}

console.log('Test data:', testData)
console.log('Data keys:', Object.keys(testData))
console.log('Data values:', Object.values(testData))
console.log('Stringify:', JSON.stringify(testData))