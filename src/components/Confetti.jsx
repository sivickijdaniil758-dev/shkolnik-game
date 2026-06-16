function Confetti({ active }) {
  if (!active) return null

  const colors = ['#58cc02', '#ffc800', '#ff9600', '#1cb0f6', '#ff4b4b', '#ce82ff']

  return (
    <div className="confetti-burst" aria-hidden="true">
      {Array.from({ length: 32 }).map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            '--i': i,
            '--color': colors[i % colors.length],
            '--x': `${(i * 17) % 100}%`,
            '--delay': `${(i % 8) * 0.04}s`,
            '--rot': `${(i * 47) % 360}deg`,
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
