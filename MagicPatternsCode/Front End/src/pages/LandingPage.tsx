import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
const LandingPage: React.FC = () => {
  return <div className="min-h-screen flex flex-col">
      <header className="py-6 px-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
              MATCHBOX
            </h1>
          </div>
          <div>
            <Link to="/signup" className="bg-white text-slate-800 px-5 py-2 rounded-full font-medium border border-slate-200 shadow-sm hover:shadow-md transition-all mr-3">
              Sign Up
            </Link>
            <Link to="/login" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg transition-all">
              Log In
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="block">Team Up.</span>
              <span className="block bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
                Ship Work.
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-lg">
              You bring your idea, we help you build the team. Connect with
              fellow students, form project groups, and collaborate seamlessly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all flex items-center">
                Get Started <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <a href="#how-it-works" className="bg-white text-slate-800 px-8 py-3 rounded-full font-medium border border-slate-200 shadow-sm hover:shadow-md transition-all">
                Learn More
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 max-w-md mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg">Mobile App Design</h3>
                  <p className="text-sm text-slate-500">
                    Looking for UI/UX Designer
                  </p>
                </div>
              </div>
              <p className="text-slate-700 mb-6">
                I'm working on a new fitness app and need a designer to help
                with the user interface. Experience with health/fitness apps is
                a plus!
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  UI/UX
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  Figma
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Mobile
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs">
                    KM
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white text-xs">
                    ?
                  </div>
                </div>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Join Team
                </button>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-slate-100 transform rotate-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">A</span>
                </div>
                <div>
                  <h3 className="font-bold">Alex matched!</h3>
                  <p className="text-xs text-slate-500">UI/UX Designer</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-slate-100 transform -rotate-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">S</span>
                </div>
                <div>
                  <h3 className="font-bold">Sam matched!</h3>
                  <p className="text-xs text-slate-500">Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="how-it-works" className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            How MATCHBOX Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-orange-500 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Create Your Profile</h3>
              <p className="text-slate-600">
                Sign up with your .edu email, showcase your skills, and
                highlight your past projects and experiences.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-orange-500 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Find Projects or Teams</h3>
              <p className="text-slate-600">
                Browse available projects or post your own idea. Our matching
                algorithm will suggest the best teammates.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-orange-500 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Collaborate & Ship</h3>
              <p className="text-slate-600">
                Connect with your team through our built-in chat, coordinate
                schedules, and bring your project to life.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-white border-t border-slate-200 py-8 px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold">MATCHBOX</span>
            </div>
            <div className="text-sm text-slate-500">
              © 2023 MATCHBOX. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;