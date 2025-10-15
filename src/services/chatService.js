import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';

// ===== REAL-TIME USER PRESENCE =====

export const updateUserPresence = async (userId, status = 'online') => {
  try {
    console.log('🔄 Updating user presence:', { userId, status });
    const userRef = doc(db, 'users', userId);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.warn('⚠️  User document does not exist:', userId);
      return false;
    }
    
    await updateDoc(userRef, {
      status,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ User presence updated successfully:', { userId, status });
    return true;
  } catch (error) {
    console.error('❌ Error updating user presence:', error);
    console.error('   User ID:', userId);
    console.error('   Status:', status);
    throw error;
  }
};

// Update user status manually (from profile)
export const updateUserStatus = async (userId, customStatus, statusMessage = '') => {
  try {
    console.log('🎯 Updating user custom status:', { userId, customStatus, statusMessage });
    const userRef = doc(db, 'users', userId);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.warn('⚠️  User document does not exist:', userId);
      return false;
    }
    
    const updateData = {
      status: customStatus, // Update the main status field
      customStatus, // Keep track of manually set status
      statusMessage: statusMessage || '',
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    console.log('✅ User custom status updated successfully:', { userId, customStatus });
    return true;
  } catch (error) {
    console.error('❌ Error updating user custom status:', error);
    console.error('   User ID:', userId);
    console.error('   Status:', customStatus);
    throw error;
  }
};

// Debug function to get ALL users regardless of status
export const getAllUsersDebug = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('🔍 ALL USERS IN DATABASE:', allUsers.length);
    allUsers.forEach(u => {
      console.log(`  📋 ID: ${u.id}`);
      console.log(`     Name: ${u.displayName || 'N/A'}`);
      console.log(`     Email: ${u.email || 'N/A'}`);
      console.log(`     Status: ${u.status || 'NOT SET'}`);
      console.log(`     LastSeen: ${u.lastSeen ? new Date(u.lastSeen.seconds * 1000).toLocaleString() : 'N/A'}`);
      console.log(`  ---`);
    });
    return allUsers;
  } catch (error) {
    console.error('❌ Error fetching all users:', error);
    return [];
  }
};

