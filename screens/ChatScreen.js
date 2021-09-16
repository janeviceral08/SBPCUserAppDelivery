import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

export function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState([]);

  async function handleSend(messages) {
    const userId= await AsyncStorage.getItem('uid');
    const text = messages[0].text
     firestore()
    .collection('chat')
    .doc(userId)
    .collection('message')
    .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          _id: userId,
          displayName: "cyzoox"
        }
      })
    // ...
  }

  useEffect(() => {
    async function anyNameFunction() {
        const userId= await AsyncStorage.getItem('uid');
        const unsubscribeListener =  firestore()
      .collection('chat')
      .doc(userId)
      .collection('message')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const messages = querySnapshot.docs.map(doc => {
          const firebaseData = doc.data()
  
          const data = {
            _id: doc.id,
            text: '',
            createdAt: new Date().getTime(),
            ...firebaseData
          } 
          return data
        })
        console.log(messages)
        setMessages(messages)
        setToken(userId)
      })
  
    return () => unsubscribeListener()
      }
      // Execute the created function directly
      anyNameFunction();
  }, [])



  return (
    <GiftedChat
    messages={messages}
    onSend={newMessage => handleSend(newMessage)}
    user={{
      _id: token
    }}
  />
  )
}

export default ChatScreen;