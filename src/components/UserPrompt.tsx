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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">to-do</h1>
          <p className="text-2xl text-gray-500">simple. minimal. yours.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email..."
              className="input-hand w-full text-2xl"
              required
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name (optional)..."
              className="input-hand w-full text-2xl"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="btn-hand primary w-full text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'loading...' : 'get started'}
          </button>
        </form>

        <p className="text-center mt-8 text-xl text-gray-400">
          your tasks sync via WhatsApp too!
        </p>
      </div>
    </div>
  );
}
