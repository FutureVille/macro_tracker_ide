'use client'

import { useState } from 'react'
import { signOut } from '@/lib/actions/auth'
import { useAuth } from './AuthProvider'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function UserMenu() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    if (!user) return null

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground outline-none"
                title="User menu"
            >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="w-4 h-4 text-primary" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop to close on click outside */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 top-full mt-2 w-64 p-2 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl shadow-black/50 z-50 backdrop-blur-xl"
                        >
                            <div className="p-3 border-b border-white/5 mb-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Signed in as</p>
                                <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                            </div>

                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors text-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign out</span>
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
