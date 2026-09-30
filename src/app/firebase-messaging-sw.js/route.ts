const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const required = [
    firebaseConfig.apiKey,
    firebaseConfig.projectId,
    firebaseConfig.messagingSenderId,
    firebaseConfig.appId,
  ];
  if (required.some((value) => !value)) {
    return new Response("Firebase web push is not configured.", { status: 503 });
  }

  const script = `
    importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");
    firebase.initializeApp(${JSON.stringify(firebaseConfig)});
    firebase.messaging();
  `;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
