/**
 * Data test: every prepared prospect must produce a playbook you can't get
 * stuck in. Run with `npx tsx scripts/validate-playbooks.ts` (or the build,
 * which imports nothing from here).
 */
import { FILE_PROSPECTS } from "../data/prospects";
import { buildPlaybook, findBrokenLinks, OUTCOME_NODE_ID } from "../lib/playbook";
import type { Prospect } from "../lib/types";

let failures = 0;

for (const prospect of FILE_PROSPECTS as Prospect[]) {
  const playbook = buildPlaybook(prospect);
  const broken = findBrokenLinks(playbook);
  const nodeCount = Object.keys(playbook.nodes).length;

  // Every node must be able to reach the outcome screen.
  const unreachable: string[] = [];
  for (const start of Object.keys(playbook.nodes)) {
    const seen = new Set<string>();
    const queue = [start];
    let reaches = false;
    while (queue.length > 0) {
      const id = queue.shift() as string;
      if (id === OUTCOME_NODE_ID) {
        reaches = true;
        break;
      }
      if (seen.has(id)) continue;
      seen.add(id);
      for (const option of playbook.nodes[id]?.possibleResponses ?? []) {
        queue.push(option.nextNodeId);
      }
    }
    if (!reaches) unreachable.push(start);
  }

  // And every node must be reachable from the opening.
  const reachable = new Set<string>();
  const queue = [playbook.rootId];
  while (queue.length > 0) {
    const id = queue.shift() as string;
    if (id === OUTCOME_NODE_ID || reachable.has(id)) continue;
    reachable.add(id);
    for (const option of playbook.nodes[id]?.possibleResponses ?? []) {
      queue.push(option.nextNodeId);
    }
  }
  const orphans = Object.keys(playbook.nodes).filter((id) => !reachable.has(id));

  const ok = broken.length === 0 && unreachable.length === 0 && orphans.length === 0;
  if (!ok) failures += 1;

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${prospect.companyName}  (${nodeCount} nodes, ${playbook.discovery.length} discovery questions)`,
  );
  if (broken.length > 0) console.log("   broken links:", broken);
  if (unreachable.length > 0) console.log("   cannot reach the outcome:", unreachable);
  if (orphans.length > 0) console.log("   unreachable from the opening:", orphans);
}

if (failures > 0) {
  console.error(`\n${failures} prospect(s) failed validation.`);
  process.exit(1);
}
console.log("\nAll playbooks valid.");