// Admin function to manually set any user's status
export const adminSetUserStatus = async (userId, status) => {
  try {
    console.log(`🔧 ADMIN: Setting user ${userId} status to ${status}`);
    const userRef = doc(db, 'users', userId);
    
    // Check if user exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error('❌ User not found:', userId);
      return false;
    }
    
    await updateDoc(userRef, {
      status: status,
      lastSeen: serverTimestamp()
    });
    
    console.log(`✅ ADMIN: User status updated successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error setting user status:', error);
    return false;
  }
};

export const subscribeToOnlineUsers = (callback) => {
  const q = query(
    collection(db, 'users'),
    where('status', 'in', ['online', 'away']),
    orderBy('lastSeen', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('📊 Online users fetched:', users.length, 'users');
    console.log('👥 Detailed Users:');
    users.forEach(u => {
      console.log(`  - ID: ${u.id}, Name: ${u.displayName}, Status: ${u.status}, Email: ${u.email}`);
    });
    callback(users);
  }, (error) => {
    console.error('❌ Error in subscribeToOnlineUsers:', error);
    callback([]);
  });
};

export const getOnlineUsers = async (excludeUserId = null) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('status', 'in', ['online', 'away']),
      orderBy('lastSeen', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return excludeUserId ? users.filter(user => user.id !== excludeUserId) : users;
  } catch (error) {
    console.error('Error getting online users:', error);
    throw error;
  }
};

// ===== CONNECTION REQUESTS =====

export const sendConnectionRequest = async (fromUserId, toUserId, message = '') => {
  try {
    const requestData = {
      fromUserId,
      toUserId,
      message,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'connection_requests'), requestData);
    
    // Create notification for recipient
    await addDoc(collection(db, 'notifications'), {
      userId: toUserId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: 'Someone wants to connect with you',
      data: { requestId: docRef.id, fromUserId },
      read: false,
      createdAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...requestData };
  } catch (error) {
    console.error('Error sending connection request:', error);
    throw error;
  }
};

export const respondToConnectionRequest = async (requestId, response, userId) => {
  try {
    const requestRef = doc(db, 'connection_requests', requestId);
    await updateDoc(requestRef, {
      status: response, // 'accepted' or 'rejected'
      respondedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    if (response === 'accepted') {
      // Get request details
      const requestDoc = await getDoc(requestRef);
      const requestData = requestDoc.data();
      
      // Create mutual connections
      await Promise.all([
        addDoc(collection(db, 'connections'), {
          userId1: requestData.fromUserId,
          userId2: requestData.toUserId,
          status: 'active',
          createdAt: serverTimestamp()
        }),
        addDoc(collection(db, 'connections'), {
          userId1: requestData.toUserId,
          userId2: requestData.fromUserId,
          status: 'active',
          createdAt: serverTimestamp()
        })
      ]);
      
      // Notify requester
      await addDoc(collection(db, 'notifications'), {
        userId: requestData.fromUserId,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: 'Your connection request was accepted',
        data: { connectedUserId: userId },
        read: false,
        createdAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error responding to connection request:', error);
    throw error;
  }
};

export const getConnectionRequests = async (userId, type = 'received') => {
  try {
    const field = type === 'received' ? 'toUserId' : 'fromUserId';
    const q = query(
      collection(db, 'connection_requests'),
      where(field, '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const requests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const requestData = { id: docSnap.id, ...docSnap.data() };
        
        // Get user details
        const userField = type === 'received' ? 'fromUserId' : 'toUserId';
        const userDoc = await getDoc(doc(db, 'users', requestData[userField]));
        requestData.userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
        
        return requestData;
      })
    );
    
    return requests;
  } catch (error) {
    console.error('Error getting connection requests:', error);
    throw error;
  }
};

// ===== CONNECTIONS =====

export const getUserConnections = async (userId) => {
  try {
    const q = query(
      collection(db, 'connections'),
      where('userId1', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const connections = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const connectionData = { id: docSnap.id, ...docSnap.data() };
        
        // Get connected user details
        const userDoc = await getDoc(doc(db, 'users', connectionData.userId2));
        connectionData.userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
        
        return connectionData;
      })
    );
    
    return connections;
  } catch (error) {
    console.error('Error getting user connections:', error);
    throw error;
  }
};

export const removeConnection = async (userId1, userId2) => {
  try {
    // Remove both directional connections
    const q1 = query(
      collection(db, 'connections'),
      where('userId1', '==', userId1),
      where('userId2', '==', userId2),
      where('status', '==', 'active')
    );
    
    const q2 = query(
      collection(db, 'connections'),
      where('userId1', '==', userId2),
      where('userId2', '==', userId1),
      where('status', '==', 'active')
    );
    
    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const deletePromises = [];
    snapshot1.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));
    snapshot2.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error removing connection:', error);
    throw error;
  }
};

export const checkConnectionStatus = async (userId1, userId2) => {
  try {
    const q = query(
      collection(db, 'connections'),
      where('userId1', '==', userId1),
      where('userId2', '==', userId2),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error('Error checking connection status:', error);
    return false;
  }
};

// ===== REAL-TIME CHAT =====

export const createChatRoom = async (participants, type = 'direct') => {
  try {
    const chatRoomData = {
      participants,
      type, // 'direct' or 'group'
      lastMessage: null,
      lastMessageTime: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'chat_rooms'), chatRoomData);
    return { id: docRef.id, ...chatRoomData };
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

export const getChatRoom = async (userId1, userId2) => {
  try {
    // Check if chat room already exists
    const q = query(
      collection(db, 'chat_rooms'),
      where('participants', 'array-contains-any', [userId1, userId2]),
      where('type', '==', 'direct')
    );
    
    const snapshot = await getDocs(q);
    let chatRoom = null;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(userId1) && data.participants.includes(userId2)) {
        chatRoom = { id: doc.id, ...data };
      }
    });
    
    // Create new chat room if doesn't exist
    if (!chatRoom) {
      chatRoom = await createChatRoom([userId1, userId2]);
    }
    
    return chatRoom;
  } catch (error) {
    console.error('Error getting chat room:', error);
    throw error;
  }
};

export const sendMessage = async (chatRoomId, senderId, message, type = 'text') => {
  try {
    const messageData = {
      chatRoomId,
      senderId,
      message,
      type, // 'text', 'image', 'file'
      createdAt: serverTimestamp(),
      read: false
    };
    
    // Add message to messages collection
    const docRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update chat room with last message
    const chatRoomRef = doc(db, 'chat_rooms', chatRoomId);
    await updateDoc(chatRoomRef, {
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...messageData };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const subscribeToMessages = (chatRoomId, callback) => {
  const q = query(
    collection(db, 'messages'),
    where('chatRoomId', '==', chatRoomId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

export const getUserChatRooms = async (userId) => {
  try {
    const q = query(
      collection(db, 'chat_rooms'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const chatRooms = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const chatRoomData = { id: docSnap.id, ...docSnap.data() };
        
        // Get other participant details for direct chats
        if (chatRoomData.type === 'direct') {
          const otherUserId = chatRoomData.participants.find(id => id !== userId);
          if (otherUserId) {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            chatRoomData.otherUser = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
          }
        }
        
        return chatRoomData;
      })
    );
    
    return chatRooms;
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatRoomId, userId) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', chatRoomId),
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// ===== TYPING INDICATORS =====

export const setTyping = async (chatRoomId, userId, isTyping) => {
  try {
    const typingRef = doc(db, 'typing_indicators', `${chatRoomId}_${userId}`);
    
    if (isTyping) {
      await updateDoc(typingRef, {
        chatRoomId,
        userId,
        isTyping: true,
        timestamp: serverTimestamp()
      }).catch(() => {
        // Document doesn't exist, create it
        return addDoc(collection(db, 'typing_indicators'), {
          chatRoomId,
          userId,
          isTyping: true,
          timestamp: serverTimestamp()
        });
      });
    } else {
      await deleteDoc(typingRef).catch(() => {
        // Document doesn't exist, ignore
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error setting typing indicator:', error);
    throw error;
  }
};

export const subscribeToTypingIndicators = (chatRoomId, userId, callback) => {
  const q = query(
    collection(db, 'typing_indicators'),
    where('chatRoomId', '==', chatRoomId),
    where('userId', '!=', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const typingUsers = snapshot.docs.map(doc => doc.data());
    callback(typingUsers);
  });
};