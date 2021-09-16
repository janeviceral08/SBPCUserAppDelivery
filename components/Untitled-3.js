import React, { Component } from "react";
import {StyleSheet, FlatList, TouchableOpacity,BackHandler, Alert} from 'react-native';
import { Container, Header, Content, Icon, Accordion, Text, View, Card, CardItem, Thumbnail, Body, Left, Right, Button,List,ListItem } from "native-base";
import Ionicons from 'react-native-vector-icons/Ionicons'
import firebase from '../firebase/firebase'
import AsyncStorage from '@react-native-community/async-storage';
import Loader from "../components/Loader";
import CustomHeader from './Header';

export default class OrderScreen extends Component {
  constructor() {
    super();
    this.ref = firebase.firestore();
    this.unsubscribe = null;
    this.state = {
      user: null,
      email: "",
      password: "",
      formValid: true,
      error: "",
      loading: false,
      dataSource: [],
      uid:''
    };
     }
    
     onCollectionUpdate = (querySnapshot) => {
      const orders = [];
      querySnapshot.forEach((doc) => {
       orders.push ({
              datas : doc.data(),
              key : doc.id
              });
      })
      this.setState({
        dataSource : orders,
        loading: false,
  
     })
  
    }
 
    _bootstrapAsync =async () =>{
      const userId= await AsyncStorage.getItem('uid');
      this.unsubscribe = this.ref.collection('orders').where('userId', '==', userId ).orderBy('OrderNo', 'asc').onSnapshot(this.onCollectionUpdate) ;
      this.setState({ 'uid': userId, loading: false })
      };
 

    componentDidMount() {
      this.setState({loading: true})
      this._bootstrapAsync();
    }



  render() {
    return (
      <Container  style={{flex: 1}}>
      <CustomHeader title="Order History" isHome={true} Cartoff={true} navigation={this.props.navigation}/>
        <Loader loading={this.state.loading}/>
        <Content padder>
        {this.state.uid ? 
  
        <FlatList
               data={this.state.dataSource}
               renderItem={({ item }) => (

                   <Card>
                      <CardItem button onPress={() => this.props.navigation.navigate('OrderDetails',{ 'orders' : item.datas })}>            
                       <Thumbnail square large source={require('../assets/order.png')} />  
                        <Body style={{paddingLeft: 10}}>
                            <Text style={{fontSize: 14, fontWeight:'bold'}}>Order Number: #00{item.datas.OrderNo}</Text>
                            <Text note style={{color:'black', fontSize: 12, fontWeight: 'bold'}}>Date: {item.datas.OrderDetails.Date_Ordered}</Text>
                            <View style={{borderWidth: 0.2, color: 'white', backgroundColor: 'tomato', borderRadius: 6, borderColor: '#ccc', padding: 4}}>
                              <Text note style={{ color: 'white'}}>{item.datas.OrderStatus}</Text>
                            </View>
                        </Body>
             
                      </CardItem>
                    </Card>

               )}
               
           /> : 
                <View style={styles.container}>      
                  <Ionicons name="ios-basket" size={70} color="#CCCCCC" />
                  <Text style={{paddingVertical: 10}}>Your Order List is Empty</Text>
                </View>
           }
        </Content>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
      stepIndicator: {
      marginVertical: 10
    },
    container: {
       
      alignItems: 'center', 
      justifyContent: 'center'
    },
    
    })