'use client';
import { useState } from 'react';
import Button from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useNotify } from "@/hooks/use-notify";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { notify } = useNotify()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notify('Registration failed.', 'Passwords do not match.', 'error');
      return;
    }
    register(username, email, password);
  };

  return (
    <form onSubmit={handleRegister}>
      <div className="mb-4">
        <input
          id="username"
          type="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="-input border w-full"
          placeholder="Username"
          required
        />
      </div>

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
          placeholder="Enter your password"
          required
        />
      </div>

      <div className="mb-4">
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="-input border w-full"
          placeholder="Confirm your password"
          required
        />
      </div>

      <Button
        type="submit"
        text="Register"
        loading={loading}
        disabled={loading}
        className="-btn border-gradient w-full text-text font-medium h-12 rounded-xl"
      />

    </form>
  );
}
