import { useState, useEffect, useRef } from 'react'

// Lightweight debounced similar suggestions hook
// In production, this would query a backend endpoint for actual similarity
// For demo, returns mock similar suggestions based on keywords

const MOCK_SIMILAR = [
  { id: 1, title: 'Poor Internet Connectivity in Hostels', category: 'Technology', status: 'in_progress' },
  { id: 2, title: 'Insufficient Textbooks in Main Library', category: 'Library', status: 'pending' },
  { id: 3, title: 'Broken Chairs in Block A Lecture Halls', category: 'Infrastructure', status: 'pending' },
  { id: 4, title: 'Medical Centre Closing Too Early', category: 'Health', status: 'in_progress' },
  { id: 5, title: 'Cafeteria Food Quality Has Declined', category: 'Student Services', status: 'pending' },
  { id: 6, title: 'Add More Evening Academic Programmes', category: 'Academics', status: 'resolved' },
  { id: 7, title: 'Sports Fields Need Maintenance', category: 'Sports', status: 'in_progress' },
  { id: 8, title: 'Improve Student Registration Portal', category: 'Technology', status: 'resolved' },
  { id: 9, title: 'Gender Neutral Washrooms on Campus', category: 'Infrastructure', status: 'pending' },
  { id: 10, title: 'Mental Health Counselling Services', category: 'Health', status: 'in_progress' },
]

function scoreMatch(query, item) {
  const q = query.toLowerCase()
  const titleWords = item.title.toLowerCase().split(/\s+/)
  const queryWords = q.split(/\s+/).filter(w => w.length > 2)
  let score = 0
  for (const qw of queryWords) {
    for (const tw of titleWords) {
      if (tw.includes(qw) || qw.includes(tw)) score++
    }
  }
  return score
}

export default function useSimilarSuggestions(query) {
  const [suggestions, setSuggestions] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!query || query.trim().length < 5) {
      setSuggestions([])
      return
    }
    timerRef.current = setTimeout(() => {
      const scored = MOCK_SIMILAR
        .map(item => ({ ...item, score: scoreMatch(query, item) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
      setSuggestions(scored)
    }, 500)

    return () => clearTimeout(timerRef.current)
  }, [query])

  return suggestions
}
