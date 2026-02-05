'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            {/* Ambient glow effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Logo & Title */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6"
                    >
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-[#f3cf55] bg-clip-text text-transparent">
                            F
                        </span>
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Sign in to continue tracking your macros
                    </p>
                </div>

                {/* Form */}
                <form action={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                        >
                            <p className="text-sm text-red-400">{error}</p>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-primary to-[#f3cf55] text-black font-semibold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 transition-all duration-200 shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Signup Link */}
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Create one
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
