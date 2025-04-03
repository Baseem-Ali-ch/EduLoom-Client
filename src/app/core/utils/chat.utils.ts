// shared/chat-utils.ts
export function generateChatRoomId(id1: string, id2: string): string {
  // Sort IDs to ensure consistent room ID regardless of who initiates
  const ids = [id1, id2].sort();
  return `${ids[0]}_${ids[1]}`.replace(/[^a-zA-Z0-9]/g, '');
}