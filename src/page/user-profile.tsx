// src/pages/UserProfilePage.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserByIdQuery } from '@/store/postApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Mail, Globe, BookUser, BarChart3, MapPin, Link, Users } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useGetUserByIdQuery(userId || '');
  const { theme } = useTheme();
console.log({user})
  useEffect(() => {
    if (isError) {
      navigate('/');
    }
  }, [isError, navigate]);

  if (!userId) {
    return <div className="container py-12 text-center">User not found</div>;
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className={`relative overflow-hidden border-0 shadow-xl rounded-2xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-indigo-50 to-purple-50'
        }`}>
          <div className={`absolute inset-0 ${
            theme === 'dark' 
              ? "bg-[url('https://images.unsplash.com/photo-1505506874110-6a7a69069a08?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')]"
              : "bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')]"
          } bg-cover bg-center opacity-10`} />
          
          <CardHeader className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {isLoading ? (
                <Skeleton className="w-32 h-32 rounded-full" />
              ) : (
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-4xl">
                      {user?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Pro
                  </div>
                </div>
              )}
              
              <div className="text-center md:text-left">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-6 w-32 mb-4" />
                  </>
                ) : (
                  <>
                    <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                      {user?.displayName}
                    </CardTitle>
                    <CardDescription className="text-lg text-purple-600 dark:text-purple-400">
                      @{user?.username || 'user'}
                    </CardDescription>
                  </>
                )}
                
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <Button variant="primary" className="rounded-full px-6 py-3 shadow-md">
                    <Mail className="mr-2 h-4 w-4" /> Message
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'secondary' : 'outline'} 
                    className="rounded-full px-6 py-3"
                  >
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard 
            icon={<BookUser className="text-indigo-600 dark:text-indigo-400" />} 
            title="Posts" 
            value={user?.postCount || 0} 
            isLoading={isLoading}
          />
          <StatCard 
            icon={<Users className="text-purple-600 dark:text-purple-400" />} 
            title="Followers" 
            value={user?.followerCount || 0} 
            isLoading={isLoading}
          />
          <StatCard 
            icon={<Users className="text-pink-600 dark:text-pink-400" />} 
            title="Following" 
            value={user?.followingCount || 0} 
            isLoading={isLoading}
          />
          <StatCard 
            icon={<CalendarDays className="text-blue-600 dark:text-blue-400" />} 
            title="Member Since" 
            value={user?.createdAt ? new Date(user.createdAt).getFullYear() : '2023'} 
            isLoading={isLoading}
          />
        </div>

        {/* Bio and Details */}
        <Card className="mt-6 rounded-2xl border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <BookUser className="text-indigo-600 dark:text-indigo-400" /> About
                </h3>
                
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-4/5 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {user?.bio || "This user hasn't written a bio yet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="text-indigo-600 dark:text-indigo-400" /> Details
                </h3>
                
                <div className="space-y-3">
                  <DetailItem 
                    icon={<MapPin className="text-gray-500 dark:text-gray-400" />}
                    label="Location" 
                    value={user?.location || 'Not specified'} 
                    isLoading={isLoading}
                  />
                  <DetailItem 
                    icon={<Link className="text-gray-500 dark:text-gray-400" />}
                    label="Website" 
                    value={user?.website || 'Not specified'} 
                    isLoading={isLoading}
                    isLink={!!user?.website}
                  />
                  <DetailItem 
                    icon={<CalendarDays className="text-gray-500 dark:text-gray-400" />}
                    label="Joined" 
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'} 
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-6 rounded-2xl border-0 shadow-lg overflow-hidden">
          <CardHeader className={`${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-gray-800 to-gray-900' 
              : 'bg-gradient-to-r from-indigo-50 to-purple-50'
          }`}>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : (
                <>
                  <ActivityItem 
                    title="Published a new post" 
                    description="The Future of UI Design in 2024" 
                    time="2 hours ago"
                  />
                  <ActivityItem 
                    title="Commented on a post" 
                    description="Great insights on React performance optimization!" 
                    time="1 day ago"
                  />
                  <ActivityItem 
                    title="Liked a post" 
                    description="Building Scalable Backends with Firebase" 
                    time="3 days ago"
                  />
                </>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline" className="rounded-full px-6 py-3">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, isLoading }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  isLoading: boolean;
}) => (
  <Card className="rounded-xl border-0 shadow-sm bg-white dark:bg-gray-800 overflow-hidden transition-all hover:shadow-md">
    <CardContent className="p-4 flex flex-col items-center">
      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 mb-3">
        {icon}
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-16 mb-1" />
      ) : (
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
      )}
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    </CardContent>
  </Card>
);

// Detail Item Component
const DetailItem = ({ icon, label, value, isLoading, isLink = false }: { 
  icon: React.ReactNode;
  label: string; 
  value: string; 
  isLoading: boolean;
  isLink?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <div className="pt-1">{icon}</div>
    <div className="flex-1">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1">
        {isLoading ? (
          <Skeleton className="h-4 w-3/4" />
        ) : isLink ? (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-gray-700 dark:text-gray-300">{value}</span>
        )}
      </div>
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ title, description, time }: { 
  title: string; 
  description: string; 
  time: string;
}) => {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
      <div className={`p-3 rounded-full ${
        theme === 'dark' 
          ? 'bg-indigo-900/30 text-indigo-400' 
          : 'bg-indigo-100 text-indigo-600'
      }`}>
        <BookUser className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-800 dark:text-white">{title}</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{description}</p>
      </div>
      <div className="text-gray-400 text-sm whitespace-nowrap">{time}</div>
    </div>
  );
};

export default UserProfilePage;