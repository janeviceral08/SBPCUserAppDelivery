/**
* This is the Checkout Page
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { TouchableHighlight, BackHandler,ScrollView } from 'react-native';
import { Container, View, Grid, Col, Left, Right, Button, Icon, List,Thumbnail, ListItem, Body, Radio, Input, Item,Text,Toast, Root } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../components/Loader';
import CustomHeader from './Header';
// Our custom files and classes import

export default class Profile extends Component {
  constructor(props) {
      super(props);
      this.ref =  firestore();
      this.state = {
        name: '',
        email: '',
        phone: '',
        gender:' ',
        date:'',
        isLoading: false
      };
      this.FetchProfile();
  }

  FetchProfile = () => {
    const userId =  auth().currentUser.uid;
    const ref =  firestore().collection('users').doc(userId);
    ref.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        this.setState({
          key: doc.id,
          name: data.Name,
          email: data.Email,
          phone: data.Mobile,
          gender: data.Gender,
          isLoading: false
        });
      }
    });

  }

  
updateTextInput = (text, field) => {
  const state = this.state
  state[field] = text;
  this.setState(state);
}

  render() {
   
    return(
      <Root>
      <Container style={{backgroundColor: '#fdfdfd'}}>
      <CustomHeader title="Account Information"  Cartoff={true} navigation={this.props.navigation}/>
            <Loader loading={this.state.isLoading}/>
        <ScrollView style={{paddingHorizontal: 10}}>
          <View>
            <Text style={{marginTop: 15, fontSize: 18}}>Personal Information</Text>
            <Text style={{marginTop: 15, fontSize: 10}}>Name</Text>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder={this.state.name}  value={this.state.name} onChangeText={(text) => this.updateTextInput(text, 'name')} placeholderTextColor="#687373" />
            </Item>
            <Text style={{marginTop: 15, fontSize: 10}}>Gender</Text>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder={this.state.gender}  value={this.state.gender} onChangeText={(text) => this.updateTextInput(text, 'gender')} placeholderTextColor="#687373" />
            </Item>
            <Text style={{marginTop: 15, fontSize: 18}}>Contact Information</Text>
            <Text style={{marginTop: 15, fontSize: 10}}>Email Address</Text>
            <Item regular style={{marginTop: 7}}>
                <Input disabled value={this.state.email} onChangeText={(text) => this.updateTextInput(text, 'email')} placeholderTextColor="#687373" />
            </Item>
            <Text style={{marginTop: 15, fontSize: 10}}>Contact No.</Text>
            <Item regular style={{marginTop: 7}}>
                <Input  value={this.state.phone} onChangeText={(text) => this.updateTextInput(text, 'phone')} placeholderTextColor="#687373" />
            </Item>
          </View>
          <View style={{marginTop: 10, marginBottom: 10, paddingBottom: 7}}>
            <Button onPress={() => this.updatUserInfo()} style={{backgroundColor: "tomato"}} block iconLeft>
              <Text style={{color: '#fdfdfd'}}>Update Info</Text>
            </Button>
          </View>
        </ScrollView>
       
      </Container>
      </Root>
    );
  }



   async updatUserInfo() {
    this.setState({
      isLoading: true,
    });
    const userId= await AsyncStorage.getItem('uid');
    const updateRef =  firestore().collection('users').doc(userId);
    updateRef.update({
      Name: this.state.name,
      Mobile: this.state.phone,
      Email: this.state.email,
      Gender: this.state.gender,
      Birthdate: this.state.date
    }).then((docRef) => {   
      
      this.FetchProfile();
     Toast.show({
                  text: "Profile successfully updated.",
                  position: "bottom",
                  type: "success",
                  textStyle: { textAlign: "center" },
                })
    })

}
}
const styles = {
  invoice: {
    paddingLeft: 20,
    paddingRight: 20
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7'
  }
};
