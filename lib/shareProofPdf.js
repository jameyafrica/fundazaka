// Turns the proof-of-income page into a PDF file on the phone and opens the share sheet
// (WhatsApp, email, Save to Files...). Everything happens on the device, so it works offline
// and uses no mobile data.
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { buildProofHtml, proofFileName } from '../utils/incomeProofPdf';

// A4 in points (1pt = 1/72 inch). Without this, iOS defaults to US Letter.
const A4 = { width: 595, height: 842 };

// expo-print saves the PDF under a random name. Copy it to a readable one, because that name is
// what the lender sees in their inbox. If the copy fails for any reason, the random name still works.
function withFriendlyName(uri, fileName) {
  try {
    const target = new File(Paths.cache, fileName);
    if (target.exists) target.delete();
    new File(uri).copy(target);
    return target.uri;
  } catch (e) {
    return uri;
  }
}

export async function shareProofPdf(proof, name = '') {
  const html = buildProofHtml(proof, name);
  if (!html) throw new Error('Nothing to share yet.');

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }

  const { uri } = await Print.printToFileAsync({ html, ...A4 });
  const fileName = proofFileName(name);
  const options = {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Share proof of income',
  };

  // Try the nicely named copy first. If the phone refuses it, share the original file instead,
  // so the user still gets their PDF (just with a random file name).
  const friendlyUri = withFriendlyName(uri, fileName);
  try {
    await Sharing.shareAsync(friendlyUri, options);
    return { uri: friendlyUri, fileName };
  } catch (e) {
    if (friendlyUri === uri) throw e;
    console.warn('Share of renamed PDF failed, using original file:', e);
    await Sharing.shareAsync(uri, options);
    return { uri, fileName: null };
  }
}
