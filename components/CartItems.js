//This is an example code for Bottom Navigation//
import React, { Component } from "react";
//import react in our code.
import { Container, Header, Content, Icon, Accordion, Text, View, Card, CardItem, Thumbnail, Body, Left, Right, Button, Item,ListItem, Form,Textarea } from "native-base";
import {   TouchableOpacity, StyleSheet, Alert} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
//import all the basic component we have used
import Modal from 'react-native-modal';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Loader from "./Loader";

export default class CartItems extends Component {
  
    constructor(props) {
        super(props);    
        this.productsRef  =   firestore().collection('products').where('id', '==', this.props.items.datas.id);
        this.state = {
          user: null,
          email: "",
          password: "",
          formValid: true,
          error: "",
          loading: false,
          data:[],
          store_percentage:'',
          dataSource:[],
          visibleModal: false,
          ItemNote:'',
          id: ''
        };

      }

      onCollectionUpdate = async(querySnapshot) => {
        const stores = [];
        const userId= await AsyncStorage.getItem('uid');
        querySnapshot.forEach((doc) => {
          const prid = doc.data().id;
          const admin_status = doc.data().admin_control;    
          const status = doc.data().status;
          let  document=   firestore().collection('cart').doc(userId).collection('products').doc(prid);
          document.update({
            admin_status: doc.data().admin_control,
            status : doc.data().status,
            stock: doc.data().quantity
          });
      })
      this.setState({loading: false})
    }
      
      componentDidMount() {
        this.setState({loading: true})
          this.unsubscribe = this.productsRef.onSnapshot(this.onCollectionUpdate);   
        }
        
        componentWillUnmount() {
          this.unsubscribe && this.unsubscribe();
         
        }

    async removeItem (prid){
        const userId= await AsyncStorage.getItem('uid');
        let document =   firestore().collection('cart').doc(userId).collection('products').doc(prid);
        Alert.alert(
          'Remove Item?',
          '',
          [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
            {text: 'OK', onPress: () =>  document.delete()},
          ]
        )
      }

      
     
      async  increment (prid){
      const userId= await AsyncStorage.getItem('uid');
      let document =   firestore().collection('cart').doc(userId).collection('products').doc(prid);
      document.update({
        qty:   firestore.FieldValue.increment(1)
      });
     }
  
     async  decrement (prid){
      const userId= await AsyncStorage.getItem('uid');
      let document =   firestore().collection('cart').doc(userId).collection('products').doc(prid);
      document.update({
        qty:   firestore.FieldValue.increment(-1)
      });
     }

     async  addNote (){

       const userId= await AsyncStorage.getItem('uid');
      let document =   firestore().collection('cart').doc(userId).collection('products').doc(this.state.id);
      document.update({
        note: this.state.ItemNote
      });
      this.setState({
          visibleModal: false,
      })
     }

     openModal (note, prid){
      this.setState({
          id: prid,
          ItemNote: note,
          visibleModal: true,
      })
     }
    

