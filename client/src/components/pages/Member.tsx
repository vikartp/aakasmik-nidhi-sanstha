import { useAuth } from '@/context/AuthContext';

export default function Member() {
  const { user } = useAuth();
  console.log('Member user:', user);
  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      {/* Additional member features can be added here */}
      New features for members will be added soon. Stay tuned!
    </div>
  );
}
