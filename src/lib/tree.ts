import type { Member, MemberNode } from '@/lib/types'

/**
 * Builds the org hierarchy from a flat array using `parentId`.
 *
 * A node whose `parentId` points at nothing is promoted to a root rather than
 * dropped — losing a person silently is worse than drawing them in the wrong
 * place, and it makes a bad id obvious the moment the page renders.
 */
export function buildMemberTree(members: readonly Member[]): MemberNode[] {
  const byId = new Map<string, MemberNode>()
  for (const member of members) {
    byId.set(member.id, { ...member, children: [] })
  }

  const roots: MemberNode[] = []
  for (const member of members) {
    const node = byId.get(member.id)
    if (!node) continue

    if (member.parentId === undefined) {
      roots.push(node)
      continue
    }

    const parent = byId.get(member.parentId)
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  return roots
}

/** Depth-first walk, parents before children. */
export function walkTree(
  nodes: readonly MemberNode[],
  visit: (node: MemberNode, depth: number) => void,
  depth = 0,
): void {
  for (const node of nodes) {
    visit(node, depth)
    walkTree(node.children, visit, depth + 1)
  }
}

export function findInTree(nodes: readonly MemberNode[], id: string): MemberNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findInTree(node.children, id)
    if (found) return found
  }
  return null
}

/** Total people under a node, not counting the node itself. */
export function countDescendants(node: MemberNode): number {
  let total = 0
  walkTree(node.children, () => {
    total += 1
  })
  return total
}
