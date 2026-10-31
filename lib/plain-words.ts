/**
 * What a bot's words and steps say to someone who isn't a developer: no citation markers, no shell lines, no
 * click coordinates. The raw detail stays one tap away (a thread's open steps); these are the labels.
 */

/**
 * A model's citation markers ("citeturn0search3": private-use characters around what it cites) and
 * the space before each: they're for the model, never for people.
 */
export const dropCitations = (text: string) => text.replace(/\s?[^]*/g, "");

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
    if (/\bnpm\b|\bnpx\b|\bpnpm\b|\byarn\b|apt-get|pip install/.test(d)) return "Set up the app";
    if (/\bgit\b/.test(d)) return "Looked at the code history";
    if (/pathlib|open\(|json|\bcat\b|\bls\b|\bcp\b|\bmv\b/.test(d)) return "Worked on the files";
    return "Ran a command";
  }
  return d;
}