     renderProducts() {
      let itemss = [];
      let cartitems = [];
      let cart = cartitems.concat(this.props.items)
      cart.map((item, i) => {
            itemss.push(
                  
            <Card key={i} transparent>
            <CardItem style={{paddingBottom: 0, paddingTop: 0, paddingLeft: 10}}>
            <Thumbnail square style={{height: 130, width: 100, marginVertical: 10}} source={{uri : item.datas.foreground}}/>
              <Body style={{paddingLeft: 10, paddingBottom:0, paddingTop: 10}}>
                  <Text numberOfLines={2} style={{fontSize: 15}}>{item.datas.name}</Text>
                  {!item.datas.sale_price ?                  
                  <Text note style={{fontSize: 10}}>₱{item.datas.price} / {item.datas.unit}</Text>
                  :  <Text note style={{fontSize: 10}}>₱<Text style={{textDecorationLine: 'line-through', fontSize: 10}}>{item.datas.price} </Text> ₱{item.datas.sale_price}/ {item.datas.unit}</Text> }
                 <Text note numberOfLines={1} style={{fontSize: 10}}>by :{item.datas.store_name}</Text>
                  <Text note style={{fontSize: 10}}>Note :{item.datas.note}</Text>      
                  <View style={{ backgroundColor: "white",marginTop: 10,flexDirection: "row",paddingLeft: 50, paddingVertical: 10}}>
                  {item.datas.qty <= 1 ?
                   <TouchableOpacity style={{borderWidth: 0.3, borderColor: 'black', padding: 5, backgroundColor:'white', borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}>
                    <AntDesign name="minuscircleo" size={15} color="rgba(0,0,0, 0.3)"/>
                  </TouchableOpacity> :
                   <TouchableOpacity style={{borderWidth: 0.3, borderColor: 'black', padding: 5, backgroundColor:'white', borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}
                   onPress={() =>this.decrement(item.datas.id)}>
                    <AntDesign name="minuscircleo" size={15} color="rgba(94,163,58,1)"/>
                  </TouchableOpacity>

                  }
                 
                      <Text style={{paddingLeft: 10, paddingRight: 10, backgroundColor: 'white', borderTopWidth:0.3,  borderBottomWidth:0.3}}>{item.datas.qty}</Text>
                  {item.datas.qty == item.datas.stock ?
                  <TouchableOpacity style={{borderWidth: 0.3, borderColor: 'black', padding: 5, backgroundColor:'white', borderTopRightRadius: 10, borderBottomRightRadius: 10,}}>
                      <AntDesign name="pluscircleo" size={15} color="rgba(0,0,0,0.3)"/>
                    </TouchableOpacity> :
                    <TouchableOpacity style={{borderWidth: 0.3, borderColor: 'black', padding: 5, backgroundColor:'white', borderTopRightRadius: 10, borderBottomRightRadius: 10,}}
                    onPress={() =>this.increment(item.datas.id)}>
                        <AntDesign name="pluscircleo" size={15} color="rgba(94,163,58,1)"/>
                      </TouchableOpacity>
                }
                  
                  </View>  
              </Body>
              <Right>
              <TouchableOpacity onPress={() =>this.removeItem(item.datas.id)} style={{paddingTop: 30}}>
                    <Ionicons name="ios-trash" size={25} color="red"/>
              </TouchableOpacity>
              </Right>
          </CardItem>
          {item.datas.admin_status && item.datas.stock != 0 && item.datas.status ?
          <View style={{position: "absolute", alignSelf: "flex-end", padding: 10}}>
              <TouchableOpacity   style={{color:"white", backgroundColor:'#FFFFFF' , flex: 1, justifyContent:'center', alignItems:"center"}} onPress={() => this.openModal(item.datas.note, item.datas.id)}>
              <Text style={{color:"#1aad57" ,fontSize: 13}}><AntDesign name="plus" size={13} color="#1aad57"/>Add Note</Text>
            </TouchableOpacity>
            </View>
          :
          
          <View style={{position: "absolute", alignSelf: "flex-end", padding: 10}}>
            <TouchableOpacity   style={{color:"white", backgroundColor:'red' , flex: 1, justifyContent:'center', alignItems:"center"}}>
              <Text style={{color:"white" , fontSize: 12}}>Product Unavailable</Text>
            </TouchableOpacity>
         </View>

        }
    </Card> 

            );
           

          })
      
      return itemss;
    }
  //Profile Screen to show from Open profile button
  render() {
  
     return(
      <Content>
        <Loader loading={this.state.loading}/>
        {this.renderProducts()}
        <Modal
            isVisible={this.state.visibleModal}
            onBackdropPress={() => this.setState({visibleModal: false})} transparent={true}>
           <View style={style.content}> 
          
                    <View style={{margin: 10}}>
                    <Form>
                           <Textarea rowSpan={5} value={this.state.ItemNote} bordered placeholder="Your Note Here" onChangeText={(text) => this.setState({ItemNote: text})}/>
                    </Form>
                    </View>
              
           <Button block style={{ height: 30, backgroundColor: "rgba(94,163,58,1)"}}
              onPress={() =>this.addNote()}
            >
             <Text style={{color: 'white'}}>DONE</Text>
            </Button>
            
            <Button block style={{ height: 30, backgroundColor:  "rgba(94,163,58,1)", marginTop: 10}}
              onPress={() => this.setState({visibleModal: false})}
            >
             <Text style={{color:'white'}}>CANCEL</Text>
            </Button>
          </View>
          </Modal>
      
     </Content>
 
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