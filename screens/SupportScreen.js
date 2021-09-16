/**
* This is the Checkout Page
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { TouchableHighlight, BackHandler, TouchableOpacity,Linking } from 'react-native';
import { Container, Content, View, Grid, Col, Left, Right, Button, Icon, List,Thumbnail, ListItem, Body, Radio, Input, Item,Text,Toast, Root, Row } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../components/Loader';
import CustomHeader from './Header';
import Zocial from 'react-native-vector-icons/Zocial';
// Our custom files and classes import

export default class SupportScreen extends Component {
  constructor(props) {
      super(props);
      this.ref =  firestore();
      this.state = {
        contact: '',
        email: '',
       isLoading: true,
       fbpage1:'',
       fbpage2:'',
       fbpage3:'',
       fbpage4:'',
       fbpage5:'',
       fblink1:'',
       fblink2:'',
       fblink3:'',
       fblink4:'',
       fblink5:'',
       telno:''
      };
      this.FetchProfile();
  }

  FetchProfile = () => {
    const userId =  auth().currentUser.uid;
    const ref =  firestore().collection('support').doc("BUxmitvW4GHrpKyComzn");
    ref.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        this.setState({
          contact: data.contact,
          telno: data.telno,
          email: data.email,
          fbpage1: data.fbpage1,
          fbpage2: data.fbpage2,
          fbpage3: data.fbpage3,
          fbpage4: data.fbpage4,
          fbpage5: data.fbpage5,
          fblink1: data.fblink1,
          fblink2:data.fblink2,
          fblink3:data.fblink3,
          fblink4:data.fblink4,
          fblink5:data.fblink5,

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
   const {fbpage1, fbpage2, fbpage3, fbpage4, fbpage5, fblink1, fblink2, fblink3,fblink4, fblink5} = this.state;
    return(
      <Root>
      <Container style={{backgroundColor: '#fdfdfd'}}>
      <CustomHeader title="Contact Us"  Cartoff={true} navigation={this.props.navigation}/>
            <Loader loading={this.state.isLoading}/>
        <Content padder>
          <View>
            <Text style={{marginTop: 15, fontSize: 16}}>To Follow up your orders contact:</Text>
            <Text style={{marginTop: 15, fontSize: 10}}>CP #:</Text>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder={this.state.contact}  value={this.state.contact} onChangeText={(text) => this.updateTextInput(text, 'gender')} placeholderTextColor="#687373" disabled/>
            </Item>
            <Text style={{marginTop: 15, fontSize: 10}}>Telephone #:</Text>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder={this.state.telno}  value={this.state.telno} onChangeText={(text) => this.updateTextInput(text, 'gender')} placeholderTextColor="#687373" disabled/>
            </Item>
            <Text style={{marginTop: 15, fontSize: 16}}>To be a Verified User please submit your Selfie with Valid ID at:</Text>
            <Text style={{marginTop: 15, fontSize: 10}}>Email</Text>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder={this.state.email}  value={this.state.email} onChangeText={(text) => this.updateTextInput(text, 'gender')} placeholderTextColor="#687373" disabled/>
            </Item>
          </View>
          <View>
            <Text style={{marginVertical: 15, fontSize: 16}}>For comments and suggestions you can PM us at our facebook page:</Text>
            <Grid>
              <Row />
              <Row />
              {fbpage1 != ''?
              <Row style={{alignItems: 'center'}}><TouchableOpacity style={{flexDirection: 'row'}} onPress={() => Linking.openURL(fblink1).catch(err => console.error('An error occurred', err))} ><Zocial name="facebook" size={15} color="blue"/><Text> {this.state.fbpage1}</Text></TouchableOpacity></Row>: null}
              {fbpage2  != ''?
              <Row style={{alignItems: 'center'}}><TouchableOpacity style={{flexDirection: 'row'}} onPress={() => Linking.openURL(fblink2).catch(err => console.error('An error occurred', err))}><Zocial name="facebook" size={15} color="blue"/><Text> {this.state.fbpage2}</Text></TouchableOpacity></Row>: null}
              {fbpage3   != ''?
              <Row style={{alignItems: 'center'}}><TouchableOpacity style={{flexDirection: 'row'}} onPress={() => Linking.openURL(fblink3).catch(err => console.error('An error occurred', err))}><Zocial name="facebook" size={15} color="blue"/><Text> {this.state.fbpage3}</Text></TouchableOpacity></Row>:null}
              {fbpage4   != ''?
              <Row style={{alignItems: 'center'}}><TouchableOpacity style={{flexDirection: 'row'}} onPress={() => Linking.openURL(fblink4).catch(err => console.error('An error occurred', err))}><Zocial name="facebook" size={15} color="blue"/><Text> {this.state.fbpage4}</Text></TouchableOpacity></Row>:null}
              {fbpage5   != ''?
              <Row style={{alignItems: 'center'}}><TouchableOpacity style={{flexDirection: 'row'}}  onPress={() => Linking.openURL(fblink5).catch(err => console.error('An error occurred', err))}><Zocial name="facebook" size={15} color="blue"/><Text> {this.state.fbpage5}</Text></TouchableOpacity></Row>:null}      
              <Row />
              <Row />
            </Grid>
          </View>
        </Content>
           
      </Container>
      </Root>
    );
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
