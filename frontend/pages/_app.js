import '../styles/globals.css'
export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="p-4">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
