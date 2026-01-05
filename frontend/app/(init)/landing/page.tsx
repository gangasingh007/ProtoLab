'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  FlaskConical, Network, Cpu, GitBranch, Users, ArrowRight, 
  CheckCircle2, PlayCircle, Database, Sparkles, Globe, 
  Shield, GraduationCap, Microscope, ChevronDown, ChevronUp,
  Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Router } from 'next/router';

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const float = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]); // Parallax for background
  const y2 = useTransform(scrollY, [0, 500], [0, -50]); // Parallax for hero content

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      
      {/* --- Navigation --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-[#0B0E14] shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
              <FlaskConical className="w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">ProtoLab</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-teal-400 transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-teal-400 transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-teal-400 transition-colors">FAQ</button>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-black shadow-lg shadow-teal-500/20 border border-teal-500/50 rounded-full px-6 transition-all hover:scale-105">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Animated Background Gradients */}
        <motion.div style={{ y: y1 }} className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] -z-10 opacity-60" />
        <motion.div style={{ y: y1 }} className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] -z-10 opacity-40" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
           
            
            <motion.h1 
            //@ts-ignore
            variants={fadeInUp} className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Accelerate Discovery.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-white animate-text-shimmer">Preserve Knowledge.</span>
            </motion.h1>
            
            <motion.p 
            //@ts-ignore
            variants={fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop losing research to tribal knowledge. ProtoLab connects your experiments, 
              code, and literature into a single, living knowledge graph—powered by AI.
            </motion.p>
            
            <motion.div 
            //@ts-ignore
            variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button  size="lg" className="h-14 px-8 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-lg w-full sm:w-auto shadow-2xl hover:shadow-teal-500/10 transition-all hover:-translate-y-1">
                Start Researching
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold text-lg w-full sm:w-auto backdrop-blur-sm">
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            style={{ y: y2 }}
            className="mt-20 relative mx-auto max-w-6xl perspective-1000"
          >
            <div className="rounded-xl border border-white/10 bg-[#151921]/80 backdrop-blur-xl shadow-2xl p-2 ring-1 ring-white/10">
                {/* Mock UI Header */}
                <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 mb-2 bg-[#0B0E14]/50 rounded-t-lg">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="mx-auto w-1/3 h-5 bg-white/5 rounded-md" />
                </div>
                
                {/* Mock Dashboard Grid */}
                <div className="grid grid-cols-12 gap-4 h-[400px] lg:h-[600px] p-2">
                    <div className="col-span-2 hidden lg:block bg-white/5 rounded-lg border border-white/5 animate-pulse-slow" />
                    <div className="col-span-12 lg:col-span-7 bg-[#0B0E14] rounded-lg border border-white/5 flex flex-col relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
                        
                        {/* Fake Code/Content */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-500"><FlaskConical className="w-5 h-5"/></div>
                                <div>
                                    <div className="h-4 w-48 bg-white/10 rounded mb-2" />
                                    <div className="h-3 w-24 bg-white/5 rounded" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-white/5 rounded" />
                                <div className="h-3 w-5/6 bg-white/5 rounded" />
                                <div className="h-3 w-4/6 bg-white/5 rounded" />
                            </div>
                            <div className="mt-8 p-4 bg-black/20 rounded-lg border border-white/5 font-mono text-xs text-teal-400/80">
                                $ docker run -it --gpus all protolab/exp-92bg
                                <br />
                                <span className="text-slate-500">{'>'} Environment setup complete. Reproducibility verified.</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3 hidden lg:block bg-white/5 rounded-lg border border-white/5" />
                </div>
            </div>

            {/* Floating Badges with Framer Motion */}
            <motion.div
            // @ts-ignore 
                variants={float}
                animate="animate"
                className="absolute -left-8 top-1/4 p-4 bg-[#151921] border border-white/10 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md hidden lg:flex"
            >
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Cpu className="w-6 h-6" /></div>
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reproducibility</p>
                    <p className="text-base text-white font-bold">100% Verified</p>
                </div>
            </motion.div>

            <motion.div
            // @ts-ignore 
                variants={float}
                animate="animate"
                transition={{ delay: 1.5 }} // Offset the float
                className="absolute -right-12 bottom-1/3 p-4 bg-[#151921] border border-white/10 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md hidden lg:flex"
            >
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Network className="w-6 h-6" /></div>
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Knowledge Graph</p>
                    <p className="text-base text-white font-bold">52 Nodes Linked</p>
                </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- Social Proof --- */}
    

      {/* --- Deep Dive Feature: The Problem --- */}
      <section id="how-it-works" className="py-32 relative">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <motion.div 
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true }} 
                    variants={staggerContainer}
                >
                    <motion.h2 
                    // @ts-ignore
                    variants={fadeInUp} className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        Research happens in silos. <br />
                        <span className="text-slate-500">We fix the fragmentation.</span>
                    </motion.h2>
                    <motion.div 
                    // @ts-ignore
                    variants={fadeInUp} className="space-y-8">
                        <ProblemItem 
                            title="The Senior Trap" 
                            desc="When a senior student leaves, they take their logs, failed attempts, and setup details with them. The lab resets."
                        />
                        <ProblemItem 
                            title="Reproducibility Crisis" 
                            desc="Code works on one machine but fails on another. Exact environment steps are rarely documented."
                        />
                        <ProblemItem 
                            title="Disconnected Literature" 
                            desc="5 students read the same 50 papers independently. No shared insights or connections."
                        />
                    </motion.div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {/* Abstract Representation of Order vs Chaos */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 blur-[100px] -z-10" />
                    <div className="grid grid-cols-2 gap-4">
                        <FeatureCard icon={GitBranch} title="Version Control" desc="Link code commits directly to experimental results." delay={0} />
                        <FeatureCard icon={Database} title="Data Persistence" desc="Datasets versioned and linked to every run." delay={0.1} />
                        <FeatureCard icon={Users} title="Real-Time Sync" desc="Collaborate on protocols like a Google Doc." delay={0.2} />
                        <FeatureCard icon={CheckCircle2} title="Auto-Reproduce" desc="Spin up Docker containers in one click." delay={0.3} />
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* --- Feature Deep Dive: Alternating Layouts --- */}
      <section id="features" className="py-32 bg-[#0F1116] border-y border-white/5">
        <div className="container mx-auto px-6 space-y-32">
            
            {/* Feature 1: Knowledge Graph */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="order-2 md:order-1 relative h-[400px] bg-[#151921] rounded-2xl border border-white/5 p-8 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-[url('/graph-pattern.svg')] opacity-20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/30 rounded-full blur-[80px] group-hover:bg-purple-500/50 transition-colors" />
                    <Network className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse-slow" />
                </motion.div>
                <div className="order-1 md:order-2">
                    <div className="inline-flex items-center gap-2 text-purple-400 font-bold mb-4 uppercase tracking-wider text-sm">
                        <Network className="w-4 h-4" /> Knowledge Graph
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-6">Connect dots humans miss.</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        ProtoLab automatically connects experiments, papers, and results into a semantic graph. 
                        Ask questions like "Show me all failed attempts using ResNet-50" and see the connections visually.
                    </p>
                    <ul className="space-y-4">
                        <CheckItem text="Visualize dependencies between papers and code" />
                        <CheckItem text="Detect conflicting results across different students" />
                        <CheckItem text="Navigate research history visually" />
                    </ul>
                </div>
            </div>

            {/* Feature 2: AI Insights */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 text-teal-400 font-bold mb-4 uppercase tracking-wider text-sm">
                        <Cpu className="w-4 h-4" /> AI Research Assistant
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-6">An AI that actually understands science.</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        Our LLM agents analyze your results against uploaded literature. Get recommendations on 
                        hyperparameters, detect anomalies, and generate executive summaries automatically.
                    </p>
                    <ul className="space-y-4">
                        <CheckItem text="Auto-summarize 20-page papers in seconds" />
                        <CheckItem text="Suggest next steps based on failed experiments" />
                        <CheckItem text="Draft conference papers from your lab notes" />
                    </ul>
                </div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative h-[400px] bg-[#151921] rounded-2xl border border-white/5 p-8 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-teal-500/5" />
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />
                    <div className="flex flex-col gap-4 relative z-10 mt-12">
                        <div className="bg-[#0B0E14] p-4 rounded-lg border border-white/10 shadow-xl max-w-[80%] self-end transform translate-x-4">
                            <p className="text-xs text-slate-400 mb-1">Researcher</p>
                            <p className="text-sm text-white">Why did the accuracy plateau at 85%?</p>
                        </div>
                        <div className="bg-teal-900/20 p-4 rounded-lg border border-teal-500/20 shadow-xl max-w-[90%]">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <p className="text-xs text-teal-400 font-bold">ProtoLab AI</p>
                            </div>
                            <p className="text-sm text-slate-200">Based on <span className="text-teal-400 underline">Paper X</span>, your learning rate decay might be too aggressive. Try reducing gamma to 0.1.</p>
                        </div>
                    </div>
                </motion.div>
            </div>

        </div>
      </section>

      {/* --- Testimonials --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-white mb-16">Researchers love ProtoLab</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <TestimonialCard 
                    quote="Finally, a tool that understands how research actually works. The knowledge graph saved us months of redundant work."
                    author="Dr. Sarah Chen"
                    role="AI Lab Lead, Stanford"
                />
                <TestimonialCard 
                    quote="The reproducibility feature is magic. One click and I have the exact environment my predecessor used 2 years ago."
                    author="James Miller"
                    role="PhD Candidate, MIT"
                />
                <TestimonialCard 
                    quote="It's like having a super-memory for the entire department. We don't lose knowledge when students graduate anymore."
                    author="Prof. Alex Rivera"
                    role="Dept. of Neuroscience"
                />
            </div>
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section id="faq" className="py-24 bg-[#0F1116] border-t border-white/5">
        <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
                <FAQItem 
                    question="How does the reproducibility engine work?" 
                    answer="We use Docker containers combined with Git commits and Data Version Control (DVC). When you click 'Reproduce', we spin up a container with the exact dependencies, code state, and dataset used in the original experiment." 
                />
                <FAQItem 
                    question="Can I invite collaborators from other universities?" 
                    answer="Yes! ProtoLab supports federated sharing. You can grant view or edit access to specific projects without exposing your entire lab's data." 
                />
                <FAQItem 
                    question="Is my data secure?" 
                    answer="Absolutely. We use enterprise-grade encryption for all data at rest and in transit. Your proprietary datasets and findings remain strictly private unless explicitly shared." 
                />
                <FAQItem 
                    question="Does it integrate with GitHub?" 
                    answer="Seamlessly. We link experiments directly to commit hashes, so you always know exactly which version of the code produced which result." 
                />
            </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-32 relative overflow-hidden">
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="absolute inset-0 bg-gradient-to-b from-teal-900/10 to-[#0B0E14]" 
        />
        <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to upgrade your lab?</h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
                Join universities and research teams using ProtoLab to ensure their knowledge never walks out the door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="h-14 px-8 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform hover:scale-105">
                    <Link href="/register">Create Free Workspace</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/10 bg-transparent hover:bg-white/5 text-white rounded-full font-bold text-lg">
                    Contact Sales
                </Button>
            </div>
            <p className="mt-6 text-sm text-slate-500">Free for academic use. No credit card required.</p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-white/5 bg-[#0B0E14] text-slate-500 text-sm">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-[#0B0E14]">
                            <FlaskConical className="w-4 h-4 fill-current" />
                        </div>
                        <span className="font-bold text-white text-lg">ProtoLab</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                        The unified operating system for modern research labs. Built for scientists, by scientists.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Product</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Integrations</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Changelog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Resources</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Documentation</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">API Reference</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Community</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Company</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-teal-400 transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Legal</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p>© 2026 ProtoLab Inc. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors"><Globe className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-white transition-colors"><Users className="w-4 h-4" /></a>
                </div>
            </div>
        </div>
      </footer>

    </div>
  );
}

// --- Helper Components ---

function ProblemItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4 group">
            <div className="w-1 h-auto min-h-[60px] bg-red-500/20 group-hover:bg-red-500 rounded-full transition-colors duration-300" />
            <div>
                <h3 className="text-white font-semibold text-lg group-hover:text-red-400 transition-colors">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, desc, delay }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="p-6 rounded-xl bg-[#151921] border border-white/5 hover:border-teal-500/30 transition-all group hover:bg-[#1A1D24]"
        >
            <Icon className="w-8 h-8 text-teal-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">{title}</h3>
            <p className="text-sm text-slate-400">{desc}</p>
        </motion.div>
    )
}

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3 text-teal-500" />
            </div>
            <span className="text-slate-300">{text}</span>
        </div>
    )
}

function TestimonialCard({ quote, author, role }: any) {
    return (
        <Card className="bg-[#151921] border-white/5 p-6 hover:border-white/10 transition-colors">
            <Quote className="w-8 h-8 text-teal-500/20 mb-4" />
            <p className="text-slate-300 mb-6 leading-relaxed">"{quote}"</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                    {author.charAt(0)}
                </div>
                <div>
                    <p className="text-white font-semibold text-sm">{author}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                </div>
            </div>
        </Card>
    )
}

function FAQItem({ question, answer }: any) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
            >
                <span className="text-lg font-medium text-slate-200">{question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="text-slate-400 pb-6 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Simple Card wrapper to avoid importing standard shadcn card if not needed, 
// or repurpose standard one. Keeping it simple here.
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("rounded-xl", className)}>{children}</div>
}