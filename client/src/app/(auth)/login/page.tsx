'use client';

import { useState } from 'react';
import { useAuth } from "@/providers/auth-provider";
import Button from "@/components/ui/button";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="mb-4">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="-input border w-full"
          placeholder="Email"
          required
        />
      </div>

      <div className="mb-4">
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="-input border w-full"
          placeholder="Password"
          required
        />
      </div>

      <Button
        type="submit"
        text="Login"
        loading={loading}
        disabled={loading}
        className="-btn border-gradient w-full text-text font-medium h-12 rounded-xl"
      />
    </form>
  );
}
