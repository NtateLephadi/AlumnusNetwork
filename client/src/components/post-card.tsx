import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    createdAt: string;
    author: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    };
    likes: number;
    comments: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (liked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`);
      }
    },
    onSuccess: () => {
      setLiked(!liked);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const authorName = post.author.firstName && post.author.lastName 
    ? `${post.author.firstName} ${post.author.lastName}`
    : post.author.firstName || "Alumni";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          {post.author.profileImageUrl ? (
            <img 
              src={post.author.profileImageUrl} 
              alt="Profile" 
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <i className="fas fa-user text-gray-600"></i>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{authorName}</h3>
            <span className="text-gray-500 text-sm">•</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-700 mb-4">{post.content}</p>
          <div className="flex items-center space-x-6 text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-2 hover:text-uct-blue transition-colors ${
                liked ? 'text-uct-red' : ''
              }`}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
            >
              <i className={liked ? "fas fa-heart" : "far fa-heart"}></i>
              <span>{post.likes + (liked ? 1 : 0)}</span>
            </Button>
            <button className="flex items-center space-x-2 hover:text-uct-blue transition-colors">
              <i className="far fa-comment"></i>
              <span>{post.comments}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-uct-blue transition-colors">
              <i className="fas fa-share"></i>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
