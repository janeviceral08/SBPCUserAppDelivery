/**
* This is the Login Page
**/



// React native and others libraries imports
import React, { Component } from 'react';
import { Alert } from 'react-native';
import { Container, View, Left, Right, Button, Icon, Item, Input, Text } from 'native-base';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// Our custom files and classes import



export default class ForgotPassword extends Component {
  constructor(props) {
      super(props);
      this.state = {
        email: '',

      };
  }


  render() { 
    return(
      <Container style={{backgroundColor: '#fdfdfd'}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 50, paddingRight: 50}}>
          <View style={{marginBottom: 35, width: '100%'}}>
            <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'left', width: '100%', color: 'red'}}>Forgot your password? </Text>
            <Text style={{fontSize: 15, textAlign: 'left', width: '100%', color: '#687373'}}>Enter your email to find your account. </Text>
          </View>
          <Item>
              <Icon active name='ios-person' style={{color: "#687373"}}  />
              <Input placeholder='Email Address' onChangeText={(text) => this.setState({email: text})} placeholderTextColor="#687373" />
          </Item>
          <View style={{alignItems: 'center'}}>
            <Button onPress={() => this.submitEmail()} style={{backgroundColor: 'red', marginTop: 20}}>
              <Text style={{color: '#fdfdfd'}}>     Submit    </Text>
            </Button>
          </View>
     
        </View>
       
      </Container>
    );
  }


  submitEmail = () => {
    auth()
      .sendPasswordResetEmail(this.state.email)
      .then(function() {
        Alert.alert("Please check your email.");
      })
      .catch(function(error) {
        Alert.alert(error.message);
      });
  };



}
