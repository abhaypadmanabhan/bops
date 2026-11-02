/**
 * What a bot's words and steps say to someone who isn't a developer: no citation markers, no shell lines, no
 * click coordinates. The raw detail stays one tap away (a thread's open steps); these are the labels.
 */

/**
 * A model's citation markers ("citeturn0search3": private-use characters around what it cites) and
 * the space before each: they're for the model, never for people.
 */
export const dropCitations = (text: string) => text.replace(/\s?[^]*/g, "");

/** A link to a page on the computer it runs on (localhost, 127.0.0.1): it opens there and nowhere else. */
export const isLocalLink = (href: string) => /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:[/?#]|$)/i.test(href);

/** What a bot's localhost link says in a workspace shared with the user, in place of opening: where it opens. */
export const localOnlyLine = (botName?: string) => `opens only on ${botName ? `${botName}'s` : "the bot's"} computer`;

/**
 * A thread's title as the window shows it (the stored title stays as the bot wrote it): an app's copy running on
 * the bot's computer ("Run Four Corners Local", "Show Four Corners locally") and a localhost address said as where
 * they are, its computer.
 */
export function plainTitle(title: string): string {
  return title
    .replace(/\s+(?:local|locally|on localhost(?::\d+)?)$/i, " on its computer")
    .replace(/(?:https?:\/\/)?\b(?:localhost|127\.0\.0\.1)(?::\d+)?(?![\w:-]|\.[\w-])(?:[/?#](?:[^\s]*[^\s.,;:!?])?)?/gi, "its computer");
}

/** A step's detail, as a person would say it. */
export function plainStep(detail: string): string {
  const d = detail.trim();
  if (/^clicked\s*\(\d+,\s*\d+\)/i.test(d)) return "Clicked on the screen";
  if (/^(typed|type)\b/i.test(d)) return "Typed on the screen";
  if (/^scrolled\b/i.test(d)) return "Scrolled the page";
  const read = /^(read|opened|visited)\s+(https?:\/\/\S+)/i.exec(d);
  if (read) {
    try {
      return `Read ${new URL(read[2]).hostname.replace(/^www\./, "")}`;
    } catch {}
  }
  if (/^ran\b/i.test(d)) {
    if (/urllib|requests|curl|wget|fetch\(/.test(d)) return "Looked things up online";
    if (/pdftoppm|pdfinfo|poppler|\.pdf\b/i.test(d)) return "Checked the PDF";
    if (/\b(?:npm|pnpm|yarn) (?:ci|install|i|add)\b|\bplaywright install\b|\b(?:apt-get|apt|brew|pip3?) install\b/.test(d)) return "Set up the app";
    if (/\bgit (?:log|show|diff|blame)\b/.test(d)) return "Looked at the code history";
    if (/pathlib|open\(|json|\bcat\b|\bls\b|\bcp\b|\bmv\b/.test(d)) return "Worked on the files";
    return "Ran a command";
  }
  return d;
}
