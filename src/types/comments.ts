export type CommentUser = {
  id: string;
  name: string | null;
  displayName: string | null;
  username: string | null;
  avatarUrl?: string | null;
  image?: string | null;
};

export type CommentNode = {
  id: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  user: CommentUser;
  likes: number;
  dislikes: number;
  userReaction: "LIKE" | "DISLIKE" | null;
  replies: CommentNode[];
};

export function countCommentNodes(nodes: CommentNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countCommentNodes(n.replies), 0);
}
