// Securely delivers the product file ONLY after verifying the Stripe payment is paid.
// The file is embedded here (base64) and is NOT publicly downloadable — it is served
// only by this function after a valid, paid session_id is confirmed with Stripe.
// (For the real product later we'll swap this for the real PDF / cloud storage.)
const Stripe = require("stripe");

// Test placeholder PDF (tiny sample). Replace with the real bundle before going live.
const FILE_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiA+PiA+PiAvQ29udGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iago1IDAgb2JqCjw8IC9MZW5ndGggMzc5ID4+CnN0cmVhbQpCVAovRjEgMjYgVGYKMSAwIDAgMSA3MiA3MjAgVG0KKEtpZHMgU21hcnQgQnVuZGxlIC0gU0FNUExFKSBUagovRjEgMTQgVGYKMSAwIDAgMSA3MiA2ODAgVG0KKEVkdWNhdGlvbmFsIGFjdGl2aXRpZXMgdGhhdCBoZWxwIHlvdW5nIG1pbmRzIGdyb3cuKSBUagovRjEgMTQgVGYKMSAwIDAgMSA3MiA2NTAgVG0KKFplc3RhdyBlZHVrYWN5am55IGRsYSBkemllY2kgLSBQUk9CS0EuKSBUagovRjEgMTIgVGYKMSAwIDAgMSA3MiA2MDAgVG0KKFRoaXMgaXMgYSBURVNUIGZpbGUgZm9yIHNldHRpbmcgdXAgeW91ciBzdG9yZS4pIFRqCi9GMSAxMiBUZgoxIDAgMCAxIDcyIDU4MCBUbQooUmVwbGFjZSBpdCBsYXRlciB3aXRoIHlvdXIgcmVhbCBidW5kbGUuIDpcKSkgVGoKRVQKCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDAzMTEgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo3NDEKJSVFT0Y=";

exports.handler = async (event) => {
  const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
  if (!sessionId) return { statusCode: 400, body: "Missing session_id" };

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { statusCode: 500, body: "Stripe key not set" };

  const stripe = Stripe(secret);
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return { statusCode: 402, body: "Payment not completed for this order." };
    }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Santas-Magical-Mission.pdf"',
      },
      body: FILE_BASE64,
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 500, body: "Error: " + e.message };
  }
};
