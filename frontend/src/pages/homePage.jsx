import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar'

const outlet = {
  name: 'Burger Lab, Dolmen',
  slug: 'burger-lab-dolmen',
  logo: '',
  color: '#d62828',
  googleReviewUrl: 'https://www.google.com/maps',
}

const COMPLAINT_MAX_STAR = 3 
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

const Home = () => {
  const navigate = useNavigate()
  const [hover, setHover] = useState(0)

  const handleRating = async (stars) => {
    const post = fetch(`${API_URL}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outletSlug: outlet.slug, rating: stars }),
    }).catch((err) => console.error("Failed to post rating:", err))

    await Promise.race([post, new Promise((r) => setTimeout(r, 1500))])

    if (stars <= COMPLAINT_MAX_STAR) {
      navigate('/complaint', { state: { rating: stars, outlet } })
    } else {
      window.location.href = outlet.googleReviewUrl
    }
  }

  return (
    <div>
      <Navbar />
      <main style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <h2>How was your experience at {outlet.name}?</h2>

        <div>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleRating(n)}
              aria-label={`${n} stars`}
              style={{
                fontSize: '2.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: n <= hover ? outlet.color : '#ccc',
              }}
            >
              ★
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home