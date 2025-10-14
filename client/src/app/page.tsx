import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-center">
        <h1 className="text-6xl font-bold mb-4">
          🔥 Matchbox
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find your perfect project partner for MOR 531
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🎯 Find Partners</h3>
            <p className="text-gray-600">
              Connect with students who share your interests and skills
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">💡 Build Projects</h3>
            <p className="text-gray-600">
              Collaborate on exciting projects and bring your ideas to life
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🚀 Grow Together</h3>
            <p className="text-gray-600">
              Learn from each other and expand your network
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
