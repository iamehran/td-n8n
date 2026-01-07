'use client';

import { useState } from 'react';

interface UserPromptProps {
  onUserSet: (userId: string, email: string) => void;
}

export default function UserPrompt({ onUserSet }: UserPromptProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || null }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get/create user');
      }

      localStorage.setItem('todo_user_id', data.data.id);
      localStorage.setItem('todo_user_email', data.data.email);
      onUserSet(data.data.id, data.data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md slide-up">
        {/* Logo/Title */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-2">to-do</h1>
          <p className="text-xl sm:text-2xl text-[var(--accent)] font-medium">(but with AI)</p>
          <p className="text-lg sm:text-xl text-[var(--muted)] mt-3">
            simple. minimal. intelligent.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email..."
              className="input-hand w-full text-xl sm:text-2xl"
              required
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name (optional)..."
              className="input-hand w-full text-xl sm:text-2xl"
              disabled={loading}
              autoComplete="name"
            />
          </div>

          {error && (
            <p className="text-red-500 text-lg sm:text-xl fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="btn-hand primary w-full text-xl sm:text-2xl py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'loading...' : 'get started'}
          </button>
        </form>

        {/* Feature hints */}
        <div className="mt-10 sm:mt-12 space-y-3 text-center">
          <p className="text-base sm:text-lg text-[var(--muted)]">
            AI enhances your tasks automatically
          </p>
          <p className="text-base sm:text-lg text-[var(--muted)]">
            works with WhatsApp too
          </p>
        </div>
      </div>
    </div>
  );
}
