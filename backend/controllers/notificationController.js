const { db, messaging } = require('../utils/firebaseAdmin');

exports.sendNotification = async (req, res) => {
  const { fcmToken, title, body, data, isBroadcast } = req.body;

  if ((!fcmToken && !isBroadcast) || !title || !body) {
    return res.status(400).json({
      error:
        'Missing required fields: fcmToken, title, body (or set isBroadcast: true)',
    });
  }

  try {
    let tokensToNotify = [];

    if (isBroadcast) {
      const usersSnapshot = await db.collection('users').get();
      usersSnapshot.forEach(doc => {
        if (doc.id === 'E8aGjE9fKkRJzxJvsiCtZ4QYZon2') return;

        const token = doc.data().fcmToken;
        if (token) {
          tokensToNotify.push(token);
        }
      });

      if (tokensToNotify.length === 0) {
        return res
          .status(404)
          .json({ error: 'No user tokens found in database' });
      }
    } else {
      tokensToNotify = Array.isArray(fcmToken) ? fcmToken : [fcmToken];
    }

    const message = {
      tokens: tokensToNotify,
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high',
        notification: { channelId: 'default', sound: 'default' },
      },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    };

    const response = await messaging.sendEachForMulticast(message);

    return res.status(200).json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
};
