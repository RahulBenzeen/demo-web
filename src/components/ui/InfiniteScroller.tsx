import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowDownCircle } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  body: string;
}

const InfiniteScroller: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { rootMargin: '100px' });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);
  
  // Cleanup observer on component unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);
  
  // Fetch posts when page changes
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call with delay
        const response = await new Promise<Post[]>(resolve => {
          setTimeout(() => {
            // Generate 5 mock posts
            const newPosts = Array.from({ length: 5 }, (_, i) => ({
              id: (page - 1) * 5 + i + 1,
              title: `Post ${(page - 1) * 5 + i + 1}`,
              body: `This is the content of post ${(page - 1) * 5 + i + 1}. It contains some sample text to demonstrate the infinite scrolling feature.`
            }));
            
            // Simulate end of data after page 5
            if (page > 5) {
              resolve([]);
            } else {
              resolve(newPosts);
            }
          }, 1000);
        });
        
        setPosts(prevPosts => {
          // Filter out duplicates by ID
          const existingIds = new Set(prevPosts.map(post => post.id));
          const uniqueNewPosts = response.filter(post => !existingIds.has(post.id));
          return [...prevPosts, ...uniqueNewPosts];
        });
        
        setHasMore(response.length > 0);
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
        console.error('Error fetching posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [page]);
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md text-center">
          {error}
        </div>
      )}
      
      {posts.map((post, index) => {
        const isLastItem = index === posts.length - 1;
        
        return (
          <div 
            key={post.id}
            ref={isLastItem ? lastPostElementRef : null}
            className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.body}</p>
          </div>
        );
      })}
      
      {isLoading && (
        <div className="flex justify-center p-4 animate-pulse">
          <div className="flex items-center space-x-2">
            <ArrowDownCircle className="h-5 w-5 text-primary" />
            <span className="text-gray-500">Loading more posts...</span>
          </div>
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="text-center p-4 text-gray-500">
          You've reached the end of the posts
        </div>
      )}
      
      {!isLoading && posts.length === 0 && (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No posts found</p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroller;