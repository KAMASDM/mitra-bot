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
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Professional category definitions
export const PROFESSIONAL_CATEGORIES = {
  mental: {
    id: 'mental',
    typeId: '1',
    name: 'Mental Health',
    icon: '🧠',
    description: 'Counselors, Therapists, Psychologists',
    color: 'from-purple-500 to-pink-500'
  },
  legal: {
    id: 'legal',
    typeId: '2',
    name: 'Legal Services',
    icon: '⚖️',
    description: 'Lawyers, Legal Advisors',
    color: 'from-blue-500 to-indigo-500'
  },
  mbbs: {
    id: 'mbbs',
    typeId: '3',
    name: 'Medical Doctors',
    icon: '👨‍⚕️',
    description: 'General Physicians, Surgeons',
    color: 'from-green-500 to-teal-500'
  },
  placement: {
    id: 'placement',
    typeId: '4',
    name: 'HR & Career',
    icon: '💼',
    description: 'HR Professionals, Career Counselors',
    color: 'from-orange-500 to-red-500'
  },
  pathology: {
    id: 'pathology',
    typeId: '5',
    name: 'Pathology Labs',
    icon: '🔬',
    description: 'Diagnostic Centers, Lab Services',
    color: 'from-cyan-500 to-blue-500'
  },
  pharmacy: {
    id: 'pharmacy',
    typeId: '6',
    name: 'Pharmacies',
    icon: '💊',
    description: 'Medicine Stores, Pharmacists',
    color: 'from-pink-500 to-rose-500'
  }
};

// ===== PROFESSIONAL ONLINE STATUS =====

/**
 * Get online professionals grouped by category
 * Returns: { mental: [...], legal: [...], ... }
 */
export const getOnlineProfessionalsByCategory = async () => {
  try {
    // Get all online professionals
    const professionalsQuery = query(
      collection(db, 'professionals'),
      limit(100)
    );
    
    const professionalsSnapshot = await getDocs(professionalsQuery);
    const allProfessionals = professionalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get online status from users collection
    const usersQuery = query(
      collection(db, 'users'),
      where('status', 'in', ['online', 'away'])
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const onlineUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));

    // Filter professionals who are online and group by category
    const categorized = {};
    
    Object.keys(PROFESSIONAL_CATEGORIES).forEach(categoryKey => {
      categorized[categoryKey] = [];
    });

    allProfessionals.forEach(professional => {
      if (onlineUserIds.has(professional.id)) {
        const typeId = String(professional.professional_type_id);
        
        // Find category by typeId
        const categoryKey = Object.keys(PROFESSIONAL_CATEGORIES).find(
          key => PROFESSIONAL_CATEGORIES[key].typeId === typeId
        );
        
        if (categoryKey && categorized[categoryKey]) {
          // Get user status
          const userDoc = usersSnapshot.docs.find(doc => doc.id === professional.id);
          const userData = userDoc ? userDoc.data() : {};
          
          categorized[categoryKey].push({
            ...professional,
            status: userData.status || 'online',
            lastSeen: userData.lastSeen,
            displayName: userData.displayName || `${professional.first_name || ''} ${professional.last_name || ''}`.trim()
          });
        }
      }
    });

    console.log('📊 Online professionals by category:', 
      Object.entries(categorized).map(([cat, profs]) => `${cat}: ${profs.length}`).join(', ')
    );

    return categorized;
  } catch (error) {
    console.error('Error getting online professionals by category:', error);
    throw error;
  }
};

/**
 * Subscribe to online professionals in a specific category
 */
