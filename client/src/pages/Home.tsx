import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Star, Users, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: themes } = trpc.story.themes.useQuery();

  const handleCreateStory = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
    } else {
      setLocation("/create");
    }
  };

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      text: "Meri beti Ananya apni kahaani baar baar sunti hai! She loves seeing herself as the hero. Best gift ever!",
      initials: "PS",
    },
    {
      name: "Rahul Verma",
      location: "Delhi",
      text: "Diwali pe bacchon ko diya tha - they were SO happy seeing their names in a real storybook!",
      initials: "RV",
    },
    {
      name: "Sneha Patel",
      location: "Bangalore",
      text: "Screen-free entertainment that teaches values too. As a parent, what more could I ask for?",
      initials: "SP",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">📚</div>
            <span className="font-bold text-xl text-orange-600">Kahaani</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
                  Dashboard
                </Button>
                <Button onClick={() => setLocation("/create")}>Create Story</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => (window.location.href = getLoginUrl())}>
                  Login
                </Button>
                <Button onClick={handleCreateStory} className="bg-orange-500 hover:bg-orange-600">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-sm font-semibold text-orange-600 mb-4">INDIA'S #1 PERSONALIZED KIDS STORY</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Aapke Bachche Ki <br />
              <span className="text-orange-500">Apni Kahaani</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Har bachche ka ek hero hona chahiye — aur woh hero hai <strong>aapka bachcha!</strong> Personalized stories jo Indian values, festivals aur dadi-nani ki yaadein saath laaye.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button onClick={handleCreateStory} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                Create Your Child's Story
              </Button>
              <Button variant="outline" size="lg">
                Just 60 seconds!
              </Button>
            </div>
            <div className="flex gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">10,000+ stories created</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl p-8 shadow-lg">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="text-center mb-4">
                  <span className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-semibold">
                    Free Preview
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-4">Pehle dekho, phir lo!</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "Ek din, chhota Arjun apne dadi ke ghar ke baagh mein khel raha tha. Tabhi usne dekha ek sunhara mor..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-white py-16 md:py-24 border-t border-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-orange-600 mb-2">SIMPLE 3-STEP PROCESS</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kahaani Banao, Sirf 60 Seconds Mein!</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: 1,
                title: "Bachche Ki Details Daalein",
                description: "Naam, age, aur unki favorite themes choose karein — animals, mythology, festivals, ya kuch bhi!",
                icon: "❤️",
              },
              {
                number: 2,
                title: "Jaadu Se Kahaani Bane",
                description: "Humara magic instantly ek personalized story create karega jismein aapka bachcha hero hoga.",
                icon: "✨",
              },
              {
                number: 3,
                title: "Preview Dekho, Order Karo",
                description: "Free preview dekhein, phir digital PDF ya beautiful printed book order karein. Delivery all over India!",
                icon: "📖",
              },
            ].map((step) => (
              <Card key={step.number} className="border-2 border-orange-100 hover:border-orange-300 transition">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Themes Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kahaaniyon Ki Duniya</h2>
            <p className="text-gray-600">Choose A Theme</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {themes?.map((theme) => (
              <Card
                key={theme.id}
                className="cursor-pointer hover:shadow-lg transition border-2 border-transparent hover:border-orange-300"
                onClick={handleCreateStory}
              >
                <CardHeader>
                  <div className="text-4xl mb-4">{theme.emoji}</div>
                  <CardTitle>{theme.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-orange-50 py-16 md:py-24 border-t border-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-600">Choose Your Kahaani Format</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Digital Story",
                price: "₹199",
                period: "story",
                features: [
                  "Personalized 6-page story",
                  "Beautiful custom illustrations",
                  "Instant PDF download",
                  "Moral values & Indian culture",
                ],
                highlighted: false,
              },
              {
                title: "Printed Book",
                price: "₹499",
                period: "book",
                features: [
                  "Everything in Digital, plus:",
                  "Premium hardcover print",
                  "Delivered to your door",
                  "Perfect birthday gift!",
                ],
                highlighted: true,
              },
            ].map((plan) => (
              <Card
                key={plan.title}
                className={`${plan.highlighted ? "border-2 border-orange-500 shadow-lg" : "border-2 border-orange-200"}`}
              >
                <CardHeader>
                  {plan.highlighted && (
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4">
                      POPULAR
                    </div>
                  )}
                  <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/ {plan.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-orange-500 font-bold">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={handleCreateStory}
                    className={`w-full ${plan.highlighted ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
                  >
                    Get {plan.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Parents Love Kahaani</h2>
            <p className="text-gray-600">Happy Families</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-2 border-orange-100">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Gift A Kahaani!</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Apne dost ke bachche ke liye bhi ek kahaani banao! Best birthday gift, return gift, ya bas pyaar dikhane ka tarika.
          </p>
          <Button onClick={handleCreateStory} size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold">
            Create For A Friend
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 Kahaani. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
