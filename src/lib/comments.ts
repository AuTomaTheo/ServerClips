import type { CommentReactionType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CommentNode, CommentUser } from "@/types/comments";

export type { CommentNode, CommentUser } from "@/types/comments";
export { countCommentNodes } from "@/types/comments";

type RawComment = {
  id: string;
  body: string;
  createdAt: Date;
  parentId: string | null;
  user: CommentUser;
  reactions: { type: CommentReactionType; userId: string }[];
};

export function buildCommentTree(
  rows: RawComment[],
  currentUserId?: string
): CommentNode[] {
  const nodes = new Map<string, CommentNode>();

  for (const row of rows) {
    const likes = row.reactions.filter((r) => r.type === "LIKE").length;
    const dislikes = row.reactions.filter((r) => r.type === "DISLIKE").length;
    const mine = currentUserId
      ? row.reactions.find((r) => r.userId === currentUserId)
      : undefined;

    nodes.set(row.id, {
      id: row.id,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
      parentId: row.parentId,
      user: row.user,
      likes,
      dislikes,
      userReaction: mine?.type ?? null,
      replies: [],
    });
  }

  const roots: CommentNode[] = [];
  for (const node of Array.from(nodes.values())) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.replies.push(node);
    } else if (!node.parentId) {
      roots.push(node);
    }
  }

  function sortRecursive(list: CommentNode[]) {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    for (const item of list) sortRecursive(item.replies);
  }
  sortRecursive(roots);

  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return roots;
}

export async function fetchVideoCommentTree(videoId: string, currentUserId?: string) {
  const comments = await prisma.comment.findMany({
    where: { videoId, status: "VISIBLE" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          image: true,
        },
      },
      reactions: { select: { type: true, userId: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  const visibleIds = new Set(comments.map((c) => c.id));
  const filtered = comments.filter(
    (c) => !c.parentId || visibleIds.has(c.parentId)
  );

  const tree = buildCommentTree(filtered, currentUserId);
  return { comments: tree, total: filtered.length };
}

export async function softDeleteCommentTree(commentId: string, videoId: string) {
  const comments = await prisma.comment.findMany({
    where: { videoId, status: "VISIBLE" },
    select: { id: true, parentId: true },
  });

  const toDelete = new Set<string>([commentId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of comments) {
      if (c.parentId && toDelete.has(c.parentId) && !toDelete.has(c.id)) {
        toDelete.add(c.id);
        changed = true;
      }
    }
  }

  await prisma.comment.updateMany({
    where: { id: { in: Array.from(toDelete) } },
    data: { status: "DELETED" },
  });

  return toDelete.size;
}
