import { Button } from '@/components/ui/button';

export default function LandingPage({ username, onEnterChat }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-balance mb-8">Welcome to Airme Chat, {username}!</h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <p className="mb-6">You're all set! Ready to start chatting?</p>
        <Button onClick={onEnterChat} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">Enter Chat Room</Button>
      </div>
    </div>
  );
}