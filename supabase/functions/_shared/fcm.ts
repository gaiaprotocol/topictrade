import { JWT } from "npm:google-auth-library@9";
import serviceAccount from "./firebase-adminsdk-key.json" assert {
  type: "json",
};
import { isDevMode } from "./supabase.ts";

const getAccessToken = (
  { clientEmail, privateKey }: { clientEmail: string; privateKey: string },
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens!.access_token!);
    });
  });
};

export async function sendFcmToSpecificUser(token: string, message: {
  title: string;
  content: string;
  icon?: string;
}) {
  const accessToken = await getAccessToken({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  });

  if (isDevMode) console.log("accessToken", accessToken);

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title: message.title,
            body: message.content,
          },
          webpush: message.icon
            ? { notification: { icon: message.icon } }
            : undefined,
        },
      }),
    },
  );

  const resData = await res.json();
  if (isDevMode) console.log("resData", resData);
  if (res.status < 200 || 299 < res.status) {
    throw resData;
  }
  return resData;
}

export async function subscribeFcmTopic(token: string, topic: string) {
  const accessToken = await getAccessToken({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  });

  if (isDevMode) console.log("accessToken", accessToken);

  const res = await fetch(
    `https://iid.googleapis.com/v1/web/iid/${token}/rel/topics/${topic}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const resData = await res.json();
  if (isDevMode) console.log("resData", resData);
  if (res.status < 200 || 299 < res.status) {
    throw resData;
  }
  return resData;
}

export async function sendFcmToTopic(topic: string, message: {
  title: string;
  content: string;
  icon?: string;
}) {
  const accessToken = await getAccessToken({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  });

  if (isDevMode) console.log("accessToken", accessToken);

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          topic,
          notification: {
            title: message.title,
            body: message.content,
          },
          webpush: message.icon
            ? { notification: { icon: message.icon } }
            : undefined,
        },
      }),
    },
  );

  const resData = await res.json();
  if (isDevMode) console.log("resData", resData);
  if (res.status < 200 || 299 < res.status) {
    throw resData;
  }
  return resData;
}