export const subscribeToOnlineProfessionals = (categoryId, callback) => {
  const category = PROFESSIONAL_CATEGORIES[categoryId];
  if (!category) {
    console.error('Invalid category:', categoryId);
    return () => {};
  }

  const typeId = category.typeId;
  
  // Query professionals of this type
  const professionalsQuery = query(
    collection(db, 'professionals'),
    where('professional_type_id', 'in', [typeId, Number(typeId)])
  );

  // Get their online status
  const unsubscribeProfessionals = onSnapshot(professionalsQuery, async (profSnapshot) => {
    const professionals = profSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get online users
    const usersQuery = query(
      collection(db, 'users'),
      where('status', 'in', ['online', 'away'])
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const onlineUsers = {};
    usersSnapshot.docs.forEach(doc => {
      onlineUsers[doc.id] = doc.data();
    });

    // Filter and enrich with online status
    const onlineProfessionals = professionals
      .filter(prof => onlineUsers[prof.id])
      .map(prof => ({
        ...prof,
        status: onlineUsers[prof.id].status,
        lastSeen: onlineUsers[prof.id].lastSeen,
        displayName: onlineUsers[prof.id].displayName || 
          `${prof.first_name || ''} ${prof.last_name || ''}`.trim()
      }));

    callback(onlineProfessionals);
  });

  return unsubscribeProfessionals;
};

/**
 * Get count of online professionals for each category
 * Returns: { mental: 5, legal: 3, mbbs: 8, ... }
 */
export const getOnlineProfessionalCounts = async () => {
  try {
    const categorized = await getOnlineProfessionalsByCategory();
    const counts = {};
    
    Object.keys(categorized).forEach(categoryKey => {
      counts[categoryKey] = categorized[categoryKey].length;
    });

    return counts;
  } catch (error) {
    console.error('Error getting professional counts:', error);
    return {};
  }
};

// ===== CHAT REQUESTS =====

/**
 * Send a chat request from user to professional
 */
export const sendChatRequest = async (fromUserId, toProfessionalId, message = '') => {
  try {
    // Check if request already exists
    const existingRequestQuery = query(
      collection(db, 'chat_requests'),
      where('fromUserId', '==', fromUserId),
      where('toProfessionalId', '==', toProfessionalId),
      where('status', 'in', ['pending', 'accepted'])
    );
    
    const existingSnapshot = await getDocs(existingRequestQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error('Chat request already exists');
    }

    const requestData = {
      fromUserId,
      toProfessionalId,
      message,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'chat_requests'), requestData);
    
    // Create notification for professional
    await addDoc(collection(db, 'notifications'), {
      userId: toProfessionalId,
      type: 'chat_request',
      title: 'New Chat Request',
      message: message || 'Someone wants to chat with you',
      data: { 
        requestId: docRef.id, 
        fromUserId,
        type: 'chat_request'
      },
      read: false,
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Chat request sent:', docRef.id);
    return { id: docRef.id, ...requestData };
  } catch (error) {
    console.error('Error sending chat request:', error);
    throw error;
  }
};

/**
 * Respond to a chat request (accept/reject)
 */
export const respondToChatRequest = async (requestId, response, professionalId) => {
  try {
    const requestRef = doc(db, 'chat_requests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Chat request not found');
    }
    
    const requestData = requestDoc.data();
    
    await updateDoc(requestRef, {
      status: response, // 'accepted' or 'rejected'
      respondedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    if (response === 'accepted') {
      // Create a chat room
      const chatRoomData = {
        participants: [requestData.fromUserId, requestData.toProfessionalId],
        userId: requestData.fromUserId,
        professionalId: requestData.toProfessionalId,
        status: 'active',
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageAt: null,
        unreadCount: {
          [requestData.fromUserId]: 0,
          [requestData.toProfessionalId]: 0
        }
      };
      
      const chatRoomRef = await addDoc(collection(db, 'chat_rooms'), chatRoomData);
      
      // Update request with chat room ID
      await updateDoc(requestRef, {
        chatRoomId: chatRoomRef.id
      });
      
      // Notify user that request was accepted
      await addDoc(collection(db, 'notifications'), {
        userId: requestData.fromUserId,
        type: 'chat_request_accepted',
        title: 'Chat Request Accepted',
        message: 'A professional accepted your chat request',
        data: { 
          requestId, 
          chatRoomId: chatRoomRef.id,
          professionalId: requestData.toProfessionalId
        },
        read: false,
        createdAt: serverTimestamp()
      });
      
      console.log('✅ Chat room created:', chatRoomRef.id);
      return { chatRoomId: chatRoomRef.id };
    } else {
      // Notify user that request was rejected
      await addDoc(collection(db, 'notifications'), {
        userId: requestData.fromUserId,
        type: 'chat_request_rejected',
        title: 'Chat Request Declined',
        message: 'A professional declined your chat request',
        data: { requestId },
        read: false,
        createdAt: serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error responding to chat request:', error);
    throw error;
  }
};

/**
 * Get pending chat requests for a professional
 */
export const getPendingChatRequests = async (professionalId) => {
  try {
    const q = query(
      collection(db, 'chat_requests'),
      where('toProfessionalId', '==', professionalId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const requests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const requestData = { id: docSnap.id, ...docSnap.data() };
        
        // Get user details
        const userDoc = await getDoc(doc(db, 'users', requestData.fromUserId));
        requestData.userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
        
        return requestData;
      })
    );
    
    return requests;
  } catch (error) {
    console.error('Error getting pending chat requests:', error);
    throw error;
  }
};

/**
 * Get user's active chat rooms
 */
export const getUserChatRooms = async (userId, userIsProfessional = false) => {
  try {
    const field = userIsProfessional ? 'professionalId' : 'userId';
    
    const q = query(
      collection(db, 'chat_rooms'),
      where(field, '==', userId),
      where('status', '==', 'active'),
      orderBy('lastMessageAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const chatRooms = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const chatData = { id: docSnap.id, ...docSnap.data() };
        
        // Get other participant's details
        const otherUserId = userIsProfessional ? chatData.userId : chatData.professionalId;
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        
        if (otherUserDoc.exists()) {
          chatData.otherUser = { id: otherUserDoc.id, ...otherUserDoc.data() };
          
          // If other user is professional, get professional details
          if (!userIsProfessional) {
            const professionalDoc = await getDoc(doc(db, 'professionals', otherUserId));
            if (professionalDoc.exists()) {
              chatData.professionalData = professionalDoc.data();
            }
          }
        }
        
        return chatData;
      })
    );
    
    return chatRooms;
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    throw error;
  }
};

/**
 * Send a message in a chat room
 */
export const sendChatMessage = async (chatRoomId, senderId, messageText) => {
  try {
    const chatRoomRef = doc(db, 'chat_rooms', chatRoomId);
    const chatRoomDoc = await getDoc(chatRoomRef);
    
    if (!chatRoomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const chatRoomData = chatRoomDoc.data();
    
    // Create message
    const messageData = {
      chatRoomId,
      senderId,
      message: messageText,
      read: false,
      createdAt: serverTimestamp()
    };
    
    const messageRef = await addDoc(
      collection(db, 'chat_rooms', chatRoomId, 'messages'),
      messageData
    );
    
    // Update chat room with last message
    const otherUserId = chatRoomData.participants.find(id => id !== senderId);
    const newUnreadCount = { ...chatRoomData.unreadCount };
    newUnreadCount[otherUserId] = (newUnreadCount[otherUserId] || 0) + 1;
    
    await updateDoc(chatRoomRef, {
      lastMessage: messageText,
      lastMessageAt: serverTimestamp(),
      unreadCount: newUnreadCount
    });
    
    return { id: messageRef.id, ...messageData };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Subscribe to messages in a chat room
 */
export const subscribeToChatMessages = (chatRoomId, callback) => {
  const messagesQuery = query(
    collection(db, 'chat_rooms', chatRoomId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

/**
 * Mark messages as read
 */
export const markChatMessagesAsRead = async (chatRoomId, userId) => {
  try {
    const chatRoomRef = doc(db, 'chat_rooms', chatRoomId);
    const chatRoomDoc = await getDoc(chatRoomRef);
    
    if (!chatRoomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const chatRoomData = chatRoomDoc.data();
    const newUnreadCount = { ...chatRoomData.unreadCount };
    newUnreadCount[userId] = 0;
    
    await updateDoc(chatRoomRef, {
      unreadCount: newUnreadCount
    });
    
    // Mark all unread messages as read
    const messagesQuery = query(
      collection(db, 'chat_rooms', chatRoomId, 'messages'),
      where('read', '==', false),
      where('senderId', '!=', userId)
    );
    
    const snapshot = await getDocs(messagesQuery);
    const updatePromises = snapshot.docs.map(docSnap => 
      updateDoc(doc(db, 'chat_rooms', chatRoomId, 'messages', docSnap.id), {
        read: true,
        readAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

/**
 * Subscribe to pending chat requests
 */
export const subscribeToPendingRequests = (professionalId, callback) => {
  const q = query(
    collection(db, 'chat_requests'),
    where('toProfessionalId', '==', professionalId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const requests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const requestData = { id: docSnap.id, ...docSnap.data() };
        
        // Get user details
        const userDoc = await getDoc(doc(db, 'users', requestData.fromUserId));
        requestData.userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
        
        return requestData;
      })
    );
    
    callback(requests);
  });
};
