import React from 'react';
import { Zap, Users, MessageSquare, Trophy, Sparkles, ArrowRight, CheckCircle, Quote } from 'lucide-react';
export function LandingPage() {
  return <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cardinal to-cardinal-light text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-accent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="text-gold"> Teammate</span>
              <br />
              in Minutes, Not Weeks
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              MATCHBOX connects USC students for hackathons, startups, and class
              projects.
              <span className="font-semibold text-white">
                {' '}
                Connect. Match. Build.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gold hover:bg-gold-accent text-cardinal font-semibold rounded-lg text-lg transition-colors flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-cardinal mb-4">
              How MATCHBOX Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From profile to project in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-cardinal text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-cardinal mb-2">
                Create Your Profile
              </h3>
              <p className="text-gray-600">
                Add your skills, interests, and what you're looking to build.
                Takes 2 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-cardinal text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-cardinal mb-2">
                Discover & Match
              </h3>
              <p className="text-gray-600">
                Browse projects or post your own. Match with teammates who share
                your vision.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-cardinal text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-cardinal mb-2">
                You're BOXED!
              </h3>
              <p className="text-gray-600">
                Start chatting, collaborate in-app, and build something amazing
                together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cardinal text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Build Together
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Purpose-built for student collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <Zap className="w-12 h-12 text-gold mb-4" />
              <h3 className="text-xl font-bold mb-2">Skill-Based Profiles</h3>
              <p className="text-gray-300">
                Showcase your expertise with tags, portfolio links, and past
                projects.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <Users className="w-12 h-12 text-gold mb-4" />
              <h3 className="text-xl font-bold mb-2">Discover People</h3>
              <p className="text-gray-300">
                Connect with talented USC students and alumni who match your
                project needs.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <MessageSquare className="w-12 h-12 text-gold mb-4" />
              <h3 className="text-xl font-bold mb-2">In-App Chat</h3>
              <p className="text-gray-300">
                Real-time messaging for 1:1 and group conversations. No need for
                Discord.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <CheckCircle className="w-12 h-12 text-gold mb-4" />
              <h3 className="text-xl font-bold mb-2">Mutual Approval</h3>
              <p className="text-gray-300">
                Both sides confirm before unlocking chat. No awkward cold
                messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-cardinal mb-4">
              What USC Students Are Saying
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real feedback from students who found their teams on MATCHBOX
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <Quote className="w-10 h-10 text-gold mb-4" />
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                "I found my hackathon team in 3 days. Before MATCHBOX, I spent
                weeks scrolling through Discord with no luck."
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p className="font-semibold text-cardinal">Sarah Chen</p>
                <p className="text-sm text-gray-500">
                  Computer Science, Class of 2025
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <Quote className="w-10 h-10 text-gold mb-4" />
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                "As an introvert, networking events were torture. MATCHBOX let
                me find teammates based on skills, not small talk."
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p className="font-semibold text-cardinal">Marcus Johnson</p>
                <p className="text-sm text-gray-500">
                  Business Administration, Class of 2026
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <Quote className="w-10 h-10 text-gold mb-4" />
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                "Finally, a way to find people who actually want to build. No
                more flaky teammates who ghost after the first meeting."
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p className="font-semibold text-cardinal">Priya Patel</p>
                <p className="text-sm text-gray-500">Design, Class of 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}

      {/* Final CTA Section */}
      <section className="py-20 bg-cardinal">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Team?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join USC students who are already building together on MATCHBOX.
          </p>

          <button className="px-10 py-5 bg-gold hover:bg-gold-accent text-cardinal font-bold rounded-lg text-xl transition-colors inline-flex items-center gap-2">
            Sign Up Now
            <ArrowRight className="w-6 h-6" />
          </button>

          <p className="mt-6 text-white/70">Available for USC students</p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-cardinal text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 MATCHBOX • Built by students, for students
          </p>
        </div>
      </footer>
    </div>;
}