import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  AsyncStorage,
  BackHandler,
  TextInput,
  Alert
} from "react-native";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Icon, ListItem, List , Thumbnail , Col, Body, Grid, Button, Toast, Form, Textarea } from 'native-base';

import Modal from 'react-native-modal';

export default class AddNote extends Component {
  constructor(props) {
    super(props);
    const items = this.props.route.params.items;
    const note = this.props.route.params.note;
    this.state = {
        visibleModal: true,
        Quantity: 1,
        items:[], 
        loading: false,
        note: note,
        id: items
       };

       this.addNote = this.addNote.bind(this);
  }

  
  async addNote (){
    const userId= await AsyncStorage.getItem('uid');
    let document =   firestore().collection('cart').doc(userId).collection('products').doc(this.state.id);
    document.update({
      note: this.state.note
    });
    this.setState({
        visibleModal: true,
    })
    this.props.navigation.goBack()
   }


  render() { 
    return (
        <Modal
        isVisible={this.state.visibleModal === true}
        backdrop={true} transparent={true}>
       <View style={style.content}> 
      
                <View style={{margin: 10}}>
                <Form>
                       <Textarea rowSpan={5} value={this.state.note} bordered placeholder="Your Note Here" onChangeText={(text) => this.setState({note: text})}/>
                </Form>
                </View>
          
       <Button block style={{ height: 30, backgroundColor: "rgba(94,163,58,1)"}}
          onPress={this.addNote}
        >
         <Text style={{color: 'white'}}>DONE</Text>
        </Button>
        
        <Button block style={{ height: 30, backgroundColor:  "rgba(94,163,58,1)", marginTop: 10}}
        >
         <Text style={{color:'white'}}>CANCEL</Text>
        </Button>
      </View>
      </Modal>
    );
  }
}


const style = StyleSheet.create({
  wrapper: {
    // marginBottom: -80,
    backgroundColor: "white",
    height: 80,
    width: "100%",
    padding: 10
  },
  notificationContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start"
  },
 sssage: {
    marginBottom: 2,
    fontSize: 14
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
});