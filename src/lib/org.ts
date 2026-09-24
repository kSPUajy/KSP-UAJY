import { slugify } from '@/lib/format'
import type { MemberNode } from '@/lib/types'

/**
 * View model for `/struktur`, derived entirely from the flat member list:
 * the hierarchy comes from `parentId` (via `buildMemberTree`) and every name,
 * type and grouping below is computed from the members' own fields. Nothing
 * about the club's actual shape is written into a component.
 */

export type OrgNode = Omit<MemberNode, 'children'> & {
  /**
   * The member's entry in the directory listing: `ketua`, `akademik`,
   * `nadia-puspita-ramadhani`. See `entryName`.
   */
  fileName: string
  /** The member's role as a C type name: `Kepala Divisi Akademik` -> `KepalaDivisiAkademik`. */
  typeName: string
  /** Set when the member also teaches, so the panel can link their profile. */
  tentorSlug?: string
  /** Set when the member has won a weekly challenge. */
  hallOfFameSlug?: string
  children: OrgNode[]
}

export function orgTypeName(jabatan: string): string {
  return jabatan
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * A directory is named after the division it heads (`akademik/`), anything
 * else after its role (`sekretaris`) — unless a sibling shares the role, in
 * which case the member's own slug keeps the entries unique, the way two
 * files in one folder cannot share a name.
 */
function entryName(node: MemberNode, parent: MemberNode | null, siblings: readonly MemberNode[]): string {
  if (parent && node.children.length > 0 && node.divisi !== parent.divisi) return node.divisi

  const role = slugify(node.jabatan)
  const shared = siblings.some((sibling) => sibling.id !== node.id && slugify(sibling.jabatan) === role)
  return shared ? node.slug : role
}

type OrgLinks = {
  tentorSlugs: ReadonlySet<string>
  hallOfFameSlugs: ReadonlySet<string>
}

export function buildOrgTree(roots: readonly MemberNode[], links: OrgLinks): OrgNode[] {
  const visit = (
    node: MemberNode,
    parent: MemberNode | null,
    siblings: readonly MemberNode[],
  ): OrgNode => {
    const { children, ...member } = node
    return {
      ...member,
      fileName: entryName(node, parent, siblings),
      typeName: orgTypeName(node.jabatan),
      tentorSlug: links.tentorSlugs.has(node.slug) ? node.slug : undefined,
      hallOfFameSlug: links.hallOfFameSlugs.has(node.slug) ? node.slug : undefined,
      children: children.map((child) => visit(child, node, children)),
    }
  }

  return roots.map((root) => visit(root, null, roots))
}

/** One tentor as the chart lists them: a line, not a card. */
export type OrgBranchItem = {
  id: string
  nama: string
  slug: string
  foto: string
  /** `M03` labels of the modules they hold. */
  modul: string[]
}

/**
 * People who hang off one member without being pengurus themselves — the
 * tentors under the Koordinator Tentor. Drawn as their own column beside the
 * pengurus harian, joined to that member by a single line.
 */
export type OrgBranch = {
  /** The member the branch hangs off. */
  parentId: string
  label: string
  items: OrgBranchItem[]
}

export type OrgEntry = {
  node: OrgNode
  parent: OrgNode | null
}

/** Every member by slug, with a pointer to its parent. */
export function indexOrg(roots: readonly OrgNode[]): Map<string, OrgEntry> {
  const index = new Map<string, OrgEntry>()
  const walk = (nodes: readonly OrgNode[], parent: OrgNode | null): void => {
    for (const node of nodes) {
      index.set(node.slug, { node, parent })
      walk(node.children, node)
    }
  }
  walk(roots, null)
  return index
}

/** `tree`'s closing line: directories are members with reports, files the rest. */
export function countEntries(roots: readonly OrgNode[]): { directories: number; files: number } {
  let directories = 0
  let files = 0
  const walk = (nodes: readonly OrgNode[]): void => {
    for (const node of nodes) {
      if (node.children.length > 0) directories += 1
      else files += 1
      walk(node.children)
    }
  }
  walk(roots)
  return { directories, files }
}

export type OrgChartItem = {
  node: OrgNode
  /** 0 for the group's top row; each level below indents one step. */
  depth: number
}

export type OrgChartGroup = {
  key: string
  label: string
  /** False when the card itself already says it (a column of one, named by its role). */
  showLabel?: boolean
  items: OrgChartItem[]
}

/**
 * Columns for the classic chart. The root's reports that share its division
 * are its staff and stack together in one column; every report that heads a
 * division of its own gets a column, with its people stacked beneath it.
 */
export function chartGroups(root: OrgNode): OrgChartGroup[] {
  const flatten = (node: OrgNode, depth: number): OrgChartItem[] => [
    { node, depth },
    ...node.children.flatMap((child) => flatten(child, depth + 1)),
  ]

  const staff = root.children.filter((child) => child.divisi === root.divisi)
  const heads = root.children.filter((child) => child.divisi !== root.divisi)

  // No divisions and nobody under the staff: a flat team. Each person gets a
  // column of their own, so they sit in one row under the root instead of a
  // single tall stack.
  if (heads.length === 0 && staff.every((member) => member.children.length === 0)) {
    return staff.map((member) => ({
      key: member.id,
      label: member.jabatan.toLowerCase(),
      showLabel: false,
      items: [{ node: member, depth: 0 }],
    }))
  }

  const groups: OrgChartGroup[] = []
  if (staff.length > 0) {
    groups.push({
      key: `staf-${root.divisi}`,
      label: root.divisi === 'inti' ? 'pengurus harian' : `pengurus ${root.divisi}`,
      items: staff.flatMap((member) => flatten(member, 0)),
    })
  }
  // A division column is labelled with the bare division name: the bus drops
  // into the middle of the column, and a longer label would run under it.
  for (const head of heads) {
    groups.push({ key: head.id, label: head.divisi, items: flatten(head, 0) })
  }
  return groups
}
