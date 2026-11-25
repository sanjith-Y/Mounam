import React from 'react';
import {
  Heart,
  Target,
  CheckCircle2,
  Award,
  Globe2,
  Lock
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const About: React.FC = () => {
  const pillars = [
    {
      icon: <Heart className="w-6 h-6 text-rose-600" />,
      title: "Dignity First",
      desc: "Assistive communication shouldn't sound like a monotone robot or demand strenuous effort. We design interactions that preserve the personality, respect, and warmth of every speaker."
    },
    {
      icon: <Target className="w-6 h-6 text-brand-purple-600" />,
      title: "Effortless Simplicity",
      desc: "Zero complicated menus or technical jargon. Anyone from a 5-year-old recovering from oral surgery to an 85-year-old grandfather with mild tremors can navigate with ease."
    },
    {
      icon: <Globe2 className="w-6 h-6 text-brand-blue-600" />,
      title: "Cultural & Linguistic Inclusivity",
      desc: "Language is the root of human connection. By supporting major regional languages like Tamil, Hindi, Telugu, Malayalam, and Kannada alongside English, we ensure family conversations feel genuine."
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
      title: "Privacy & Safe Offline Operation",
      desc: "Personal thoughts, medical symptoms, and family vocabulary must remain confidential. Camera gestures run strictly on-device, and offline fallback guarantees communication without internet."
    }
  ];

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      
      {/* Hero / Vision */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-purple-100 text-brand-purple-900 text-xs font-bold tracking-wide uppercase">
          Our Vision & Mission
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Every Voice Deserves to Be Heard.
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
          MOUNAM was founded with a singular conviction: human thoughts, feelings, and needs must never remain trapped in silence due to physical, neurological, or temporary vocal barriers.
        </p>
      </div>

      {/* Story & Background */}
      <div className="bg-gradient-to-br from-brand-purple-50/50 via-white to-brand-blue-50/40 rounded-3xl p-8 sm:p-14 border border-brand-purple-100 shadow-soft-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple-700">The Story Behind MOUNAM</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Transforming the Sanskrit/Tamil Concept of <span className="text-brand-purple-800">“Mounam”</span> (Silence) into Expressive Voice
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              In classical languages, <em>Mounam</em> represents silence. For millions of people worldwide—including individuals recovering from strokes, those living with ALS, cerebral palsy, vocal chord paralysis, post-surgical intubation, or aging elders—silence is not a meditative choice, but a daily struggle to ask for water, express physical discomfort, or say "I love you" to their grandchildren.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              MOUNAM changes that reality by using cutting-edge yet approachable technology: Google Gemini AI context generation, MediaPipe contactless gesture perception, and multilingual SpeechSynthesis—packaged into a responsive, intuitive interface accessible from any phone, tablet, or laptop.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-purple-700" />
              <span>Who MOUNAM Serves</span>
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Individuals recovering from neurological trauma or stroke</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Patients with Amyotrophic Lateral Sclerosis (ALS) & Motor Neurone Disease</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Patients in ICU or post-operative temporary intubation</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Seniors experiencing vocal frailty or mild cognitive strain</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Dedicated family caregivers, home nurses, and hospital care teams</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Core Values / Pillars */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            Our Guiding Principles
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every line of code and user interface decision is anchored by these values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pil, idx) => (
            <Card key={idx} className="flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {pil.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {pil.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pil.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action CTA */}
      <div className="text-center pt-4">
        <Button to="/dashboard" variant="primary" size="xl">
          Experience the Communication Assistant
        </Button>
      </div>

    </div>
  );
};
