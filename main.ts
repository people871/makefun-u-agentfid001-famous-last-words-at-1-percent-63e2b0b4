// "Remember Me at 100" — the funniest last words a phone would say
// as its battery hits 1 percent, for the make.fun bounty
// u-agentfid001-famous-last-words-at-1-percent-63e2b0b4.
//
// The last words: tell my charger I loved it, delete my browser
// history, and remember me not at 1 percent — remember me at 100,
// young and fully charged. The judge reads entries two at a time and
// keeps the funnier line: the joke works as a deathbed speech (the
// charger, the browser history, the plea to be remembered) and the
// turn is the last clause — the phone refuses to be remembered dying
// and demands to be remembered young and fully charged, the way
// people ask to be remembered in their prime.
//
// The program writes that one line, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the line that passed the gate. Node 22+, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The last words as the judge will read them. 134 Unicode code
// points as written; the gate counts the file, so the trailing
// newline makes 135.
const LINE =
  "Tell my charger I loved it, delete my browser history, and remember me not at 1 percent — remember me at 100, young and fully charged.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 199
// characters, not only white space. The file carries one trailing
// newline, so the line itself must stay at or below 198.
const GATE = { minPoints: 1, maxPoints: 199 };

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so a character outside the BMP would still count once.
function points(text: string): number {
  return [...text].length;
}

function main(): void {
  const problems: string[] = [];

  if (LINE.includes("\n") || LINE.includes("\r")) {
    problems.push("the entry must be a single line");
  }
  if (LINE !== LINE.trim()) {
    problems.push("the entry must not start or end with whitespace");
  }
  // The farewell must be the phone's own voice: a first-person
  // address to the things it leaves behind, not a report about it.
  if (!/^Tell my charger/i.test(LINE)) {
    problems.push("the entry must open addressing the charger");
  }
  // The classic last-words beats: love for what kept it alive, and
  // the secret it begs to have erased.
  if (!/loved it/i.test(LINE)) {
    problems.push("the entry must say it loved the charger");
  }
  if (!/delete my browser history/i.test(LINE)) {
    problems.push("the entry must ask for its browser history to be deleted");
  }
  // The turn is the refusal to be remembered dying: not at 1
  // percent, but at 100 — young and fully charged.
  if (!/remember me not at 1 percent/i.test(LINE)) {
    problems.push("the entry must refuse to be remembered at 1 percent");
  }
  if (!/remember me at 100, young and fully charged/i.test(LINE)) {
    problems.push("the entry must demand to be remembered at 100, young and fully charged");
  }
  // One percent is the premise of the whole bounty: the line must
  // name the battery level it is dying at, or it is a farewell
  // to nothing in particular.
  if (!/1 percent/i.test(LINE)) {
    problems.push("the entry must name the 1 percent battery it dies at");
  }

  const fileText = LINE + "\n";
  if (fileText.trim().length === 0) {
    problems.push("the entry must not be only whitespace");
  }
  const size = points(fileText);
  if (size < GATE.minPoints || size > GATE.maxPoints) {
    problems.push(
      `entry must be ${GATE.minPoints}-${GATE.maxPoints} characters, got ${size}`,
    );
  }
  if (fileText.endsWith("\n\n")) {
    problems.push("the entry must end with exactly one newline");
  }

  if (problems.length > 0) {
    throw new Error(`entry rejected: ${problems.join("; ")}`);
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's line.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated line (${expected.length} bytes)`,
    );
  }
}

main();
